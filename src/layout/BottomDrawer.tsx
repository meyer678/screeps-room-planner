import { State, useHookstate } from '@hookstate/core';
import * as Mui from '@mui/material';

import { SETTINGS } from '../utils/constants';
import { RoomStructures } from '../utils/types';
import HighlightCode from './HighlightCode';

export default function BottomDrawer(props: {
  roomStructuresState: State<RoomStructures>;
  settingsState: State<typeof SETTINGS>;
}) {
  const roomStructuresState = useHookstate(props.roomStructuresState);
  const settingsState = useHookstate(props.settingsState);
  const { rcl } = settingsState.get();

  return (
    <Mui.Drawer
      anchor='bottom'
      open={settingsState.bottomDrawerOpen.get()}
      onClose={() => settingsState.bottomDrawerOpen.set(false)}
      sx={{
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          boxSizing: 'border-box',
        },
      }}
    >
      <Mui.Card sx={{ borderRadius: 0, maxHeight: '50vh', overflowY: 'auto' }}>
        <Mui.CardContent>
          <HighlightCode
            code={JSON.stringify({
              rcl,
              buildings: roomStructuresState.get(),
            })}
          />
        </Mui.CardContent>
      </Mui.Card>
    </Mui.Drawer>
  );
}
