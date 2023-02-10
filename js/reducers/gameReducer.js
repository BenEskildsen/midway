// @flow

const {config} = require('../config');
const {clamp, subtractWithDeficit} = require('bens_utils').math;
const {
  randomIn, normalIn, oneOf, weightedOneOf,
} = require('bens_utils').stochastic;


const gameReducer = (game, action) => {
  switch (action.type) {
    case 'SET': {
      for (const prop in action) {
        if (prop == 'type') continue;
        game[prop] = action[prop];
      }
      return {...game};
    }
    case 'SET_ENTITIES': {
      const selectedIDs = []
      for (const id of game.selectedIDs) {
        let included = false;
        for (const entityID in action.entities) {
          if (id == entityID) {
            included = true;
            break;
          }
        }
        if (included) selectedIDs.push(id);
      }
      return {
        ...game,
        selectedIDs,
        entities: action.entities,
      };
    }
    case 'SELECT_ENTITIES': {
      const {square} = action;
      let selectedIDs = [];
      for (const entityID in game.entities) {
        const entity = game.entities[entityID];
        if (entity.clientID != game.clientID) continue;
        if (
          entity.position.x >= square.x && entity.position.x <= square.x + square.width &&
          entity.position.y >= square.y && entity.position.y <= square.y + square.height
        ) {
          if (entity.type == 'CARRIER') {
            selectedIDs = [entityID];
            break;
          }
          selectedIDs.push(entityID);
        }
      }
      return {
        ...game,
        selectedIDs,
      };
    }


    // NOT USING
    case 'START_TICK': {
      if (game != null && game.tickInterval != null) {
        return game;
      }
      game.prevTickTime = new Date().getTime();
      return {
        ...game,
        tickInterval: setInterval(
          // HACK: store is only available via window
          () => store.dispatch({type: 'TICK'}),
          config.msPerTick,
        ),
      };
    }
    case 'STOP_TICK': {
      clearInterval(game.tickInterval);
      game.tickInterval = null;

      return game;
    }
    case 'TICK': {
      game.time += 1;

      return game;
    }

    case 'LAUNCH_PLANE': {
      const {plane} = action;
      game.entities[plane.id] = plane;
      return game;
    }
    case 'SET_TARGET': {
      const {entityID, targetPos} = action;
      const entity = game.entities[entityID];
      if (!entity) break;
      entity.targetPos = targetPos;
      return game;
    }
    case 'REVEAL_ENTITY': {

      return game;
    }
  }
  return game;
}


module.exports = {gameReducer}
