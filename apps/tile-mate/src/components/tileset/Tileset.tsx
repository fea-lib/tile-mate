import type { Component } from "solid-js";
import { Tile } from "./Tile";
import { useTilesetContext } from "./TilesetContext";
import staticStyles from "./Tileset.module.css";

type Props = {
  showGrid?: boolean | { color?: string; gap?: number };
};

export const Tileset: Component<Props> = ({ showGrid = false }) => {
  const { tileSize, columns, rows } = useTilesetContext();

  const grid = toGridOptions(showGrid);

  return (
    <div
      class={staticStyles.tileset}
      style={getDynamicStyle({
        grid,
        tileSize,
        columns: columns(),
        rows: rows(),
      })}
    >
      {Array.from({ length: columns() * rows() }).map((_, i) => (
        <Tile x={i % columns()} y={Math.floor(i / columns())} />
      ))}
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
