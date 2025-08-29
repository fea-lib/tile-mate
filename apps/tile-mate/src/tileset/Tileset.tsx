import { For, type Component } from "solid-js";
import { Tile } from "./Tile";
import { useTileMateStore } from "../store/TileMateStore";
import staticStyles from "./Tileset.module.css";
import { TilesetIndex } from "../types";
import { Input } from "../common/input/Input";

type Props = {
  tilesetIndex: TilesetIndex;
  showGrid?: boolean | { color?: string; gap?: number };
};

export const Tileset: Component<Props> = ({
  tilesetIndex,
  showGrid = false,
}) => {
  const { columns, rows, setColumns, setRows, setTileSize, tiles, tileSize } =
    useTileMateStore();

  const handleTileSizeChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      setTileSize(tilesetIndex, value);
    }
  };

  const handleColumnsChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      setColumns(tilesetIndex, value);
    }
  };

  const handleRowsChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      setRows(tilesetIndex, value);
    }
  };

  const grid = toGridOptions(showGrid);

  return (
    <div class={staticStyles.tilesetFrame}>
      <div class={staticStyles.tilesetHeader}>
        <span class={staticStyles.tilesetTitle}>Tileset {tilesetIndex}</span>
        <div class={staticStyles.tilesetControls}>
          <div class={staticStyles.controlGroup}>
            <label>Tile Size:</label>
            <Input
              type="number"
              value={tileSize(tilesetIndex)}
              onInput={handleTileSizeChange}
              min={1}
            />
          </div>
          <div class={staticStyles.controlGroup}>
            <label>Columns:</label>
            <Input
              type="number"
              value={columns(tilesetIndex)}
              onInput={handleColumnsChange}
              min={1}
            />
          </div>
          <div class={staticStyles.controlGroup}>
            <label>Rows:</label>
            <Input
              type="number"
              value={rows(tilesetIndex)}
              onInput={handleRowsChange}
              min={1}
            />
          </div>
        </div>
      </div>

      <div class={staticStyles.tilesetContent}>
        <div
          class={staticStyles.tileset}
          style={getDynamicStyle({
            grid,
            tileSize: tileSize(tilesetIndex),
            columns: columns(tilesetIndex),
            rows: rows(tilesetIndex),
          })}
        >
          <For each={tiles(tilesetIndex)}>
            {({ index }) => <Tile tilesetIndex={tilesetIndex} index={index} />}
          </For>
        </div>
      </div>
    </div>
  );
};

function getDynamicStyle({
  grid,
  tileSize,
  columns,
  rows,
}: {
  tileSize: number;
  columns: number;
  rows: number;
  grid: GridOptions;
}) {
  return `
    grid-template-columns: repeat(${columns}, ${tileSize}px);
    grid-template-rows: repeat(${rows}, ${tileSize}px);
    ${grid ? `gap: ${grid.gap}; background-color: ${grid.color};` : ""}
  `;
}

type GridOptions = {
  gap: string;
  color: string;
};

const defaultGridOptions: GridOptions = { gap: "1px", color: "magenta" };

function toGridOptions(showGrid: Props["showGrid"]): GridOptions {
  if (!showGrid) return;

  const gridOptions = { ...defaultGridOptions };

  if (showGrid === true) return gridOptions;

  if (showGrid.gap) {
    gridOptions.gap = `${showGrid.gap}px`;
  }

  if (showGrid.color) {
    gridOptions.color = showGrid.color;
  }

  return gridOptions;
}
