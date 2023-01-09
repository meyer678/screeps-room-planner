import * as Mui from '@mui/material';
import * as Icons from '@mui/icons-material';
import { ROOM_SIZE, TERRAIN_MASK, TERRAIN_MASK_SWAMP, TERRAIN_MASK_WALL } from '../utils/constants';
import { getRoomTile } from '../utils/helpers';
import { ScreepsGameRoomTerrainEncoded } from '../utils/types';
import { useSettings } from '../contexts/SettingsContext';
import { useRoomTerrain } from '../contexts/RoomTerrainContext';
import { useState } from 'react';

const StyledDialog = Mui.styled(Mui.Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

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

export default function LoadTerrain(props: { wipeStructures: () => void; wipeTerrain: () => void }) {
  const { settings, updateSettings } = useSettings();
  const { shard, room } = settings;
  const { updateRoomTerrain } = useRoomTerrain();

  const [wipeStructures, setWipeStructures] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const roomTiles = [...Array(ROOM_SIZE)];

  const toggleModalOpen = () => setModalOpen(!modalOpen);

  return (
    <>
      <Mui.Button onMouseDown={toggleModalOpen} variant='text' endIcon={<Icons.DownloadForOffline />}>
        Load Terrain
      </Mui.Button>
      <StyledDialog open={modalOpen} onClose={toggleModalOpen}>
        <DialogTitle onClose={toggleModalOpen}>Load Terrain</DialogTitle>
        <Mui.DialogContent dividers>
          <Mui.Typography component='div' variant='caption' sx={{ mb: 2 }}>
            Enter a room from Screeps: World to load it's terrain.
          </Mui.Typography>
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
              <Mui.Checkbox defaultChecked={wipeStructures} onChange={(e) => setWipeStructures(e.target.checked)} />
            }
          />
          <Mui.Button
            variant='outlined'
            onMouseDown={() =>
              fetch(
                `https://cors-anywhere.herokuapp.com/https://screeps.com/api/game/room-terrain?encoded=true&room=${room}&shard=${shard}`
              )
                .then((res) => res.json())
                .then((json: ScreepsGameRoomTerrainEncoded) => {
                  if (json.ok) {
                    if (wipeStructures) {
                      props.wipeStructures();
                    }
                    props.wipeTerrain();
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
                  toggleModalOpen();
                })
            }
          >
            Load Terrain
          </Mui.Button>
        </Mui.DialogActions>
      </StyledDialog>
    </>
  );
}
