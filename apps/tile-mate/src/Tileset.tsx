import type { Component } from "solid-js";

const tileSize = 48;
const cols = 16;
const rows = 15;

type Props = {
  tilesetImage: string;
  showGrid?: boolean | { color?: string; gap?: number };
};

const Tileset: Component<Props> = ({ tilesetImage, showGrid = false }) => {
  const grid = toGridOptions(showGrid);

  return (
    <div
      style={`
        background-color: magenta;
        display: inline-grid;
        grid-template-columns: repeat(${cols}, ${tileSize}px);
        grid-template-rows: repeat(${rows}, ${tileSize}px);
        ${grid ? `gap: ${grid.gap}; background-color: ${grid.color};` : ""}`}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <Tile
          tileset={tilesetImage}
          x={i % cols}
          y={Math.floor(i / cols)}
          size={tileSize}
        />
      ))}
    </div>
  );
};

const defaultGridOptions = { gap: "1px", color: "magenta" };

function toGridOptions(showGrid: Props["showGrid"]) {
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

const Tile = (props: {
  tileset: string;
  x: number;
  y: number;
  size: number;
}) => {
  return (
    <img
      src={props.tileset}
      alt={`Tile ${props.x},${props.y}`}
      style={`width: ${props.size}px; height: ${
        props.size
      }px; object-fit: none; object-position: -${props.x * props.size}px -${
        props.y * props.size
      }px;`}
    />
  );
};

export default Tileset;
