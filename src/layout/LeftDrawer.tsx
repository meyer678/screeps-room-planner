import { none, State, useHookstate } from '@hookstate/core';
import * as Mui from '@mui/material';
import * as Icons from '@mui/icons-material';
import {
  MAX_RCL,
  ROOM_SIZE,
  SAMPLE_JSON,
  SETTINGS,
  STRUCTURE_CONTROLLER,
  TERRAIN_MASK,
  TERRAIN_MASK_SWAMP,
  TERRAIN_MASK_WALL,
  TERRAIN_PLAIN,
} from '../utils/constants';
import { getRequiredRCL, getRoomPosition, getRoomTile, structureCanBePlaced } from '../utils/helpers';
import {
  RoomGridMap,
  RoomGridTerrain,
  RoomStructures,
  ScreepsGameRoomTerrain,
  ScreepsGameRoomTerrainEncoded,
  StructureBrush,
} from '../utils/types';

export const drawerWidth = 300;
const iconSize = '1.5rem';

const StyledButton = Mui.styled(Mui.Button)<Mui.ButtonProps>(({ theme, variant }) => ({
  borderColor: 'transparent !important',
  color: '#eee',
  textTransform: 'capitalize',
  ':hover': {
    backgroundColor: variant === 'contained' ? theme.palette.primary.main : 'rgba(255,255,255,0.15)',
  },
}));

const StyledAccordion = Mui.styled((props: Mui.AccordionProps) => (
  <Mui.Accordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const StyledAccordionSummary = Mui.styled((props: Mui.AccordionSummaryProps) => (
  <Mui.AccordionSummary expandIcon={<Icons.ArrowForwardIosSharp sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, .05)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const StyledAccordionDetails = Mui.styled(Mui.AccordionDetails)({
  padding: 0,
  borderTop: '1px solid rgba(0, 0, 0, .125)',
});

const StyledBadge = Mui.styled(Mui.Badge)<Mui.BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 18,
    top: 18,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

export default function LeftDrawer(props: {
  roomGridState: State<RoomGridMap>;
  roomGridHoverState: State<number>;
  roomStructuresState: State<RoomStructures>;
  roomTerrainState: State<RoomGridTerrain>;
  settingsState: State<typeof SETTINGS>;
  structureBrushes: StructureBrush[];
}) {
  const hoverState = useHookstate(props.roomGridHoverState);
  const roomGridState = useHookstate(props.roomGridState);
  const roomStructuresState = useHookstate(props.roomStructuresState);
  const roomTerrainState = useHookstate(props.roomTerrainState);
  const settingsState = useHookstate(props.settingsState);
  const accordionRoomState = useHookstate(true);
  const accordionBrushState = useHookstate(true);
  const { bottomDrawerOpen, brush, rcl } = settingsState.get();
  const { x, y } = getRoomPosition(hoverState.get());
  const brushClass = 'brush';
  const roomTiles = [...Array(ROOM_SIZE)];
  const controller = props.structureBrushes.find((b) => b.key === STRUCTURE_CONTROLLER);

  const getBrush = (target: HTMLElement): string => {
    if (target.classList.contains(brushClass)) {
      return (target as HTMLElement).dataset.structure!;
    }
    return getBrush(target.parentElement as HTMLElement);
  };

  const wipeMap = () => {
    [roomGridState, roomStructuresState, roomTerrainState].forEach((s) =>
      s.keys.forEach((k) => s.merge({ [k]: none }))
    );
  };

  return (
    <Mui.Drawer
      variant='permanent'
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Mui.Toolbar variant='dense' />
      <Mui.Box display='flex' flexDirection='column' justifyContent='space-between' flexGrow='1'>
        <Mui.Box>
          <StyledAccordion expanded={accordionRoomState.get()} onChange={() => accordionRoomState.set((v) => !v)}>
            <StyledAccordionSummary>
              <Mui.Typography>Room</Mui.Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <Mui.Box display='flex' flexDirection='column' overflow='auto'>
                <Mui.Stack direction='column' sx={{ m: 3 }}>
                  <Mui.Box alignItems='center' display='flex' flexDirection='row' justifyContent='space-between' mb={1}>
                    <Mui.Typography component='legend' variant='body2'>
                      Controller Level
                    </Mui.Typography>
                    <Mui.Box>
                      {controller && (
                        <StyledBadge badgeContent={rcl} color='secondary'>
                          <Mui.Avatar alt={controller.name} src={controller.image} sx={{ width: 36, height: 36 }} />
                        </StyledBadge>
                      )}
                    </Mui.Box>
                  </Mui.Box>
                  <Mui.ToggleButtonGroup
                    color='primary'
                    exclusive
                    fullWidth
                    onChange={(_, value) => value && settingsState.rcl.set(+value)}
                    size='small'
                    sx={{ mb: 3 }}
                    value={rcl}
                  >
                    {Array.from(Array(MAX_RCL), (_, i) => ++i).map((level) => (
                      <Mui.ToggleButton key={level} value={level}>
                        {level}
                      </Mui.ToggleButton>
                    ))}
                  </Mui.ToggleButtonGroup>
                  <Mui.Typography component='legend' variant='body2' gutterBottom>
                    Cursor
                  </Mui.Typography>
                  <Mui.Box display='flex' flexDirection='row' justifyContent='space-evenly'>
                    <Mui.Typography key={`x-${x}`} component='div' sx={{ width: '40%' }} variant='body2'>
                      X: {x >= 0 ? x : ''}
                    </Mui.Typography>
                    <Mui.Typography key={`y-${y}`} component='div' sx={{ width: '40%' }} variant='body2'>
                      Y: {y >= 0 ? y : ''}
                    </Mui.Typography>
                  </Mui.Box>
                </Mui.Stack>
              </Mui.Box>
            </StyledAccordionDetails>
          </StyledAccordion>
          <StyledAccordion expanded={accordionBrushState.get()} onChange={() => accordionBrushState.set((v) => !v)}>
            <StyledAccordionSummary>
              <Mui.Typography>Structures</Mui.Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <Mui.Box display='flex' flexDirection='column' overflow='auto'>
                <Mui.Stack direction='column' sx={{ m: 3 }}>
                  {props.structureBrushes.map(({ key, image, total, name }) => {
                    const placed = roomStructuresState[key].get()?.length || 0;
                    const disabled = !structureCanBePlaced(key, rcl, placed, TERRAIN_PLAIN);
                    const error = total < placed;
                    const locked = !error && rcl < getRequiredRCL(key);
                    return (
                      <StyledButton
                        className={brushClass}
                        data-structure={key}
                        key={key}
                        disabled={disabled}
                        endIcon={
                          <Mui.Box
                            sx={{
                              backgroundImage: `url(${image})`,
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: 'contain',
                              height: iconSize,
                              width: iconSize,
                              opacity: disabled ? 0.2 : 1,
                            }}
                          />
                        }
                        onMouseDown={(e) => settingsState.nested('brush').set(getBrush(e.target as HTMLElement))}
                        sx={{
                          justifyContent: 'space-between',
                          '&& .MuiTouchRipple-rippleVisible': {
                            animationDuration: '200ms',
                          },
                        }}
                        variant={brush === key ? 'contained' : 'outlined'}
                      >
                        <Mui.Box
                          alignItems='center'
                          display='flex'
                          flexDirection='row'
                          justifyContent='space-between'
                          flexGrow='1'
                        >
                          <Mui.Typography variant='body2'>{name}</Mui.Typography>
                          <Mui.Tooltip title={`${total - placed} Remaining`}>
                            <Mui.Chip
                              color={error ? 'error' : 'default'}
                              icon={locked ? <Icons.Lock /> : <></>}
                              label={locked ? `RCL ${getRequiredRCL(key)}` : placed + ' / ' + total}
                              disabled={disabled}
                              size='small'
                              sx={{
                                ...(brush === key &&
                                  !disabled && { borderColor: ({ palette }) => palette.text.primary }),
                                fontSize: '.7rem',
                                fontWeight: 300,
                              }}
                              variant='outlined'
                            />
                          </Mui.Tooltip>
                        </Mui.Box>
                      </StyledButton>
                    );
                  })}
                </Mui.Stack>
              </Mui.Box>
            </StyledAccordionDetails>
          </StyledAccordion>
        </Mui.Box>
        <Mui.Box display='flex' flexDirection='column'>
          <Mui.Button onMouseDown={wipeMap} variant='text' endIcon={<Icons.LayersClear />}>
            Wipe Map
          </Mui.Button>
          <Mui.Button
            onMouseDown={() => {
              wipeMap();

              settingsState.rcl.set(MAX_RCL);

              Object.entries(SAMPLE_JSON.buildings).forEach(([structure, positions]) => {
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
          <Mui.Button
            onMouseDown={() => {
              const room = 'E18S4';
              const shard = 'shard1';

              fetch(
                `https://cors-anywhere.herokuapp.com/https://screeps.com/api/game/room-terrain?encoded=true&room=${room}&shard=${shard}`
              )
                .then((res) => res.json())
                .then((json: ScreepsGameRoomTerrainEncoded) => {
                  if (json.ok) {
                    wipeMap();
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
                });
            }}
            variant='text'
            endIcon={<Icons.DownloadForOffline />}
          >
            Load Terrain
          </Mui.Button>
          {!bottomDrawerOpen && (
            <Mui.Button
              onMouseDown={() => settingsState.bottomDrawerOpen.set(true)}
              variant='text'
              endIcon={<Icons.DataObject />}
            >
              Generate JSON
            </Mui.Button>
          )}
        </Mui.Box>
      </Mui.Box>
    </Mui.Drawer>
  );
}
