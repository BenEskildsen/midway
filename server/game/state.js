
const {randomIn} = require('bens_utils').stochastic;
const {config} = require('../../js/config');

const initGameState = (clientIDs) => {
  const game = {
    time: 0,
    worldSize: {...config.worldSize},
    tickInterval: null,
    entities: {},
  };

  let i = 0;
  for (const clientID of clientIDs) {
    const carrier =
      makeCarrier(
        clientID,
        {
          x: randomIn(25, game.worldSize.width - 25),
          y: i == 0 ? 40 : game.worldSize.height - 40,
        },
        config.startingFighters, // num fighters
        config.startingBombers, // num bombers
      );
    game.entities[carrier.id] = carrier;

    i++;
  }

  return game;
};

let nextID = 1;
const makeCarrier = (clientID, position, numFighters, numBombers) => {
  return {
    clientID, id: nextID++,
    type: "CARRIER",
    isShip: true,

    planes: {FIGHTER: numFighters, BOMBER: numBombers},

    vision: 70,

    position,
    targetPos: {...position},
    speed: 0.2,

    targetEnemy: null,
  };
}

const makePlane = (clientID, position, type, targetPos) => {
  return {
    clientID, id: nextID++,
    type,
    isPlane: true,

    fuel: type == 'FIGHTER' ? 600 : 800,

    vision: type == 'FIGHTER' ? 30 : 45,

    position,
    targetPos,
    speed: type == 'FIGHTER' ? 1.2 : 1,

    targetEnemy: null,
  };
}

module.exports = {
  initGameState,
  makeCarrier,
  makePlane,
};
