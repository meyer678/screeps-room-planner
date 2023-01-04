import { CSSProperties, useRef } from 'react';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import { useElementSize } from '../hooks/ElementSize';
import { RoomGridMap, RoomGridTerrain, RoomStructures, StructureBrush } from '../utils/types';
import {
  ROOM_SIZE,
  SETTINGS,
  STRUCTURE_CONTAINER,
  STRUCTURE_RAMPART,
  STRUCTURE_ROAD,
  TERRAIN_SWAMP,
  TERRAIN_WALL,
} from '../utils/constants';
import { getRoomPosition, getRoomTile, positionIsValid, structureCanBePlaced } from '../utils/helpers';
import { none, State, useHookstate } from '@hookstate/core';

export default function RoomGrid(props: {
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
  const { brush, rcl } = settingsState.get();
  const ref = useRef<HTMLHeadingElement>(null);
  const { width } = useElementSize(ref);
  const size = Math.max(ROOM_SIZE, width) / ROOM_SIZE;
  const roomTiles = [...Array(ROOM_SIZE)];
  const tileClass = 'tile';

  const getTileElement = (target: HTMLElement): { tile: number; x: number; y: number } => {
    if (target.classList.contains(tileClass)) {
      const tile = +target.dataset.tile!;
      return { tile, ...getRoomPosition(tile) };
    }
    return getTileElement(target.parentElement as HTMLElement);
  };

  const handleMouseEvent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    const { tile, x, y } = getTileElement(e.target as HTMLElement);
    hoverState.set(tile);
    if (e.buttons === 1) {
      addStructure(tile, x, y);
    } else if (e.buttons === 2) {
      props.structureBrushes.forEach(({ key }) => removeStructure(tile, x, y, key));
    }
  };

  const structuresToRemove = (skipBrush = false) =>
    brush === STRUCTURE_RAMPART
      ? []
      : roomStructuresState.keys.reduce(
          (acc: string[], structure) =>
            (skipBrush && brush === structure) ||
            structure === STRUCTURE_RAMPART ||
            (brush === STRUCTURE_CONTAINER && structure === STRUCTURE_ROAD) ||
            (brush === STRUCTURE_ROAD && structure === STRUCTURE_CONTAINER)
              ? acc
              : [...acc, structure],
          []
        );

  const addStructure = (tile: number, x: number, y: number) => {
    const placed = roomStructuresState[brush].get()?.length;
    const terrain = roomTerrainState[tile].get();
    if (structureCanBePlaced(brush, rcl, placed, terrain)) {
      // remove existing structures at this position except ramparts
      structuresToRemove().forEach((structure) => removeStructure(tile, x, y, structure));
      // add structures
      roomStructuresState[brush].merge([{ x, y }]);
      roomGridState[tile].merge([brush]);
    }
  };

  const removeStructure = (tile: number, x: number, y: number, structure: string) => {
    // prune roomStructuresState
    const structurePositions = roomStructuresState[structure].get();
    if (structurePositions) {
      const removeKeys = structurePositions.reduce(
        (acc: { [i: number]: any }, o, i) => ({
          ...acc,
          ...(o.x === x && o.y === y ? { [i]: none } : {}),
        }),
        {}
      );
      if (Object.keys(removeKeys).length) {
        roomStructuresState[structure].merge(removeKeys);
      }
    }

    // prune roomGridState
    const tileStructures = roomGridState[tile].get();
    if (tileStructures) {
      const removeKeys = tileStructures.reduce(
        (acc: { [i: number]: any }, s, i) => ({
          ...acc,
          ...(s === structure ? { [i]: none } : {}),
        }),
        {}
      );
      if (Object.keys(removeKeys).length) {
        roomGridState[tile].merge(removeKeys);
      }
    }
  };

  const getCellContent = (tile: number): React.ReactNode => {
    const hoverTile = hoverState.get();
    const placedStructures = roomGridState[tile].get();
    const terrain = roomTerrainState[tile].get();
    const placed = roomStructuresState[brush].get()?.length;
    const previewIcon =
      hoverTile === tile &&
      brush !== STRUCTURE_ROAD &&
      structureCanBePlaced(brush, rcl, placed, terrain) &&
      !positionHasStructure(tile, brush);

    let structures: string[] = [];
    if (placedStructures) {
      structures.push(...placedStructures);
    }
    if (previewIcon) {
      structures.push(brush);
      const previewRemove = structuresToRemove(true);
      structures = structures.filter((s) => !previewRemove.includes(s));
    }

    const width = '100%';
    const positionAbsolute: CSSProperties = {
      position: 'absolute',
      left: 0,
      top: 0,
    };
    const backgroundSizeProps = {
      backgroundSize: width,
      height: width,
      width,
    };
    const roadStyle = { ...positionAbsolute, height: width, width };

    return (
      <>
        <Box
          sx={{
            ...backgroundSizeProps,
            ...positionAbsolute,
            ...(terrain && terrain === TERRAIN_WALL
              ? {
                  backgroundColor: '#111111',
                }
              : terrain === TERRAIN_SWAMP
              ? {
                  backgroundColor: '#292b18',
                  boxShadow: `inset #252715 0 0 0 1px`,
                }
              : {
                  boxShadow: 'inset rgba(0, 0, 0, 0.05) 0 0 0 1px',
                }),
          }}
        />
        {structures && structures.includes(STRUCTURE_RAMPART) && (
          <Box
            sx={{
              ...backgroundSizeProps,
              ...positionAbsolute,
              backgroundColor: '#314b31',
              boxShadow: 'inset rgba(67, 134, 67, 0.6) 0 0 0 1px',
            }}
          />
        )}
        {getRoadLines(tile, roadStyle, previewIcon)}
        {structures &&
          props.structureBrushes
            .filter((o) => o.key !== STRUCTURE_RAMPART && o.key !== STRUCTURE_ROAD && structures.includes(o.key))
            .map(({ key, image }) => (
              <Box
                key={key}
                sx={{
                  ...backgroundSizeProps,
                  ...positionAbsolute,
                  backgroundImage: `url(${image})`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                  opacity: previewIcon ? 0.5 : 1,
                }}
              />
            ))}
      </>
    );
  };

  const positionHasStructure = (tile: number, structure: string) => {
    const placedStructures = roomGridState[tile].get();
    return placedStructures && placedStructures.includes(structure);
  };

  const positionHasRoad = (tile: number) => positionHasStructure(tile, STRUCTURE_ROAD);

  const getRoadLines = (tile: number, roadStyle: CSSProperties, previewIcon = false) => {
    const hoverTile = hoverState.get();
    const tileHasRoad = positionHasRoad(tile);
    const preview = brush === STRUCTURE_ROAD && !tileHasRoad && hoverTile === tile;
    const previewColor = 'rgba(107,107,107,0.4)';
    const solidColor = '#6b6b6b';
    const roadColor = preview || previewIcon ? previewColor : solidColor;

    if (preview || tileHasRoad) {
      return [-1, 0, 1].map((rx) =>
        [-1, 0, 1].map((ry) => {
          if (rx === 0 && ry === 0) {
            return (
              <svg key={tile} height={size} style={roadStyle} width={size}>
                <circle cx='50%' cy='50%' r='1' fill={roadColor} />
              </svg>
            );
          }

          const { x, y } = getRoomPosition(tile);
          const [cx, cy] = [x + rx, y + ry];
          const ctile = getRoomTile(cx, cy);
          const ctileHasRoad = positionHasRoad(ctile);
          const cpreview = brush === STRUCTURE_ROAD && !ctileHasRoad && hoverTile === ctile;
          const croadColor = cpreview || preview || previewIcon ? previewColor : solidColor;
          if (positionIsValid(cx, cy) && (cpreview || ctileHasRoad)) {
            return rx === -1 && ry === -1 ? (
              <svg key={ctile} height={size} style={roadStyle} width={size}>
                <line x1='0' y1='0' x2='50%' y2='50%' stroke={croadColor} strokeWidth={2} />
              </svg>
            ) : rx === 0 && ry === -1 ? (
              <svg key={ctile} height={size} style={roadStyle} width={size}>
                <line x1='50%' y1='0' x2='50%' y2='50%' stroke={croadColor} strokeWidth={2} />
              </svg>
            ) : rx === 1 && ry === -1 ? (
              <svg key={ctile} height={size} style={roadStyle} width={size}>
                <line x1='100%' y1='0' x2='50%' y2='50%' stroke={croadColor} strokeWidth={2} />
              </svg>
            ) : rx === 1 && ry === 0 ? (
              <svg key={ctile} height={size} style={roadStyle} width={size}>
                <line x1='100%' y1='50%' x2='50%' y2='50%' stroke={croadColor} strokeWidth={2} />
              </svg>
            ) : rx === 1 && ry === 1 ? (
              <svg key={ctile} height={size} style={roadStyle} width={size}>
                <line x1='100%' y1='100%' x2='50%' y2='50%' stroke={croadColor} strokeWidth={2} />
              </svg>
            ) : rx === 0 && ry === 1 ? (
              <svg key={ctile} height={size} style={roadStyle} width={size}>
                <line x1='50%' y1='100%' x2='50%' y2='50%' stroke={croadColor} strokeWidth={2} />
              </svg>
            ) : rx === -1 && ry === 1 ? (
              <svg key={ctile} height={size} style={roadStyle} width={size}>
                <line x1='0' y1='100%' x2='50%' y2='50%' stroke={croadColor} strokeWidth={2} />
              </svg>
            ) : rx === -1 && ry === 0 ? (
              <svg key={ctile} height={size} style={roadStyle} width={size}>
                <line x1='0' y1='50%' x2='50%' y2='50%' stroke={croadColor} strokeWidth={2} />
              </svg>
            ) : null;
          }
        })
      );
    }
    return null;
  };

  const getTooltip = () => {
    const hoverTile = hoverState.get();
    const { x, y } = getRoomPosition(hoverTile);
    return x < 0 && y < 0 ? null : (
      <Typography component='div' variant='body2'>
        X: {x}, Y: {y}
      </Typography>
    );
  };

  return (
    <Tooltip arrow color='primary' title={getTooltip()}>
      <Box display='flex' justifyContent='center'>
        <Paper
          elevation={6}
          sx={{
            borderRadius: 0,
            minWidth: '500px',
            maxWidth: 'calc(100vh - 6.25rem)',
            width: '100%',
          }}
        >
          <Box display='grid' gridTemplateColumns='repeat(50, 1fr)' gap={0} ref={ref}>
            {width > 0 &&
              roomTiles.map((_, y) =>
                roomTiles.map((_, x) => {
                  const tile = getRoomTile(x, y);
                  const sizePx = `${size}px`;
                  return (
                    <Box
                      key={tile}
                      className={tileClass}
                      component='div'
                      data-tile={tile}
                      onMouseDown={handleMouseEvent}
                      onMouseOver={handleMouseEvent}
                      onMouseOut={() => hoverState.set(-1)}
                      onContextMenu={(e) => e.preventDefault()}
                      sx={{
                        backgroundColor: ({ palette }) => palette.secondary.light,
                        height: sizePx,
                        position: 'relative',
                        width: 'auto',
                        ':after': {
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          boxShadow: 'inset rgba(0,0,0,0.05) 0 0 0 1px',
                          content: '""',
                          height: sizePx,
                          left: 0,
                          opacity: 0,
                          position: 'absolute',
                          top: 0,
                          width: sizePx,
                        },
                        ':hover:after': {
                          opacity: 1,
                        },
                      }}
                    >
                      {getCellContent(tile)}
                    </Box>
                  );
                })
              )}
          </Box>
        </Paper>
      </Box>
    </Tooltip>
  );
}
