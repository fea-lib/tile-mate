import type { Component } from "solid-js";
import { Tile } from "./Tile";
import { TilesetContextProvider } from "./TilesetContext";

type Props = {
  columns: number;
  rows: number;
  tilesetImage: string;
  tileSize: number;
  showGrid?: boolean | { color?: string; gap?: number };
};

export const Tileset: Component<Props> = ({
  columns,
  rows,
  tilesetImage,
  tileSize,
  showGrid = false,
}) => {
  const grid = toGridOptions(showGrid);

  return (
    <TilesetContextProvider
      columns={columns}
      rows={rows}
      tileSize={tileSize}
      tilesetImage={tilesetImage}
    >
      <div style={getStyle({ grid, tileSize, columns, rows })}>
        {Array.from({ length: columns * rows }).map((_, i) => (
          <Tile x={i % columns} y={Math.floor(i / columns)} />
        ))}
      </div>
    </TilesetContextProvider>
  );
};

function getStyle({
  grid,
  tileSize,
  columns,
  rows,
}: Pick<Props, "tileSize" | "columns" | "rows"> & { grid: GridOptions }) {
  return `
    background-color: magenta;
    display: inline-grid;
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
