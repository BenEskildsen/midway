
const {randomIn} = require('bens_utils').stochastic;

const initGameState = (clientIDs, config) => {
  const game = {
    time: 0,
    worldSize: {...config.worldSize},
    tickInterval: null,
    entities: {},
    stats: {},
  };

  let startingFighters = config.startingFighters;
  let startingBombers = config.startingBombers;
  if (config.isRandomDeployment) {
    startingFighters = 5 + randomIn(0, config.totalNumPlanes - 10);
    startingBombers = config.totalNumPlanes - startingFighters;
  }

  let i = 0;
  for (const clientID of clientIDs) {
    for (let j = 0; j < config.numCarriers; j++) {
      const carrier =
        makeCarrier(
          clientID,
          {
            x: randomIn(40, game.worldSize.width - 40),
            y: i == 0 ? 40 : game.worldSize.height - 40,
          },
          startingFighters, startingBombers,
        );
      game.entities[carrier.id] = carrier;
    }

    game.stats[clientID] = {
      'fighters_shot_down': 0,
      'bombers_shot_down': 0,
      'fighters_no_fuel': 0,
      'bombers_no_fuel': 0,
      'fighter_sorties': 0,
      'bomber_sorties': 0,
      'fighter_aces': 0,
      'ships_sunk': 0,
    },
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
    speed: 0.3,

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
    kills: 0,
  };
}

module.exports = {
  initGameState,
  makeCarrier,
  makePlane,
};
