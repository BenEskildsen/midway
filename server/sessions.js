
const leaveSession = (state, clientID) => {
  const {sessions, socketClients, clientToSession} = state;
  const session = sessions[clientToSession[clientID]];
  if (!session) return;
  session.clients = session.clients.filter(id => id != clientID);
  emitToAllClients(socketClients,
    {type: 'UPDATE_SESSION', session}, clientID, true /* includeSelf */
  );
}

const emitToAllClients = (
  socketClients, action, clientID, includeSelf,
) => {
  for (const id in socketClients) {
    if (id == clientID && !includeSelf) continue;
    const socket = socketClients[id];
    socket.emit('receiveAction', action);
  }
};

const emitToSession = (
  session, socketClients,
  action, clientID, includeSelf,
) => {
  for (const id of session.clients) {
    if (id == clientID && !includeSelf) continue;
    const socket = socketClients[id];
    socket.emit('receiveAction', action);
  }
}

const sessionReducer = (state, action, clientID, socket, newSession) => {
  const {sessions, socketClients, clientToSession} = state;

  switch (action.type) {
    case 'CREATE_SESSION': {
      const {name} = action;
      let session = newSession(clientID);
      if (name) {
        session.name = name;
      }
      sessions[session.id] = session;
      clientToSession[clientID] = session.id;
      emitToAllClients(socketClients,
        {...action, session, clientID}, clientID, true /* includeSelf */
      );
      break;
    }
    case 'JOIN_SESSION': {
      const {sessionID} = action;
      const session = sessions[sessionID];
      if (!session) break;

      session.clients.push(clientID);
      clientToSession[clientID] = session.id;

      // tell the rest of the clients this one joined the session
      emitToAllClients(socketClients, {...action, clientID}, clientID, true);
      break;
    }
    case 'LEAVE_SESSION': {
      const session = sessions[clientToSession[clientID]];
      leaveSession(state, clientID);
      if (session.clients.length == 0) {
        const sessionID = session.id;
        delete sessions[sessionID];
        for (const id in clientToSession) {
          if (clientToSession[id] == sessionID) {
            delete clientToSession[id];
          }
        }
        emitToAllClients(socketClients, {type: 'END_SESSION', sessionID}, clientID, true /* include self */);
      }
      break;
    }
    case 'END_SESSION': {
      const {sessionID} = action;
      delete sessions[sessionID];
      for (const id in clientToSession) {
        if (clientToSession[id] == sessionID) {
          delete clientToSession[id];
        }
      }
      emitToAllClients(socketClients, action, clientID, true /* include self */);
      break;
    }
  }

  return state;
};


module.exports = {
  leaveSession, emitToAllClients, emitToSession,
  sessionReducer,
}
