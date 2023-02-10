
const React = require('react');
const {
  Button, InfoCard, Divider,
  Plot, plotReducer,
  Modal, Indicator,
  Board, SpriteSheet, TextField,
  CheckerBackground,
} = require('bens_ui_components');
const {dispatchToServer} = require('../clientToServer');
const {isHost, getSession} = require('../selectors/sessions');
const {useEffect, useState, useMemo} = React;

const Lobby = (props) => {
  const {dispatch, state, getState} = props;

  const sessionCards = [];
  for (const sessionID in state.sessions) {
    sessionCards.push(<SessionCard
      key={"sessionCard_" + sessionID}
      state={state}
      session={state.sessions[sessionID]}
      joinedSessionID={getSession(state)?.id}
    />);
  }

  return (
    <div
      style={{
        width: 300,
        margin: 'auto',
        marginTop: 100,
      }}
    >
      <CreateGameCard />
      {sessionCards}
    </div>
  );
};

const CreateGameCard = (props) => {
  const [name, setName] = useState('');
  return (
    <InfoCard
      style={{
        width: 300,
      }}
    >
      Game Name:&nbsp;
      <TextField
        value={name}
        onChange={setName}
      />
      <Button
        label="Create Game"
        style={{
          width: 300,
          height: 30,
          marginTop: 8,
        }}
        onClick={() => {
          dispatchToServer({type: 'CREATE_SESSION', name: name != '' ? name : null});
        }}
      />
    </InfoCard>
  );
}

const SessionCard = (props) => {
  const {session, joinedSessionID} = props;
  const {id, name, clients} = session;
  return (
    <InfoCard
      style={{
        width: 300,
      }}
    >
      <div style={{textAlign: 'center'}}><b>{name}</b></div>
      Players: {clients.length}
      {joinedSessionID == id ? (
        <Button
          style={{
            width: 300,
            height: 30,
          }}
          disabled={clients.length < 2}
          label={"Ready"}
          onClick={() => {
            if (isHost(props.state)) {
              dispatchToServer({type: 'START'});
            }
          }}
        />
      ) : (
        <Button
          style={{
            width: 300,
            height: 30,
          }}
          disabled={clients.length >= 2}
          label={"Join Game"}
          onClick={() => {
            dispatchToServer({type: 'JOIN_SESSION', sessionID: id});
          }}
        />
      )}

    </InfoCard>
  );
};


module.exports = Lobby;
