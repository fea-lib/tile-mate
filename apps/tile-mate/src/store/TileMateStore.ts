import { createStore } from "solid-js/store";
import { DropMode, TileIndex, TilesetIndex, Tileset, Tile } from "../types";

export type TilesetState = {
  tileset: Tileset;
  selectedTile: TileIndex | undefined;
};

export type TileMateStoreState = {
  tilesets: TilesetState[];
  mode: DropMode;
};

const initialState: TileMateStoreState = {
  tilesets: [],
  mode: DropMode.Replace,
};

const [store, setStore] = createStore(initialState);

export const tileset = (tilesetIndex: TilesetIndex): Tileset | undefined => {
  return store.tilesets[tilesetIndex]?.tileset;
};

export const tile = (
  tilesetIndex: TilesetIndex,
  tileIndex: TileIndex
): Tile | undefined => {
  return store.tilesets[tilesetIndex]?.tileset.tiles[tileIndex];
};

export const selectedTile = (
  tilesetIndex: TilesetIndex
): TileIndex | undefined => {
  return store.tilesets[tilesetIndex]?.selectedTile;
};

export const selectTile = (
  tilesetIndex: TilesetIndex,
  tileIndex: TileIndex | undefined
) => {
  if (store.tilesets[tilesetIndex]) {
    setStore("tilesets", tilesetIndex, "selectedTile", tileIndex);
  }
};

export const isSelectedTile = (
  tilesetIndex: TilesetIndex,
  tileIndex: TileIndex
): boolean => {
  return store.tilesets[tilesetIndex]?.selectedTile === tileIndex;
};

export const addTileset = (
  tilesetImage: string,
  tileSize: number
): Promise<TilesetIndex> => {
  return new Promise((resolve, reject) => {
    const tilesetIndex = store.tilesets.length;

    // Create initial tileset state
    const initialTilesetState: TilesetState = {
      tileset: {
        index: tilesetIndex,
        tiles: [],
        tileSize,
        columns: 0,
        rows: 0,
        image: {
          url: tilesetImage,
          isLoading: true,
        },
      },
      selectedTile: undefined,
    };

    setStore("tilesets", tilesetIndex, initialTilesetState);

    // Load image and calculate tiles
    const img = new Image();

    img.onload = () => {
      const calculatedColumns = Math.floor(img.naturalWidth / tileSize);
      const calculatedRows = Math.floor(img.naturalHeight / tileSize);

      const newTiles: Tile[] = [];
      for (let y = 0; y < calculatedRows; y++) {
        for (let x = 0; x < calculatedColumns; x++) {
          newTiles.push({
            index: newTiles.length,
            imgX: x,
            imgY: y,
          });
        }
      }

      setStore("tilesets", tilesetIndex, "tileset", {
        index: tilesetIndex,
        tiles: newTiles,
        tileSize,
        columns: calculatedColumns,
        rows: calculatedRows,
        image: {
          url: tilesetImage,
          isLoading: false,
        },
      });

      resolve(tilesetIndex);
    };

    img.onerror = () => {
      console.error("Failed to load tileset image:", tilesetImage);
      setStore(
        "tilesets",
        tilesetIndex,
        "tileset",
        "image",
        "isLoading",
        false
      );
      reject(new Error(`Failed to load tileset image: ${tilesetImage}`));
    };

    img.src = tilesetImage;
  });
};

export const selectedMode = () => store.mode;

export const selectMode = (mode: DropMode) => {
  setStore("mode", mode);
};

// Additional tileset management functions
export const isImageLoading = (tilesetIndex: TilesetIndex): boolean => {
  return store.tilesets[tilesetIndex]?.tileset.image.isLoading ?? false;
};

export const columns = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.tileset.columns ?? 0;
};

export const rows = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.tileset.rows ?? 0;
};

export const tilesetImage = (tilesetIndex: TilesetIndex): string => {
  return store.tilesets[tilesetIndex]?.tileset.image.url ?? "";
};

export const tileSize = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.tileset.tileSize ?? 32;
};

export const tiles = (tilesetIndex: TilesetIndex): Tile[] => {
  return store.tilesets[tilesetIndex]?.tileset.tiles ?? [];
};

export const setColumns = (tilesetIndex: TilesetIndex, cols: number) => {
  if (store.tilesets[tilesetIndex]) {
    setStore("tilesets", tilesetIndex, "tileset", "columns", cols);
  }
};

export const setRows = (tilesetIndex: TilesetIndex, newRows: number) => {
  if (store.tilesets[tilesetIndex]) {
    setStore("tilesets", tilesetIndex, "tileset", "rows", newRows);
  }
};

export const replaceTile = (
  tilesetIndex: TilesetIndex,
  targetId: TileIndex,
  sourceId: TileIndex
) => {
  if (!store.tilesets[tilesetIndex]) return;

  const currentTiles = [...store.tilesets[tilesetIndex].tileset.tiles];
  const sourceTile = currentTiles[sourceId];

  if (sourceTile) {
    // Replace target with source tile's image position
    currentTiles[targetId] = {
      ...sourceTile,
      index: currentTiles[targetId].index,
    };

    // Reset source to its original position (identity)
    currentTiles[sourceId] = {
      index: currentTiles[sourceId].index,
    };

    setStore("tilesets", tilesetIndex, "tileset", "tiles", currentTiles);
  }
};

export const swapTiles = (
  tilesetIndex: TilesetIndex,
  tileId1: TileIndex,
  tileId2: TileIndex
) => {
  if (!store.tilesets[tilesetIndex]) return;

  const currentTiles = [...store.tilesets[tilesetIndex].tileset.tiles];
  const tile1 = { ...currentTiles[tileId1] };
  const tile2 = { ...currentTiles[tileId2] };

  if (tile1 && tile2) {
    // Swap the tiles
    currentTiles[tileId1] = {
      ...tile2,
      index: tileId1,
    };

    currentTiles[tileId2] = {
      ...tile1,
      index: tileId2,
    };

    setStore("tilesets", tilesetIndex, "tileset", "tiles", currentTiles);
  }
};

export const TileMateStore = {
  get state() {
    return store;
  },
  // Core selectors
  tileset,
  tile,
  isSelectedTile,
  selectedTile,
  selectedMode,

  // Tileset properties
  isLoading: isImageLoading,
  columns,
  rows,
  tilesetImage,
  tileSize,
  tiles,

  // Mutations
  selectTile,
  addTileset,
  selectMode,
  setColumns,
  setRows,
  replaceTile,
  swapTiles,
};

export default TileMateStore;
