import { For, type Component } from "solid-js";
import { Tile } from "./Tile";
import { useTileMateStore, TileMateStore } from "../store";
import staticStyles from "./Tileset.module.css";
import { TilesetIndex } from "../types";

type Props = {
  tilesetIndex: TilesetIndex;
  showGrid?: boolean | { color?: string; gap?: number };
};

export const Tileset: Component<Props> = ({
  tilesetIndex,
  showGrid = false,
}) => {
  const store = useTileMateStore();
  const tileSize = () => TileMateStore.tileSize(tilesetIndex);
  const columns = () => store.columns(tilesetIndex);
  const rows = () => store.rows(tilesetIndex);
  const tiles = () => store.tiles(tilesetIndex);

  const grid = toGridOptions(showGrid);

  return (
    <div class={staticStyles.tilesetFrame}>
      <div class={staticStyles.tilesetHeader}>
        <span class={staticStyles.tilesetTitle}>Tileset {tilesetIndex}</span>
        <div class={staticStyles.tilesetInfo}>
          {TileMateStore.columns(tilesetIndex)} ×{" "}
          {TileMateStore.rows(tilesetIndex)} tiles
        </div>
      </div>
      <div class={staticStyles.tilesetContent}>
        <div
          class={staticStyles.tileset}
          style={getDynamicStyle({
            grid,
            tileSize: tileSize(),
            columns: columns(),
            rows: rows(),
          })}
        >
          <For each={tiles()}>
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
