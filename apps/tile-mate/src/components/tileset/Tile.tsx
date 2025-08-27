import type { Component } from "solid-js";
import {
  type Tile as TileData,
  TileId,
  useTilesetContext,
} from "./TilesetContext";
import staticStyles from "./Tile.module.css";

type Props = {
  id: TileId;
};

export const Tile: Component<Props> = (props) => {
  const { tilesetImage, tileSize, selectedTile, setSelectedTile, tile } =
    useTilesetContext();

  const isSelected = () => {
    return selectedTile() === props.id;
  };

  return (
    <img
      src={tilesetImage}
      alt={`Tile ${props.id}`}
      style={getDynamicStyles({ ...tile(props.id), size: tileSize })}
      class={`${staticStyles.tile} ${
        isSelected() ? staticStyles.selected : ""
      }`}
      on:click={() => setSelectedTile(props.id)}
    />
  );
};

function getDynamicStyles({
  imgX,
  imgY,
  size,
}: Pick<TileData, "imgX" | "imgY"> & { size: number }) {
  return `
    width: ${size}px;
    height: ${size}px;
    object-position: -${imgX * size}px -${imgY * size}px;
  `;
}
