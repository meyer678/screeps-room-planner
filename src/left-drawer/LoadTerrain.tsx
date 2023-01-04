import * as Mui from '@mui/material';
import * as Icons from '@mui/icons-material';
import { ROOM_SIZE, SETTINGS, TERRAIN_MASK, TERRAIN_MASK_SWAMP, TERRAIN_MASK_WALL } from '../utils/constants';
import { getRoomTile } from '../utils/helpers';
import { RoomGridTerrain, ScreepsGameRoomTerrainEncoded } from '../utils/types';
import { State, useHookstate } from '@hookstate/core';

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

export default function LoadTerrain(props: {
  roomTerrainState: State<RoomGridTerrain>;
  settingsState: State<typeof SETTINGS>;
  wipeStructures: () => void;
  wipeTerrain: () => void;
}) {
  const wipeStructuresChecked = useHookstate(true);
  const modalOpen = useHookstate(false);
  const roomTerrainState = useHookstate(props.roomTerrainState);
  const settingsState = useHookstate(props.settingsState);
  const roomTiles = [...Array(ROOM_SIZE)];

  return (
    <>
      <Mui.Button onMouseDown={() => modalOpen.set(true)} variant='text' endIcon={<Icons.DownloadForOffline />}>
        Load Terrain
      </Mui.Button>
      <StyledDialog open={modalOpen.get()} onClose={() => modalOpen.set(false)}>
        <DialogTitle onClose={() => modalOpen.set(false)}>Load Terrain</DialogTitle>
        <Mui.DialogContent dividers>
          <Mui.Typography component='div' variant='caption' sx={{ mb: 2 }}>
            Input any room in Screeps: World.
          </Mui.Typography>
          <Mui.Grid container rowSpacing={2} columnSpacing={2}>
            <Mui.Grid item xs={6}>
              <Mui.FormControl variant='outlined'>
                <Mui.TextField
                  label='Shard'
                  defaultValue={settingsState.shard.get()}
                  onChange={(e) => settingsState.shard.set(e.target.value)}
                />
              </Mui.FormControl>
            </Mui.Grid>
            <Mui.Grid item xs={6}>
              <Mui.FormControl variant='outlined'>
                <Mui.TextField
                  label='Room'
                  defaultValue={settingsState.room.get()}
                  onChange={(e) => settingsState.room.set(e.target.value)}
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
                defaultChecked={wipeStructuresChecked.get()}
                onChange={(e) => wipeStructuresChecked.set(e.target.checked)}
              />
            }
          />
          <Mui.Button
            variant='outlined'
            onMouseDown={() =>
              fetch(
                `https://cors-anywhere.herokuapp.com/https://screeps.com/api/game/room-terrain?encoded=true&room=${settingsState.room.get()}&shard=${settingsState.shard.get()}`
              )
                .then((res) => res.json())
                .then((json: ScreepsGameRoomTerrainEncoded) => {
                  if (json.ok) {
                    if (wipeStructuresChecked.get()) {
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
                            roomTerrainState[tile].merge(TERRAIN_MASK[terrain]);
                          }
                        });
                      });
                    }
                  }
                  modalOpen.set(false);
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
