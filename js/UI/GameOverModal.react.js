const React = require('react');
const {Modal} = require('bens_ui_components');
const {dispatchToServer} = require('../clientToServer');
const {useEffect, useState, useMemo} = React;

const GameOverModal = (props) => {
  const {winner} = props;
  const state = getState(); // HACK this comes from window;

  return (
    <Modal
      title={winner == state.clientID ? 'You Win!' : 'You Lose!'}
      body={winner == state.clientID ? "You sunk the enemy carrier" : "Your carrier was sunk"}
      buttons={[{
        label: 'Back to Menu', onClick: () => {
          dispatch({type: 'DISMISS_MODAL'});
          dispatch({type: 'SET_SCREEN', screen: 'LOBBY'});
          dispatchToServer({type: 'LEAVE_SESSION'});
        }
      }]}
    />
  );
};

module.exports = GameOverModal;

