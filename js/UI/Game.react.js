const React = require('react');
const {
  Button, InfoCard, Divider,
  Plot, plotReducer,
  Canvas, RadioPicker,
  Modal, Indicator,
  useMouseHandler,
} = require('bens_ui_components');
const {dispatchToServer} = require('../clientToServer');
import postVisit from '../postVisit';
const {render} = require('../render');
const {useState, useMemo, useEffect, useReducer} = React;


function Game(props) {
  const {state, dispatch, getState} = props;
  const game = state.game;

  // initializations
  useEffect(() => {
    postVisit('/game', 'GET');
  }, []);

  // rendering
  useEffect(() => {
    render(state);
  }, [game.entities, game.selectedIDs, game.marquee]);

  // mouse
  useMouseHandler(
    "canvas", {dispatch, getState},
    {
      leftDown: (state, dispatch, pos) => {
        dispatch({type: 'SET', marquee: {...pos, width: 0, height: 0}});
      },
      mouseMove: (state, dispatch, pos) => {
        if (!state?.mouse?.isLeftDown) return;
        dispatch({type: 'SET', marquee: {...state.game.marquee,
          width: pos.x - state.game.marquee.x,
          height: pos.y - state.game.marquee.y,
        }});
      },
      leftUp: (state, dispatch, pos) => {
        let square = {...state.game.marquee};
        if (square.width < 0) {
          square.x += square.width;
          square.width *= -1;
        }
        if (square.height < 0) {
          square.y += square.height;
          square.height *= -1;
        }
        dispatch({type: 'SELECT_ENTITIES', square});
        dispatch({type: 'SET', marquee: null});
      },
      rightDown: (state, dispatch, pos) => {
        for (const entityID of state.game.selectedIDs) {
          const entity = state.game.entities[entityID];
          if (entity.type == 'CARRIER' && state.game.clickMode == 'LAUNCH') {
            dispatchToServer({
              type: 'LAUNCH_PLANE', targetPos: pos, carrierID: entityID,
              planeType: state.game.launchType,
            });
          } else {
            dispatchToServer({type: 'SET_TARGET', targetPos: pos, entityID});
          }
        }
      },
    },
  );

  // selectionCard
  let selectionCard = null;
  if (game.selectedIDs.length > 0) {
    const selections = {
      'CARRIER': 0,
      'FIGHTER': 0,
      'BOMBER': 0,
    };
    for (const entityID of game.selectedIDs) {
      const entity = game.entities[entityID];
      selections[entity.type] += 1;
    }
    let selectionContent = (
      <div>
        {selections.FIGHTER > 0 ? (<div>Fighters: {selections.FIGHTER}</div>) : null}
        {selections.BOMBER > 0 ? (<div>Bombers: {selections.BOMBER}</div>) : null}
      </div>
    );
    if (selections.CARRIER > 0) {
     const carrier = game.entities[game.selectedIDs[0]];
     selectionContent = (
        <div>
          Carrier
          <div
            style={{

            }}
          >
            <div>Fighters: {carrier.planes.FIGHTER}</div>
            <div>Bombers: {carrier.planes.BOMBER}</div>
          </div>
          <div>
            <div>Control Mode:</div>
            <RadioPicker
              options={['MOVE', 'LAUNCH']}
              selected={state.game.clickMode}
              onChange={(clickMode) => dispatch({type: 'SET', clickMode})}
            />
          </div>
          {state.game.clickMode == 'LAUNCH' ? (
            <div>
              <div>Launch Type: </div>
              <RadioPicker
                options={['FIGHTER', 'BOMBER']}
                selected={state.game.launchType}
                onChange={(launchType) => dispatch({type: 'SET', launchType})}
              />
            </div>
          ) : null}
        </div>
      );
    }
    selectionCard = (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          border: '1px solid black',
          padding: 8,
          margin: 4,
          minWidth: 150,
        }}
      >
        {selectionContent}
      </div>
    );
  }


  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas
        width={game.worldSize.width}
        height={game.worldSize.height}
      />
      {selectionCard}
    </div>
  );
}

function registerHotkeys(dispatch) {
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'space',
    fn: (s) => {
      const game = s.getState().game;
      if (game.policy == null) {
        s.dispatch({type: 'TICK'});
      }
    }
  });
}

module.exports = Game;
