
const React = require('react');
const {
  Button, InfoCard, Divider,
  Plot, plotReducer,
  Modal, Indicator,
  Board, SpriteSheet, TextField,
  Slider, Checkbox,
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
  const {session, joinedSessionID, state} = props;
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
        <Settings {...props} />
      ) : null}
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

const Settings = (props) => {
  const {session, joinedSessionID, state} = props;
  let deployment = (
    <div>
      Starting Fighters:
      <Slider value={state.config.startingFighters} min={1} max={100}
        onChange={(startingFighters) => {
          dispatch({type: 'EDIT_SESSION_PARAMS', startingFighters});
          dispatchToServer({type: 'EDIT_SESSION_PARAMS', startingFighters});
        }}
      />
      <div></div>
      Starting Bombers:
      <Slider value={state.config.startingBombers} min={1} max={100}
        onChange={(startingBombers) => {
          dispatch({type: 'EDIT_SESSION_PARAMS', startingBombers});
          dispatchToServer({type: 'EDIT_SESSION_PARAMS', startingBombers});
        }}
      />
    </div>
  );
  if (state.config.isRandomDeployment) {
    deployment = (
      <div>
        Total Starting Planes:
        <Slider value={state.config.totalNumPlanes} min={10} max={200}
          onChange={(totalNumPlanes) => {
            dispatch({type: 'EDIT_SESSION_PARAMS', totalNumPlanes});
            dispatchToServer({type: 'EDIT_SESSION_PARAMS', totalNumPlanes});
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div><b>Settings:</b></div>
      Game ms per tick:
      <Slider value={state.config.msPerTick} min={1} max={1000}
        onChange={(msPerTick) => {
          dispatch({type: 'EDIT_SESSION_PARAMS', msPerTick});
          dispatchToServer({type: 'EDIT_SESSION_PARAMS', msPerTick});
        }}
      />
      <div></div>
      Map Width:
      <Slider value={state.config.worldSize.width} min={100} max={1500}
        onChange={(width) => {
          dispatch({type: 'EDIT_SESSION_PARAMS', worldSize: {...state.config.worldSize, width}});
          dispatchToServer({type: 'EDIT_SESSION_PARAMS', worldSize: {...state.config.worldSize, width}});
        }}
      />
      <div></div>
      Map Height:
      <Slider value={state.config.worldSize.height} min={100} max={800}
        onChange={(height) => {
          dispatch({type: 'EDIT_SESSION_PARAMS', worldSize: {...state.config.worldSize, height}});
          dispatchToServer({type: 'EDIT_SESSION_PARAMS', worldSize: {...state.config.worldSize, height}});
        }}
      />
      <div></div>
      Carriers per player:
      <Slider value={state.config.numCarriers} min={1} max={5}
        onChange={(numCarriers) => {
          dispatch({type: 'EDIT_SESSION_PARAMS', numCarriers});
          dispatchToServer({type: 'EDIT_SESSION_PARAMS', numCarriers});
        }}
      />
      <div></div>
      <Checkbox
        checked={state.config.isRandomDeployment}
        label="Randomize Fighter/Bomber Deployment"
        onChange={(isRandomDeployment) => {
          dispatch({type: 'EDIT_SESSION_PARAMS', isRandomDeployment});
          dispatchToServer({type: 'EDIT_SESSION_PARAMS', isRandomDeployment});
        }}
      />

      {deployment}
    </div>
  );
};


module.exports = Lobby;
