import {
  CONTROLLER_STRUCTURES,
  MAX_RCL,
  ROOM_SIZE,
  STRUCTURE_CONTROLLER,
  STRUCTURE_EXTENSION,
  STRUCTURE_EXTRACTOR,
  STRUCTURE_NAMES,
  STRUCTURE_ROAD,
  TERRAIN_WALL,
} from './constants';

export const getStructureProps = (key: string, rcl = MAX_RCL) => ({
  key,
  image: getIconImage(key, rcl),
  name: STRUCTURE_NAMES[key],
  total: CONTROLLER_STRUCTURES[key][rcl] || 0,
});

const getIconImage = (key: string, rcl = MAX_RCL) => {
  if (key === STRUCTURE_CONTROLLER) {
    return `./images/controller/${rcl}.png`;
  }
  if (key === STRUCTURE_EXTENSION) {
    return './images/extension/' + (rcl === 8 || rcl === 7 ? `${rcl}.png` : '3.png');
  }
  return `./images/structures/${key}.png`;
};

export const getStructureBrushes = (rcl = MAX_RCL) =>
  Object.keys(STRUCTURE_NAMES).map((key) => getStructureProps(key, rcl));

export const getRequiredRCL = (structure: string) =>
  Math.min(...Object.keys(CONTROLLER_STRUCTURES[structure]).map((v) => +v));

export const getRoomTile = (x: number, y: number) => Math.round(ROOM_SIZE * x + y);

export const getRoomPosition = (tile: number) => ({ x: Math.floor(tile / ROOM_SIZE), y: tile % ROOM_SIZE });

export const positionIsValid = (x: number, y: number) => x >= 0 && x < ROOM_SIZE && y >= 0 && y < ROOM_SIZE;

export const structureCanBePlaced = (structure: string, rcl: number, placed: number, terrain: string) => {
  if (![STRUCTURE_ROAD, STRUCTURE_CONTROLLER, STRUCTURE_EXTRACTOR].includes(structure)) {
    if (terrain === TERRAIN_WALL) return false;
  }
  const total = CONTROLLER_STRUCTURES[structure][rcl];
  return !!total && (!placed || placed < total);
};
