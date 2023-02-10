
const getCarrier = (game, clientID) => {
  for (const entityID in game.entities) {
    const entity = game.entities[entityID];
    if (entity.type == 'CARRIER' && entity.clientID == clientID) {
      return entity;
    }
  }
  return null;
};

const getEntitiesByPlayer = (game, clientID) => {
  let entities = {};
  for (const entityID in game.entities) {
    const entity = game.entities[entityID];
    if (entity.clientID == clientID) {
      entities[entity.id] = entity;
    }
  }
  return entities;
}

const getOtherClientID = (session, clientID) => {
  for (const id of session.clients) {
    if (id != clientID) return id;
  }
};

module.exports = {
  getCarrier,
  getEntitiesByPlayer,
  getOtherClientID,
};
