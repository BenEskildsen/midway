const isLocalHost = false;

const config = {
  isLocalHost,

  URL: isLocalHost ? null : "https://benhub.io",
  path: isLocalHost ? null : "/midway/socket.io",

  msPerTick: 200,

  worldSize: {width: 900, height: 450},

  // for random:
  isRandomDeployment: false,
  totalNumPlanes: 30,

  // for non-random:
  startingFighters: 10,
  startingBombers: 20,

  numCarriers: 1,
}

module.exports = {
  config,
};
