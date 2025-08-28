export const DropMode = {
  Replace: "Replace",
  Swap: "Swap",
};
export type DropMode = (typeof DropMode)[keyof typeof DropMode];

export type TileIndex = number;

export type Tile =
  | {
      index: TileIndex;
      imgX: number;
      imgY: number;
    }
  | {
      // Empty Tile
      index: TileIndex;
    };

export type TilesetIndex = number;

export type Tileset = {
  index: TilesetIndex;
  tiles: Tile[];
  tileSize: number;
  columns: number;
  rows: number;
  image: {
    url: string;
    isLoading: boolean;
  };
};
