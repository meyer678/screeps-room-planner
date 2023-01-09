export type RoomPosition = { x: number; y: number };
export type RoomMineral = { [mineralType: string]: RoomPosition };
export type RoomStructures = { [structure: string]: RoomPosition[] };

export interface StructureBrush {
  key: string;
  image: string;
  name: string;
  total: number;
}

export type HTMLElementEvent<T extends HTMLElement> = Event & {
  target: T;
};

export type ScreepsGameRoomTerrain = {
  ok: number;
  terrain: Array<{ room: string; x: number; y: number; type: string }>;
};

export type ScreepsGameRoomTerrainEncoded = {
  ok: number;
  terrain: Array<{ _id: string; room: string; terrain: string; type: 'terrain' }>;
};
