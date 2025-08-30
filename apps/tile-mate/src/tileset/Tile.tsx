import type { Component } from "solid-js";
import { useDragAndDrop } from "../common/drag/useDrag";
import staticStyles from "./Tile.module.css";
import { DropMode, TileIndex, TilesetIndex } from "../types";
import { useTileMateStore } from "../store/TileMateStore";

type Props = {
  tilesetIndex: TilesetIndex;
  index: TileIndex;
};

export const Tile: Component<Props> = (props) => {
  const {
    isSelectedTile,
    selectedMode,
    selectTile,
    tile,
    tilesetImage,
    tileSize,
    copyTile,
    swapTiles,
  } = useTileMateStore();

  const { onPointerDown, dragState } = useDragAndDrop({
    onPickUp: () => {
      selectTile([props.tilesetIndex, props.index]);
    },
    onDrop: (hoveringElement) => {
      if (hoveringElement) {
        const tileElement: HTMLElement | undefined =
          hoveringElement.closest("[data-tile-id]");

        if (tileElement) {
          const targetId = parseInt(tileElement.dataset.tileId || "0");
          const targetTilesetIndex = parseInt(
            tileElement.dataset.tilesetId || "0"
          );
          const mode = selectedMode();

          // Don't do anything if source and target are the same tile in the same tileset
          if (
            props.index !== targetId ||
            props.tilesetIndex !== targetTilesetIndex
          ) {
            if (mode === DropMode.Copy) {
              copyTile(
                props.tilesetIndex,
                props.index,
                targetTilesetIndex,
                targetId
              );
            } else if (mode === DropMode.Swap) {
              swapTiles(
                props.tilesetIndex,
                props.index,
                targetTilesetIndex,
                targetId
              );
            }
          }
        }
      }
    },
  });

  const isDragOrigin = () => {
    const drag = dragState();

    if (!drag.isDragging) return false;

    const dragElement = drag.draggedElement as HTMLElement | undefined;
    const data = dragElement?.dataset;

    return (
      data &&
      data.tilesetId === props.tilesetIndex.toString() &&
      data.tileId === props.index.toString()
    );
  };

  const isDragTarget = () => {
    const drag = dragState();

    if (!drag.isDragging) return false;

    const hoveringTile: HTMLElement | undefined =
      drag.hoveringElement?.closest("[data-tile-id]");

    const data = hoveringTile?.dataset;

    return (
      data &&
      data.tilesetId === props.tilesetIndex.toString() &&
      data.tileId === props.index.toString()
    );
  };

  const tileData = tile(props.tilesetIndex, props.index);

  if (
    !tilesetImage(props.tilesetIndex) ||
    !tileData ||
    !("imgX" in tileData) ||
    !("imgY" in tileData)
  ) {
    return (
      <span
        data-tile-id={props.index}
        data-tileset-id={props.tilesetIndex}
        data-img="none"
        style={getDynamicStyles({ size: tileSize(props.tilesetIndex) })}
        class={`${staticStyles.tile} ${
          isSelectedTile([props.tilesetIndex, props.index]) || isDragOrigin()
            ? staticStyles.selected
            : ""
        } ${isDragTarget() ? staticStyles.dragTarget : ""}`}
        on:click={() => selectTile([props.tilesetIndex, props.index])}
        on:pointerdown={onPointerDown}
      ></span>
    );
  }

  return (
    <img
      src={tilesetImage(props.tilesetIndex)}
      alt={`Tile ${props.index}`}
      data-tile-id={props.index}
      data-tileset-id={props.tilesetIndex}
      data-img={JSON.stringify([tileData.imgX, tileData.imgY])}
      style={getDynamicStyles({
        ...tileData,
        size: tileSize(props.tilesetIndex),
      })}
      class={`${staticStyles.tile} ${
        isSelectedTile([props.tilesetIndex, props.index]) || isDragOrigin()
          ? staticStyles.selected
          : ""
      } ${isDragTarget() ? staticStyles.dragTarget : ""}`}
      on:click={() => selectTile([props.tilesetIndex, props.index])}
      on:pointerdown={onPointerDown}
    />
  );
};

function getDynamicStyles({
  imgX,
  imgY,
  size,
}: {
  imgX?: number;
  imgY?: number;
  size: number;
}) {
  const sizeStyle = `width: ${size}px; height: ${size}px;`;

  if (imgX === undefined || imgY === undefined) {
    return sizeStyle;
  }

  return `
    ${sizeStyle};
    object-position: -${imgX * size}px -${imgY * size}px;
  `;
}
