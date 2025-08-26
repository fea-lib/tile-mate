import type { Component } from "solid-js";
import { useTilesetContext } from "./TilesetContext";

type Props = {
  x: number;
  y: number;
};

export const Tile: Component<Props> = (props) => {
  const { tilesetImage, tileSize, selectedTile, setSelectedTile } =
    useTilesetContext();

  const isSelected = () => {
    const selected = selectedTile();
    return selected && selected.x === props.x && selected.y === props.y;
  };

  return (
    <img
      src={tilesetImage()}
      alt={`Tile ${props.x},${props.y}`}
      style={getStyle({ ...props, size: tileSize, isSelected: isSelected() })}
      on:click={() => setSelectedTile({ x: props.x, y: props.y })}
    />
  );
};

function getStyle({
  x,
  y,
  size,
  isSelected,
}: Props & { size: number; isSelected: boolean }) {
  return `
    width: ${size}px;
    height: ${size}px;
    object-fit: none;
    object-position: -${x * size}px -${y * size}px;
    ${isSelected ? "outline: 2px solid blue; outline-offset: -2px" : ""}
  `;
}
