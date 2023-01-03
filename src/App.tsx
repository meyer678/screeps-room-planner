import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import { useHookstate } from '@hookstate/core';

import TopBar from './layout/TopBar';
import LeftDrawer from './layout/LeftDrawer';
import RoomGrid from './layout/RoomGrid';
import { SETTINGS } from './utils/constants';
import { RoomGridMap, RoomGridTerrain, RoomStructures } from './utils/types';
import { getStructureBrushes } from './utils/helpers';
import BottomDrawer from './layout/BottomDrawer';

export default function App() {
  const settingsState = useHookstate(SETTINGS);
  const roomGridState = useHookstate<RoomGridMap>({});
  const roomGridHoverState = useHookstate(-1);
  const roomStructuresState = useHookstate<RoomStructures>({});
  const roomTerrainState = useHookstate<RoomGridTerrain>({});
  const brushes = getStructureBrushes(settingsState.nested('rcl').get());

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <TopBar />
      <LeftDrawer
        roomGridState={roomGridState}
        roomGridHoverState={roomGridHoverState}
        roomStructuresState={roomStructuresState}
        roomTerrainState={roomTerrainState}
        settingsState={settingsState}
        structureBrushes={brushes}
      />
      <Box component='main' sx={{ background: ({ palette }) => palette.secondary.dark, flexGrow: 1, p: 3 }}>
        <Toolbar variant='dense' />
        <RoomGrid
          roomGridState={roomGridState}
          roomGridHoverState={roomGridHoverState}
          roomStructuresState={roomStructuresState}
          roomTerrainState={roomTerrainState}
          settingsState={settingsState}
          structureBrushes={brushes}
        />
      </Box>
      <BottomDrawer settingsState={settingsState} roomStructuresState={roomStructuresState} />
    </Box>
  );
}
