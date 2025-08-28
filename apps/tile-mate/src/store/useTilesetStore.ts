import { TileMateStore } from "../store/TileMateStore";
import { TileIndex, TilesetIndex, Tile } from "../types";

/**
 * Hook that provides TilesetContext-like interface using TileMateStore
 * This allows easy migration from TilesetContext to TileMateStore
 */
export const useTilesetStore = (tilesetIndex: TilesetIndex) => {
  return {
    // Properties
    get tilesetImage() {
      return TileMateStore.tilesetImage(tilesetIndex);
    },
    get tileSize() {
      return TileMateStore.tileSize(tilesetIndex);
    },
    get isLoading() {
      return TileMateStore.isLoading(tilesetIndex);
    },

    // Getters as functions (to match TilesetContext interface)
    tiles: () => TileMateStore.tiles(tilesetIndex),
    tile: (id: TileIndex) => TileMateStore.tile(tilesetIndex, id),
    columns: () => TileMateStore.columns(tilesetIndex),
    rows: () => TileMateStore.rows(tilesetIndex),
    selectedTile: () => TileMateStore.selectedTile(tilesetIndex) ?? null,

    // Setters
    setColumns: (cols: number) => TileMateStore.setColumns(tilesetIndex, cols),
    setRows: (rows: number) => TileMateStore.setRows(tilesetIndex, rows),
    setSelectedTile: (id: TileIndex | null) =>
      TileMateStore.selectTile(tilesetIndex, id ?? undefined),

    // Operations
    replaceTile: (targetId: TileIndex, sourceId: TileIndex) =>
      TileMateStore.replaceTile(tilesetIndex, targetId, sourceId),
    swapTiles: (tileId1: TileIndex, tileId2: TileIndex) =>
      TileMateStore.swapTiles(tilesetIndex, tileId1, tileId2),
  };
};
