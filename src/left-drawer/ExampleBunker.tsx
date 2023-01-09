import * as Mui from '@mui/material';
import * as Icons from '@mui/icons-material';
import { MAX_RCL, SAMPLE_JSON } from '../utils/constants';
import { getRoomTile } from '../utils/helpers';
import { useSettings } from '../contexts/SettingsContext';
import { useRoomGrid } from '../contexts/RoomGridContext';
import { useRoomStructures } from '../contexts/RoomStructuresContext';

export default function ExampleBunker(props: { wipeStructures: () => void; wipeTerrain: () => void }) {
  const { updateSettings } = useSettings();
  const { updateRoomGrid } = useRoomGrid();
  const { updateRoomStructures } = useRoomStructures();

  return (
    <Mui.Button
      onMouseDown={() => {
        props.wipeStructures();
        props.wipeTerrain();

        updateSettings({ type: 'set_rcl', rcl: MAX_RCL });

        Object.entries(SAMPLE_JSON.structures).forEach(([structure, positions]) => {
          positions.forEach((pos) => {
            const tile = getRoomTile(pos.x, pos.y);
            updateRoomGrid({ type: 'add_structure', tile, structure });
            updateRoomStructures({ type: 'add_structure', structure, x: pos.x, y: pos.y });
          });
        });
      }}
      variant='text'
      endIcon={<Icons.AutoFixHigh />}
    >
      Example Bunker
    </Mui.Button>
  );
}
