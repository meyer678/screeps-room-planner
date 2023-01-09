import { useContext } from 'react';
import { createCtx } from './CreateCtx';

type State = { [tile: number]: string };

type Action =
  | { type: 'add_terrain'; tile: number; terrain: string }
  | { type: 'remove_terrain'; tile: number }
  | { type: 'reset' };

const initialState: State = {};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'add_terrain':
      return { ...state, [action.tile]: action.terrain };
    case 'remove_terrain':
      delete state[action.tile];
      return state;
    case 'reset':
      return initialState;
    default:
      throw new Error(`Unknown action for RoomGridContext: ${action}`);
  }
}

const [ctx, RoomTerrainProvider] = createCtx(reducer, initialState);

function useRoomTerrain() {
  const context = useContext(ctx);
  if (context === undefined) {
    throw new Error('useRoomTerrain must be used within a RoomTerrainProvider');
  }
  return {
    roomTerrain: context.state,
    updateRoomTerrain: context.dispatch,
  };
}

export { RoomTerrainProvider, useRoomTerrain };
