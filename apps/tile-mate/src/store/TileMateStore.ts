import { createStore, produce } from "solid-js/store";
import { DropMode, TileIndex, TilesetIndex, Tileset, Tile } from "../types";
import { debounce } from "../common/debounce";

type SelectedTile = [TilesetIndex, TileIndex];

export type TileMateStoreState = {
  tilesets: Record<TilesetIndex, Tileset>;
  selectedTile: SelectedTile | undefined;
  mode: DropMode;
  showGrid: boolean | { color?: string; gap?: number };
  nextTilesetIndex: TilesetIndex;
};

const initialState: TileMateStoreState = {
  tilesets: {},
  mode: DropMode.Copy,
  selectedTile: undefined,
  showGrid: true,
  nextTilesetIndex: 0,
};

const [store, setStore] = createStore(initialState);

// List of existing tileset indices (numeric) for stable iteration order.
// Kept as a simple function to avoid creating a memo outside a reactive root (which triggers dev leak warnings).
export const tilesetIndices = (): ReadonlyArray<TilesetIndex> => {
  return Object.keys(store.tilesets).map((k) => Number(k)) as TilesetIndex[];
};

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

// Additional tileset management functions
export const hasImage = (tilesetIndex: TilesetIndex): boolean => {
  return !!store.tilesets[tilesetIndex]?.image;
};

export const isImageLoading = (tilesetIndex: TilesetIndex): boolean => {
  return store.tilesets[tilesetIndex]?.image?.isLoading ?? false;
};

export const columns = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.columns ?? 0;
};

export const rows = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.rows ?? 0;
};

export const tilesetImage = (
  tilesetIndex: TilesetIndex
): string | undefined => {
  return store.tilesets[tilesetIndex]?.image?.url;
};

export const tileSize = (tilesetIndex: TilesetIndex): number => {
  return store.tilesets[tilesetIndex]?.tileSize ?? 32;
};

export const tiles = (tilesetIndex: TilesetIndex): Tile[] => {
  return store.tilesets[tilesetIndex]?.tiles ?? [];
};

function createTiles(
  tilesetIndex: number,
  newRows: number,
  newColumns: number,
  existingTiles?: Tile[],
  oldColumns?: number,
  oldRows?: number
) {
  const newTiles: Tile[] = [];

  const haveTilesExisted =
    existingTiles && existingTiles.length > 0 && oldColumns && oldRows;

  const tilesetImageSrc = tilesetImage(tilesetIndex);

  for (let y = 0; y < newRows; y++) {
    for (let x = 0; x < newColumns; x++) {
      const newIndex = y * newColumns + x;

      if (!haveTilesExisted) {
        newTiles.push({
          index: newIndex,
          img: tilesetImageSrc
            ? {
                src: tilesetImageSrc,
                x,
                y,
              }
            : undefined,
        });
        continue;
      }

      if (x < (oldColumns as number) && y < (oldRows as number)) {
        const oldIndex = y * (oldColumns as number) + x;
        const existingTile = existingTiles![oldIndex];
        if (existingTile) {
          newTiles.push({ ...existingTile, index: newIndex });
        } else {
          newTiles.push({ index: newIndex, img: undefined as never });
        }
      } else {
        newTiles.push({ index: newIndex, img: undefined as never });
      }
    }
  }

  return newTiles;
}

function getNextTilesetIndex(): TilesetIndex {
  const index = store.nextTilesetIndex;
  setStore("nextTilesetIndex", index + 1);
  return index;
}

export const addTileset = (
  tilesetImage: string,
  tileSize: number
): Promise<TilesetIndex> => {
  return new Promise((resolve, reject) => {
    const tilesetIndex = getNextTilesetIndex();

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

    setStore("tilesets", tilesetIndex, initialTilesetState as any);

    const img = new Image();

    img.onload = () => {
      const calculatedColumns = Math.floor(img.naturalWidth / tileSize);
      const calculatedRows = Math.floor(img.naturalHeight / tileSize);

      setStore("tilesets", tilesetIndex, {
        index: tilesetIndex,
        tiles: createTiles(tilesetIndex, calculatedRows, calculatedColumns),
        tileSize,
        columns: calculatedColumns,
        rows: calculatedRows,
        image: {
          url: tilesetImage,
          isLoading: false,
        },
      } as any);

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

export const addEmptyTileset = (
  tileSize: number,
  columns: number = 5,
  rows: number = 5
): TilesetIndex => {
  const tilesetIndex = getNextTilesetIndex();

  const newTileset: Tileset = {
    index: tilesetIndex,
    tiles: createTiles(tilesetIndex, rows, columns),
    tileSize,
    columns,
    rows,
  };

  setStore("tilesets", tilesetIndex, newTileset as any);

  return tilesetIndex;
};

export const removeTileSet = (tilesetIndex: TilesetIndex) => {
  if (!store.tilesets[tilesetIndex]) return;

  setStore(
    "tilesets",
    produce((tilesets) => {
      delete tilesets[tilesetIndex];

      return tilesets;
    })
  );

  // Adjust selected tile if needed
  if (store.selectedTile) {
    const [selTileset, selTile] = store.selectedTile;
    if (selTileset === tilesetIndex) {
      setStore("selectedTile", undefined);
    }
  }
};

export const setColumns = (tilesetIndex: TilesetIndex, newColumns: number) => {
  debounce(`columns-${tilesetIndex}`, () => {
    if (store.tilesets[tilesetIndex]) {
      const tileset = store.tilesets[tilesetIndex];
      const oldColumns = tileset.columns;
      const oldRows = tileset.rows;
      const existingTiles = tileset.tiles;

      if (newColumns === oldColumns || newColumns < 1) return;

      setStore("tilesets", tilesetIndex, "columns", newColumns);
      setStore(
        "tilesets",
        tilesetIndex,
        "tiles",
        createTiles(
          tilesetIndex,
          oldRows,
          newColumns,
          existingTiles,
          oldColumns,
          oldRows
        )
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

      if (newRows === oldRows || newRows < 1) return;

      setStore("tilesets", tilesetIndex, "rows", newRows);
      setStore(
        "tilesets",
        tilesetIndex,
        "tiles",
        createTiles(
          tilesetIndex,
          newRows,
          oldColumns,
          existingTiles,
          oldColumns,
          oldRows
        )
      );
    }
  });
};

export const setTileSize = (
  tilesetIndex: TilesetIndex,
  newTileSize: number
) => {
  debounce(`tileSize-${tilesetIndex}`, () => {
    if (!store.tilesets[tilesetIndex]) return;
    if (store.tilesets[tilesetIndex].tileSize === newTileSize) return;

    const tileset = store.tilesets[tilesetIndex];
    const oldColumns = tileset.columns;
    const oldRows = tileset.rows;

    const tilesetWidth = oldColumns * tileset.tileSize;
    const tilesetHeight = oldRows * tileset.tileSize;

    const newColumns = Math.floor(tilesetWidth / newTileSize);
    const newRows = Math.floor(tilesetHeight / newTileSize);

    if (newColumns < 1 || newRows < 1) return; // ignore invalid
    const dimsChanged =
      newColumns !== tileset.columns || newRows !== tileset.rows;

    setStore("tilesets", tilesetIndex, "tileSize", newTileSize);
    if (dimsChanged) {
      setStore("tilesets", tilesetIndex, "columns", newColumns);
      setStore("tilesets", tilesetIndex, "rows", newRows);
      setStore(
        "tilesets",
        tilesetIndex,
        "tiles",
        createTiles(
          tilesetIndex,
          newRows,
          newColumns,
          tileset.tiles,
          oldColumns,
          oldRows
        )
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

export const setTileTint = (
  tilesetIndex: TilesetIndex,
  tileIndex: TileIndex,
  tint: string | undefined
) => {
  setStore("tilesets", tilesetIndex, "tiles", tileIndex, "tint", tint);
};

export const selectedMode = () => store.mode;

export const selectMode = (mode: DropMode) => {
  setStore("mode", mode);
};

export const showGrid = () => store.showGrid;

export const setShowGrid = (value: TileMateStoreState["showGrid"]) => {
  setStore("showGrid", value);
};

export const useTileMateStore = () => {
  return {
    // Queries
    tilesetIndices,
    tilesetImage,
    tiles,
    tile,
    columns,
    rows,
    tileSize,
    isSelectedTile,
    selectedTile,
    selectedMode,
    showGrid,

    // Commands
    addTileset,
    addEmptyTileset,
    removeTileSet,
    setColumns,
    setRows,
    setTileSize,
    selectTile,
    copyTile,
    swapTiles,
    selectMode,
    setShowGrid,
    setTileTint,
  };
};
