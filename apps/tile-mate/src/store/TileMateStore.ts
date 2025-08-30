import { createStore } from "solid-js/store";
import { DropMode, TileIndex, TilesetIndex, Tileset, Tile } from "../types";
import { debounce } from "../common/debounce";

type SelectedTile = [TilesetIndex, TileIndex];

export type TileMateStoreState = {
  tilesets: Tileset[];
  selectedTile: SelectedTile | undefined;
  mode: DropMode;
};

const initialState: TileMateStoreState = {
  tilesets: [],
  mode: DropMode.Copy,
  selectedTile: undefined,
};

const [store, setStore] = createStore(initialState);

export const tilesets = () => store.tilesets;

export const tileset = (tilesetIndex: TilesetIndex): Tileset | undefined => {
  return store.tilesets[tilesetIndex];
};

export const tile = (
  tilesetIndex: TilesetIndex,
  tileIndex: TileIndex
): Tile | undefined => {
  return store.tilesets[tilesetIndex]?.tiles[tileIndex];
};

export const selectedTile = (): SelectedTile | undefined => {
  return store.selectedTile;
};

export const selectTile = (selectedTile: SelectedTile | undefined) => {
  setStore("selectedTile", selectedTile);
};

export const isSelectedTile = (selectedTile: SelectedTile): boolean => {
  return (
    store.selectedTile?.[0] === selectedTile[0] &&
    store.selectedTile?.[1] === selectedTile[1]
  );
};

function createTiles(
  newRows: number,
  newColumns: number,
  existingTiles?: Tile[],
  oldColumns?: number,
  oldRows?: number
) {
  const newTiles: Tile[] = [];

  const haveTilesExisted =
    existingTiles && existingTiles.length > 0 && oldColumns && oldRows;

  // Create new grid
  for (let y = 0; y < newRows; y++) {
    for (let x = 0; x < newColumns; x++) {
      const newIndex = y * newColumns + x;

      if (!haveTilesExisted) {
        newTiles.push({
          index: newIndex,
          imgX: x,
          imgY: y,
        });

        continue;
      }

      // Check if this position existed in the old grid
      if (x < oldColumns && y < oldRows) {
        const oldIndex = y * oldColumns + x;
        const existingTile = existingTiles[oldIndex];

        if (existingTile) {
          // Preserve existing tile but update index
          newTiles.push({
            ...existingTile,
            index: newIndex,
          });
        } else {
          // Create empty tile
          newTiles.push({
            index: newIndex,
          });
        }
      } else {
        // Create empty tile for positions outside old grid
        newTiles.push({
          index: newIndex,
        });
      }
    }
  }

  return newTiles;
}

export const addTileset = (
  tilesetImage: string,
  tileSize: number
): Promise<TilesetIndex> => {
  return new Promise((resolve, reject) => {
    const tilesetIndex = store.tilesets.length;

    // Create initial tileset state
    const initialTilesetState: Tileset = {
      index: tilesetIndex,
      tiles: [],
      tileSize,
      columns: 0,
      rows: 0,
      image: {
        url: tilesetImage,
        isLoading: true,
      },
    };

    setStore("tilesets", tilesetIndex, initialTilesetState);

    // Load image and calculate tiles
    const img = new Image();

    img.onload = () => {
      const calculatedColumns = Math.floor(img.naturalWidth / tileSize);
      const calculatedRows = Math.floor(img.naturalHeight / tileSize);

      setStore("tilesets", tilesetIndex, {
        index: tilesetIndex,
        tiles: createTiles(calculatedRows, calculatedColumns),
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
      setStore("tilesets", tilesetIndex, "image", "isLoading", false);
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
  return store.tilesets[tilesetIndex]?.image.isLoading ?? false;
};

export const columns = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.columns ?? 0;
};

export const rows = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.rows ?? 0;
};

export const tilesetImage = (tilesetIndex: TilesetIndex): string => {
  return store.tilesets[tilesetIndex]?.image.url ?? "";
};

export const tileSize = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.tileSize ?? 32;
};

export const tiles = (tilesetIndex: TilesetIndex): Tile[] => {
  return store.tilesets[tilesetIndex]?.tiles ?? [];
};

export const setColumns = (tilesetIndex: TilesetIndex, newColumns: number) => {
  debounce(`columns-${tilesetIndex}`, () => {
    if (store.tilesets[tilesetIndex]) {
      const tileset = store.tilesets[tilesetIndex];
      const oldColumns = tileset.columns;
      const oldRows = tileset.rows;
      const existingTiles = tileset.tiles;

      setStore("tilesets", tilesetIndex, "columns", newColumns);
      setStore(
        "tilesets",
        tilesetIndex,
        "tiles",
        createTiles(oldRows, newColumns, existingTiles, oldColumns, oldRows)
      );
    }
  });
};

export const setRows = (tilesetIndex: TilesetIndex, newRows: number) => {
  debounce(`rows-${tilesetIndex}`, () => {
    if (store.tilesets[tilesetIndex]) {
      const tileset = store.tilesets[tilesetIndex];
      const oldColumns = tileset.columns;
      const oldRows = tileset.rows;
      const existingTiles = tileset.tiles;

      setStore("tilesets", tilesetIndex, "rows", newRows);
      setStore(
        "tilesets",
        tilesetIndex,
        "tiles",
        createTiles(newRows, oldColumns, existingTiles, oldColumns, oldRows)
      );
    }
  });
};

export const setTileSize = (
  tilesetIndex: TilesetIndex,
  newTileSize: number
) => {
  debounce(`tileSize-${tilesetIndex}`, () => {
    if (store.tilesets[tilesetIndex]) {
      const tileset = store.tilesets[tilesetIndex];
      const oldColumns = tileset.columns;
      const oldRows = tileset.rows;

      const tilesetWidth = oldColumns * tileset.tileSize;
      const tilesetHeight = oldRows * tileset.tileSize;

      const newColumns = Math.floor(tilesetWidth / newTileSize);
      const newRows = Math.floor(tilesetHeight / newTileSize);

      setStore("tilesets", tilesetIndex, "tileSize", newTileSize);
      setStore("tilesets", tilesetIndex, "columns", newColumns);
      setStore("tilesets", tilesetIndex, "rows", newRows);
      setStore(
        "tilesets",
        tilesetIndex,
        "tiles",
        createTiles(newRows, newColumns)
      );
    }
  });
};

export const copyTile = (
  sourceTilesetIndex: TilesetIndex,
  sourceIndex: TileIndex,
  targetTilesetIndex: TilesetIndex,
  targetIndex: TileIndex
) => {
  if (
    !store.tilesets[sourceTilesetIndex] ||
    !store.tilesets[targetTilesetIndex]
  )
    return;

  const sourceTile = store.tilesets[sourceTilesetIndex].tiles[sourceIndex];

  if (sourceTile) {
    const copiedTile = {
      ...sourceTile,
      index: targetIndex,
    };

    setStore("tilesets", targetTilesetIndex, "tiles", targetIndex, copiedTile);
    setStore("selectedTile", [targetTilesetIndex, targetIndex]);
  }
};

export const swapTiles = (
  sourceTilesetIndex: TilesetIndex,
  sourceIndex: TileIndex,
  targetTilesetIndex: TilesetIndex,
  targetIndex: TileIndex
) => {
  if (!store.tilesets[sourceTilesetIndex]) return;
  if (!store.tilesets[targetTilesetIndex]) return;
  if (!store.tilesets[sourceTilesetIndex].tiles[sourceIndex]) return;
  if (!store.tilesets[targetTilesetIndex].tiles[targetIndex]) return;

  const swappedSourceTile = {
    ...store.tilesets[sourceTilesetIndex].tiles[sourceIndex],
    index: targetIndex,
  };
  const swappedTargetTile = {
    ...store.tilesets[targetTilesetIndex].tiles[targetIndex],
    index: sourceIndex,
  };

  setStore(
    "tilesets",
    sourceTilesetIndex,
    "tiles",
    sourceIndex,
    swappedTargetTile
  );
  setStore(
    "tilesets",
    targetTilesetIndex,
    "tiles",
    targetIndex,
    swappedSourceTile
  );
  setStore("selectedTile", [targetTilesetIndex, targetIndex]);
};

const TileMateStore = {
  get state() {
    return store;
  },
  // Core selectors
  tilesets,
  tileset,
  tile,
  isSelectedTile,
  selectedTile,
  selectedMode,

  // Tileset properties
  isImageLoading,
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
  setTileSize,
  replaceTile: copyTile,
  swapTiles,
};

export const useTileMateStore = () => {
  return {
    // Queries
    tilesets: TileMateStore.tilesets,
    tilesetImage: TileMateStore.tilesetImage,
    tiles: TileMateStore.tiles,
    tile: TileMateStore.tile,
    columns: TileMateStore.columns,
    rows: TileMateStore.rows,
    tileSize: TileMateStore.tileSize,
    isSelectedTile: TileMateStore.isSelectedTile,
    selectedTile: TileMateStore.selectedTile,
    selectedMode: TileMateStore.selectedMode,

    // Commands
    addTileset: TileMateStore.addTileset,
    setColumns: TileMateStore.setColumns,
    setRows: TileMateStore.setRows,
    setTileSize: TileMateStore.setTileSize,
    selectTile: TileMateStore.selectTile,
    copyTile: TileMateStore.replaceTile,
    swapTiles: TileMateStore.swapTiles,
    selectMode: TileMateStore.selectMode,
  };
};

export default TileMateStore;
