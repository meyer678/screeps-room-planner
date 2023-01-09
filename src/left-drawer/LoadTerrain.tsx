import * as Mui from '@mui/material';
import * as Icons from '@mui/icons-material';
import { ROOM_SIZE, TERRAIN_MASK, TERRAIN_MASK_SWAMP, TERRAIN_MASK_WALL } from '../utils/constants';
import { getRoomTile } from '../utils/helpers';
import { ScreepsGameRoomTerrain } from '../utils/types';
import { useSettings } from '../contexts/SettingsContext';
import { useRoomTerrain } from '../contexts/RoomTerrainContext';
import { useState } from 'react';
import StyledDialog from '../common/StyledDialog';
import { useRoomGrid } from '../contexts/RoomGridContext';
import { useRoomStructures } from '../contexts/RoomStructuresContext';

function DialogTitle(props: Mui.DialogTitleProps & { onClose?: () => void }) {
  const { children, onClose, ...other } = props;

  return (
    <Mui.DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <Mui.IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icons.Close />
        </Mui.IconButton>
      ) : null}
    </Mui.DialogTitle>
  );
}

export default function LoadTerrain(props: { toggleModalOpen: () => void }) {
  const { settings, updateSettings } = useSettings();
  const { shard, room } = settings;
  const { updateRoomGrid } = useRoomGrid();
  const { updateRoomStructures } = useRoomStructures();
  const { updateRoomTerrain } = useRoomTerrain();

  const [wipeStructuresChecked, setWipeStructuresChecked] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<Error | null>(null);
  const roomTiles = [...Array(ROOM_SIZE)];

  const toggleModalOpen = () => setModalOpen(!modalOpen);

  return (
    <>
      <Mui.Button onMouseDown={toggleModalOpen} variant='outlined' endIcon={<Icons.DownloadForOfflineOutlined />}>
        Load Terrain
      </Mui.Button>
      <StyledDialog open={modalOpen} onClose={toggleModalOpen}>
        <DialogTitle onClose={toggleModalOpen}>Load Terrain</DialogTitle>
        <Mui.DialogContent dividers>
          <Mui.FormLabel component='div' sx={{ mb: 2 }}>
            Import a room from Screeps: World
          </Mui.FormLabel>
          <Mui.Grid container rowSpacing={2} columnSpacing={2}>
            <Mui.Grid item xs={6}>
              <Mui.FormControl variant='outlined'>
                <Mui.TextField
                  label='Shard'
                  defaultValue={shard}
                  onChange={(e) => updateSettings({ type: 'set_shard', shard: e.target.value })}
                />
              </Mui.FormControl>
            </Mui.Grid>
            <Mui.Grid item xs={6}>
              <Mui.FormControl variant='outlined'>
                <Mui.TextField
                  label='Room'
                  defaultValue={room}
                  onChange={(e) => updateSettings({ type: 'set_room', room: e.target.value })}
                />
              </Mui.FormControl>
            </Mui.Grid>
          </Mui.Grid>
        </Mui.DialogContent>
        <Mui.DialogActions sx={{ justifyContent: 'space-between', mx: 1 }}>
          <Mui.FormControlLabel
            label='Wipe Structures'
            control={
              <Mui.Checkbox
                defaultChecked={wipeStructuresChecked}
                onChange={(e) => setWipeStructuresChecked(e.target.checked)}
              />
            }
          />
          <Mui.Button
            variant='outlined'
            onMouseDown={() => {
              setFormError(null);
              fetch(`https://screeps.com/api/game/room-terrain?encoded=true&room=${room}&shard=${shard}`)
                .then((res) => {
                  if (res.ok) return res.json();
                  throw new Error('Something went wrong');
                })
                .then((json: ScreepsGameRoomTerrain) => {
                  if (json.ok) {
                    if (wipeStructuresChecked) {
                      updateRoomGrid({ type: 'reset' });
                      updateRoomStructures({ type: 'reset' });
                    }
                    updateRoomTerrain({ type: 'reset' });
                    const bytes = Array.from(json.terrain[0].terrain);
                    if (bytes.length) {
                      roomTiles.forEach((_, y) => {
                        roomTiles.forEach((_, x) => {
                          const terrain = +bytes.shift()!;
                          if (terrain === TERRAIN_MASK_WALL || terrain === TERRAIN_MASK_SWAMP) {
                            const tile = getRoomTile(x, y);
                            updateRoomTerrain({ type: 'add_terrain', tile, terrain: TERRAIN_MASK[terrain] });
                          }
                        });
                      });
                    }
                  }
                  props.toggleModalOpen();
                  toggleModalOpen();
                })
                .catch(setFormError);
            }}
          >
            Load Terrain
          </Mui.Button>
        </Mui.DialogActions>
        {formError && (
          <Mui.Box sx={{ px: 2, pb: 2 }}>
            <Mui.Alert color='error' variant='outlined' sx={{ px: 1, py: 0 }}>
              {formError.message}
            </Mui.Alert>
          </Mui.Box>
        )}
      </StyledDialog>
    </>
  );
}
