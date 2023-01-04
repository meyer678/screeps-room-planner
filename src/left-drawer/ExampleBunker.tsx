import * as Mui from '@mui/material';
import * as Icons from '@mui/icons-material';
import { State, useHookstate } from '@hookstate/core';
import { MAX_RCL, SAMPLE_JSON, SETTINGS } from '../utils/constants';
import { RoomGridMap, RoomGridTerrain, RoomStructures } from '../utils/types';
import { getRoomTile } from '../utils/helpers';

export default function ExampleBunker(props: {
  roomGridState: State<RoomGridMap>;
  roomStructuresState: State<RoomStructures>;
  roomTerrainState: State<RoomGridTerrain>;
  settingsState: State<typeof SETTINGS>;
  wipeStructures: () => void;
  wipeTerrain: () => void;
}) {
  const roomGridState = useHookstate(props.roomGridState);
  const roomStructuresState = useHookstate(props.roomStructuresState);
  const settingsState = useHookstate(props.settingsState);

  return (
    <Mui.Button
      onMouseDown={() => {
        props.wipeStructures();
        props.wipeTerrain();

        settingsState.rcl.set(MAX_RCL);

        Object.entries(SAMPLE_JSON.structures).forEach(([structure, positions]) => {
          roomStructuresState[structure].merge(positions);
          positions.forEach((pos) => {
            const tile = getRoomTile(pos.x, pos.y);
            roomGridState[tile].merge([structure]);
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
