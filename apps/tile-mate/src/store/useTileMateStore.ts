import { TileMateStore } from "../store/TileMateStore";
import { TileIndex, TilesetIndex } from "../types";

/**
 * Hook that provides TilesetContext-like interface using TileMateStore
 * This allows easy migration from TilesetContext to TileMateStore
 */
export const useTileMateStore = () => {
  return {
    // Properties
    tilesets: () => TileMateStore.tilesets(),
    tiles: (tileset: TilesetIndex) => TileMateStore.tiles(tileset),
    tile: (tileset: TilesetIndex, tile: TileIndex) =>
      TileMateStore.tile(tileset, tile),
    columns: (tileset: TilesetIndex) => TileMateStore.columns(tileset),
    rows: (tileset: TilesetIndex) => TileMateStore.rows(tileset),
    selectedTile: (tileset: TilesetIndex) => {
      const selected = TileMateStore.selectedTile();
      return selected && selected[0] === tileset ? selected[1] : null;
    },

    // Setters
    setColumns: (tileset: TilesetIndex, cols: number) =>
      TileMateStore.setColumns(tileset, cols),
    setRows: (tileset: TilesetIndex, rows: number) =>
      TileMateStore.setRows(tileset, rows),
    setTileSize: (tileset: TilesetIndex, tileSize: number) =>
      TileMateStore.setTileSize(tileset, tileSize),
    selectTile: (tileset: TilesetIndex, id: TileIndex | null) =>
      TileMateStore.selectTile(id ? [tileset, id] : undefined),

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
