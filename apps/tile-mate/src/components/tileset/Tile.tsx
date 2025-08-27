import type { Component } from "solid-js";
import { useTilesetContext } from "./TilesetContext";
import staticStyles from "./Tile.module.css";

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
      src={tilesetImage}
      alt={`Tile ${props.x},${props.y}`}
      style={getDynamicStyles({ ...props, size: tileSize })}
      class={`${staticStyles.tile} ${
        isSelected() ? staticStyles.selected : ""
      }`}
      on:click={() => setSelectedTile({ x: props.x, y: props.y })}
    />
  );
};

function getDynamicStyles({ x, y, size }: Props & { size: number }) {
  return `
    width: ${size}px;
    height: ${size}px;
    object-position: -${x * size}px -${y * size}px;
  `;
}
