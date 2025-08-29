import { createStore } from "solid-js/store";
import { DropMode, TileIndex, TilesetIndex, Tileset, Tile } from "../types";

type SelectedTile = [TilesetIndex, TileIndex];

export type TileMateStoreState = {
  tilesets: Tileset[];
  selectedTile: SelectedTile | undefined;
  mode: DropMode;
};

const initialState: TileMateStoreState = {
  tilesets: [],
  mode: DropMode.Replace,
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

function getBlankTiles(rows: number, columns: number) {
  const tiles: Tile[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      tiles.push({
        index: tiles.length,
        imgX: x,
        imgY: y,
      });
    }
  }

  return tiles;
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
        tiles: getBlankTiles(calculatedRows, calculatedColumns),
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
  if (store.tilesets[tilesetIndex]) {
    setStore("tilesets", tilesetIndex, "columns", newColumns);
    setStore(
      "tilesets",
      tilesetIndex,
      "tiles",
      getBlankTiles(rows(tilesetIndex), newColumns)
    );
  }
};

export const setRows = (tilesetIndex: TilesetIndex, newRows: number) => {
  if (store.tilesets[tilesetIndex]) {
    setStore("tilesets", tilesetIndex, "rows", newRows);
    setStore(
      "tilesets",
      tilesetIndex,
      "tiles",
      getBlankTiles(newRows, columns(tilesetIndex))
    );
  }
};

export const setTileSize = (
  tilesetIndex: TilesetIndex,
  newTileSize: number
) => {
  if (store.tilesets[tilesetIndex]) {
    const tilesetWidth =
      store.tilesets[tilesetIndex].columns *
      store.tilesets[tilesetIndex].tileSize;

    const tilesetHeight =
      store.tilesets[tilesetIndex].rows * store.tilesets[tilesetIndex].tileSize;

    const newColumns = Math.floor(tilesetWidth / newTileSize);
    const newRows = Math.floor(tilesetHeight / newTileSize);

    setStore("tilesets", tilesetIndex, "tileSize", newTileSize);
    setStore("tilesets", tilesetIndex, "columns", newColumns);
    setStore("tilesets", tilesetIndex, "rows", newRows);
    setStore(
      "tilesets",
      tilesetIndex,
      "tiles",
      getBlankTiles(newRows, newColumns)
    );
  }
};

export const replaceTile = (
  tilesetIndex: TilesetIndex,
  targetId: TileIndex,
  sourceId: TileIndex
) => {
  if (!store.tilesets[tilesetIndex]) return;

  const currentTiles = [...store.tilesets[tilesetIndex].tiles];
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

    setStore("tilesets", tilesetIndex, "tiles", currentTiles);
    setStore("selectedTile", [tilesetIndex, targetId]);
  }
};

export const swapTiles = (
  tilesetIndex: TilesetIndex,
  tileId1: TileIndex,
  tileId2: TileIndex
) => {
  if (!store.tilesets[tilesetIndex]) return;

  const currentTiles = [...store.tilesets[tilesetIndex].tiles];
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

    setStore("tilesets", tilesetIndex, "tiles", currentTiles);
    setStore("selectedTile", [tilesetIndex, tileId2]);
  }
};

// Cross-tileset operations
export const replaceTileCross = (
  sourceTilesetIndex: TilesetIndex,
  sourceId: TileIndex,
  targetTilesetIndex: TilesetIndex,
  targetId: TileIndex
) => {
  if (
    !store.tilesets[sourceTilesetIndex] ||
    !store.tilesets[targetTilesetIndex]
  )
    return;

  const sourceTiles = [...store.tilesets[sourceTilesetIndex].tiles];
  const targetTiles = [...store.tilesets[targetTilesetIndex].tiles];
  const sourceTile = sourceTiles[sourceId];

  if (sourceTile) {
    // Replace target with source tile's image position
    targetTiles[targetId] = {
      ...sourceTile,
      index: targetTiles[targetId].index,
    };

    // Reset source to its original position (identity) only if it's in a different tileset
    if (sourceTilesetIndex !== targetTilesetIndex) {
      sourceTiles[sourceId] = {
        index: sourceTiles[sourceId].index,
      };
      setStore("tilesets", sourceTilesetIndex, "tiles", sourceTiles);
    }

    setStore("tilesets", targetTilesetIndex, "tiles", targetTiles);
    setStore("selectedTile", [targetTilesetIndex, targetId]);
  }
};

export const swapTilesCross = (
  sourceTilesetIndex: TilesetIndex,
  sourceId: TileIndex,
  targetTilesetIndex: TilesetIndex,
  targetId: TileIndex
) => {
  if (
    !store.tilesets[sourceTilesetIndex] ||
    !store.tilesets[targetTilesetIndex]
  )
    return;

  const sourceTiles = [...store.tilesets[sourceTilesetIndex].tiles];
  const targetTiles = [...store.tilesets[targetTilesetIndex].tiles];
  const sourceTile = { ...sourceTiles[sourceId] };
  const targetTile = { ...targetTiles[targetId] };

  if (sourceTilesetIndex === targetTilesetIndex) {
    // Same tileset - use existing swap logic
    swapTiles(sourceTilesetIndex, sourceId, targetId);
  } else {
    // Different tilesets - exchange tile data
    sourceTiles[sourceId] = {
      ...targetTile,
      index: sourceId,
    };
    targetTiles[targetId] = {
      ...sourceTile,
      index: targetId,
    };

    setStore("tilesets", sourceTilesetIndex, "tiles", sourceTiles);
    setStore("tilesets", targetTilesetIndex, "tiles", targetTiles);
    setStore("selectedTile", [targetTilesetIndex, targetId]);
  }
};

export const TileMateStore = {
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
  replaceTile,
  swapTiles,
  replaceTileCross,
  swapTilesCross,
};

export const useTileMateStore = () => {
  return {
    // Properties
    tilesets: () => TileMateStore.tilesets(),
    tiles: (tileset: TilesetIndex) => TileMateStore.tiles(tileset),
    tile: (tileset: TilesetIndex, tile: TileIndex) =>
      TileMateStore.tile(tileset, tile),
    columns: (tileset: TilesetIndex) => TileMateStore.columns(tileset),
    rows: (tileset: TilesetIndex) => TileMateStore.rows(tileset),
    tileSize: (tileset: TilesetIndex) => TileMateStore.tileSize(tileset),
    selectedTile: () => TileMateStore.selectedTile() ?? null,

    // Setters
    setColumns: (tileset: TilesetIndex, cols: number) =>
      TileMateStore.setColumns(tileset, cols),
    setRows: (tileset: TilesetIndex, rows: number) =>
      TileMateStore.setRows(tileset, rows),
    setTileSize: (tileset: TilesetIndex, size: number) =>
      TileMateStore.setTileSize(tileset, size),
    selectTile: (selectedTile: SelectedTile | undefined) =>
      TileMateStore.selectTile(selectedTile),

    // Operations
    replaceTile: (
      tileset: TilesetIndex,
      targetId: TileIndex,
      sourceId: TileIndex
    ) => TileMateStore.replaceTile(tileset, targetId, sourceId),
    swapTiles: (
      tileset: TilesetIndex,
      tileId1: TileIndex,
      tileId2: TileIndex
    ) => TileMateStore.swapTiles(tileset, tileId1, tileId2),

    // Cross-tileset operations
    replaceTileCross: (
      sourceTilesetIndex: TilesetIndex,
      sourceId: TileIndex,
      targetTilesetIndex: TilesetIndex,
      targetId: TileIndex
    ) =>
      TileMateStore.replaceTileCross(
        sourceTilesetIndex,
        sourceId,
        targetTilesetIndex,
        targetId
      ),
    swapTilesCross: (
      sourceTilesetIndex: TilesetIndex,
      sourceId: TileIndex,
      targetTilesetIndex: TilesetIndex,
      targetId: TileIndex
    ) =>
      TileMateStore.swapTilesCross(
        sourceTilesetIndex,
        sourceId,
        targetTilesetIndex,
        targetId
      ),
  };
};

export default TileMateStore;
