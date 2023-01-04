import * as Mui from '@mui/material';
import { useHookstate } from '@hookstate/core';

import LeftDrawer from './left-drawer/LeftDrawer';
import RoomGrid from './room-grid/RoomGrid';
import { SETTINGS } from './utils/constants';
import { RoomGridMap, RoomGridTerrain, RoomStructures } from './utils/types';
import { getStructureBrushes } from './utils/helpers';
import BottomDrawer from './bottom-drawer/BottomDrawer';

export default function App() {
  const settingsState = useHookstate(SETTINGS);
  const roomGridState = useHookstate<RoomGridMap>({});
  const roomGridHoverState = useHookstate(-1);
  const roomStructuresState = useHookstate<RoomStructures>({});
  const roomTerrainState = useHookstate<RoomGridTerrain>({});
  const brushes = getStructureBrushes(settingsState.nested('rcl').get());

  return (
    <Mui.Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Mui.CssBaseline />
      <Mui.AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Mui.Toolbar variant='dense'>
          <Mui.Typography variant='h6' noWrap component='div'>
            Screeps Room Planner
          </Mui.Typography>
        </Mui.Toolbar>
      </Mui.AppBar>
      <LeftDrawer
        roomGridState={roomGridState}
        roomGridHoverState={roomGridHoverState}
        roomStructuresState={roomStructuresState}
        roomTerrainState={roomTerrainState}
        settingsState={settingsState}
        structureBrushes={brushes}
      />
      <Mui.Box component='main' sx={{ background: ({ palette }) => palette.secondary.dark, flexGrow: 1, p: 3 }}>
        <Mui.Toolbar variant='dense' />
        <RoomGrid
          roomGridState={roomGridState}
          roomGridHoverState={roomGridHoverState}
          roomStructuresState={roomStructuresState}
          roomTerrainState={roomTerrainState}
          settingsState={settingsState}
          structureBrushes={brushes}
        />
      </Mui.Box>
      <BottomDrawer settingsState={settingsState} roomStructuresState={roomStructuresState} />
    </Mui.Box>
  );
}
