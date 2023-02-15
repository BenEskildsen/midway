// @flow

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
  }
  return game;
}


module.exports = {gameReducer}
