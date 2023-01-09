import { useContext } from 'react';
import { createCtx } from './CreateCtx';

type State = number;

type Action = { type: 'set_hover'; tile: number } | { type: 'reset' };

const initialState: State = -1;

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'set_hover':
      return action.tile;
    case 'reset':
      return initialState;
    default:
      throw new Error(`Unknown action for RoomGridContext: ${action}`);
  }
}

const [ctx, HoverTileProvider] = createCtx(reducer, initialState);

function useHoverTile() {
  const context = useContext(ctx);
  if (context === undefined) {
    throw new Error('useHoverTile must be used within a HoverTileProvider');
  }
  const { state, dispatch } = context;
  return {
    hoverTile: state,
    updateHoverTile: dispatch,
  };
}

export { HoverTileProvider, initialState, useHoverTile };
