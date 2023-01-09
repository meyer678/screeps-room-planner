export type RoomPosition = { x: number; y: number };

export interface StructureBrush {
  key: string;
  image: string;
  name: string;
  total: number;
}

export type ScreepsGameRoomTerrain = {
  ok: number;
  terrain: Array<{ _id: string; room: string; terrain: string; type: 'terrain' }>;
};
