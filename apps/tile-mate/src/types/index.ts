export const DropMode = {
  Copy: "Copy",
  Swap: "Swap",
};
export type DropMode = (typeof DropMode)[keyof typeof DropMode];

export type TileIndex = number;

export type Tile =
  | {
      index: TileIndex;
      img: {
        src: string;
        x: number;
        y: number;
      };
    }
  | {
      // Empty Tile
      index: TileIndex;
      img: never;
    };

export type TilesetIndex = number;

export type Tileset = {
  index: TilesetIndex;
  tiles: Tile[];
  tileSize: number;
  columns: number;
  rows: number;
  image?: {
    url: string;
    isLoading: boolean;
  };
};
