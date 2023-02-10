const {
  leaveSession, emitToSession, emitToAllClients,
} = require('../sessions');
const {
  initGameState, makeCarrier, makePlane,
} = require('./state');
const {
  makeVector, vectorTheta, subtract, add, dist, equals,
} = require('bens_utils').vectors;
const {
  getEntitiesByPlayer, getCarrier, getOtherClientID,
} = require('./selectors');
const {config} = require('../../js/config');


const gameReducer = (state, action, clientID, socket, dispatch) => {
  const {sessions, socketClients, clientToSession} = state;


  let session = sessions[clientToSession[clientID]];
  if (!session) return state;

  const game = session.game;
  switch (action.type) {
    case 'START': {
      console.log("Start");
      // const session = sessions[clientToSession[clientID]];
      session.game = {
        ...initGameState(session.clients),
        prevTickTime: new Date().getTime(),
        tickInterval: setInterval(
          // HACK: dispatch is only available via dispatch function above
          () => dispatch({type: 'TICK'}),
          config.msPerTick,
        ),
      };

      for (const id of session.clients) {
        const clientAction = {
          type: "START",
          entities: getEntitiesByPlayer(session.game, id),
        }
        socketClients[id].emit('receiveAction', clientAction);
      }
      break;
    }
    case 'LAUNCH_PLANE': {
      const {planeType, carrierID, targetPos} = action;
      const carrier = game.entities[carrierID];
      // const carrier = getCarrier(game, clientID);

      // check that this plane is launchable
      if (carrier.planes[planeType] <= 0) break;
      carrier.planes[planeType]--;

      const plane = makePlane(clientID, {...carrier.position}, planeType, targetPos);
      game.entities[plane.id] = plane;

      const clientAction = {
        ...action,
        plane,
      };

      // emitToSession(session, socketClients, clientAction, clientID, true);
      break;
    }
    case 'SET_TARGET': {
      const {entityID, targetPos} = action;
      const entity = game.entities[entityID];
      if (!entity) break;
      entity.targetPos = targetPos;

      // only need to send to clients that can see this entity
      // emitToSession(session, socketClients, action, clientID, true);
      break;
    }
    case 'TICK': {
      game.time += 1;

      // move and fight entities
      for (const entityID in game.entities) {
        entity = game.entities[entityID];
        if (!entity.speed) continue;

        // check for enemy already targetted
        let targetPos = entity.targetPos;
        let isEnemy = false;
        if (entity.targetEnemy) {
          const targetEntity = game.entities[entity.targetEnemy];
          if (!targetEntity) {
            // if enemy is dead
            entity.targetEnemy = null;
          } else {
            isEnemy = true;
            targetPos = {...targetEntity.position};
          }
        }

        // no target
        if (targetPos == null) {
          // planes without target go back to ship
          if (entity.isPlane) {
            targetPos = {...getCarrier(game, entity.clientID).position};
          }
        }

        // arrived at target
        if (targetPos != null && dist(targetPos, entity.position) < 2) {
          if (entity.isShip) {
            entity.targetPos = null; // ships can stay still
          } else if (entity.targetPos == null) {
            // we've arrived at home carrier
            delete game.entities[entity.id];
            getCarrier(game, entity.clientID).planes[entity.type]++;
          } else if (isEnemy) {
            // kill the enemy
            const targetEntity = game.entities[entity.targetEnemy];
            // if enemy is targeting you too, then flip a coin whether you die instead
            if (entity.type == 'FIGHTER' && targetEntity.type == 'FIGHTER' &&
              targetEntity.targetEnemy == entityID && Math.random() < 0.5
            ) {
              delete game.entities[entityID];
              continue;
            }
            if (targetEntity.type == 'CARRIER') {
              emitToSession(
                session, socketClients,
                {type: 'GAME_OVER', winner: entity.clientID},
                clientID, true, // include self
              );
              clearInterval(game.tickInterval);
              game.tickInterval = null;
              return state;
            } else {
              delete game.entities[targetEntity.id];
            }
          } else {
            entity.targetPos = null; // return to carrier on next tick
          }
        }

        // do the move
        if (targetPos != null) {
          const moveVec = makeVector(
            vectorTheta(subtract(targetPos, entity.position)),
            entity.speed,
          );
          entity.position = add(entity.position, moveVec);
        }
        if (entity.fuel) {
          entity.fuel -= entity.speed;
        }

        // compute running out of fuel
        if (entity.fuel <= 0) {
          delete game.entities[entity.id];
        }
      }


      // compute vision and targetting
      for (const id of session.clients) {
        const otherClientID = getOtherClientID(session, id);
        const visibleEntities = {};
        for (const entityID in getEntitiesByPlayer(game, id)) {
          const entity = game.entities[entityID];
          for (const otherID in getEntitiesByPlayer(game, otherClientID)) {
            // if (visibleEntities[otherID]) continue;
            const other = game.entities[otherID];
            if (dist(entity.position, other.position) <= entity.vision) {
              visibleEntities[otherID] = other;
              // target:
              if (entity.type == 'FIGHTER' && entity.targetEnemy == null && other.isPlane) {
                entity.targetEnemy = otherID;
              }
              if (entity.type == 'BOMBER' && entity.targetEnemy == null && other.isShip) {
                entity.targetEnemy = otherID;
              }
            }
          }
        }
        const clientAction = {
          type: "SET_ENTITIES",
          entities: {...getEntitiesByPlayer(game, id), ...visibleEntities},
        };
        socketClients[id].emit("receiveAction", clientAction);
      }
      break;
    }
    default: {
      if (!session) break;
      emitToSession(session, socketClients, action, clientID);
    }
  }

  return state;
};


module.exports = {gameReducer};
