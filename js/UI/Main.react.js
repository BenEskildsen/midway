const React = require('react');
const {Button, InfoCard, Modal} = require('bens_ui_components');
const Game = require('./Game.react');
const Lobby = require('./Lobby.react');
const {setupSocket} = require('../clientToServer');
const {useEnhancedReducer} = require('bens_ui_components');
const {rootReducer, initState} = require('../reducers/rootReducer');
import postVisit from '../postVisit';
const {useEffect, useState, useMemo} = React;


function Main(props) {
  const [state, dispatch, getState] = useEnhancedReducer(
    rootReducer, initState(),
  );
  window.getState = getState;
  window.dispatch = dispatch;

  useEffect(() => {
    postVisit('/index', 'GET');
    setupSocket(dispatch);
  }, []);

  let content = null;
  if (state.screen === 'LOBBY') {
    content = <Lobby dispatch={dispatch} state={getState()} getState={getState} />
  } else if (state.screen === 'GAME') {
    content = <Game dispatch={dispatch} state={getState()} getState={getState} />
  }

  return (
    <React.Fragment>
      {content}
      {state.modal}
    </React.Fragment>
  )
}

module.exports = Main;
