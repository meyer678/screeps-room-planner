import { useContext } from 'react';
import { createCtx } from './CreateCtx';
import { MAX_RCL, STRUCTURE_CONTROLLER } from '../utils/constants';

const initialState = {
  codeDrawerOpen: false,
  brush: STRUCTURE_CONTROLLER,
  hover: -1,
  rcl: MAX_RCL,
  room: 'E3S1',
  shard: 'shard0',
};

type State = typeof initialState;

type Action =
  | { type: 'set_brush'; brush: string }
  | { type: 'set_hover'; tile: number }
  | { type: 'set_rcl'; rcl: number }
  | { type: 'set_room'; room: string }
  | { type: 'set_shard'; shard: string }
  | { type: 'toggle_code_drawer_open' }
  | { type: 'unset_hover' };

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'set_brush':
      return { ...state, brush: action.brush };
    case 'set_hover':
      return { ...state, tile: action.tile };
    case 'set_rcl':
      return { ...state, rcl: action.rcl };
    case 'set_room':
      return { ...state, room: action.room };
    case 'set_shard':
      return { ...state, shard: action.shard };
    case 'toggle_code_drawer_open':
      return { ...state, codeDrawerOpen: state.codeDrawerOpen! };
    case 'unset_hover':
      return { ...state, tile: initialState.hover };
    default:
      throw new Error(`Unknown action for SettingsContext: ${action}`);
  }
}

const [ctx, SettingsProvider] = createCtx(reducer, initialState);

function useSettings() {
  const context = useContext(ctx);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return {
    settings: context.state,
    updateSettings: context.dispatch,
  };
}

export { SettingsProvider, useSettings };
