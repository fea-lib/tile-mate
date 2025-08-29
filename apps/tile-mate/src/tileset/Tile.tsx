import type { Component } from "solid-js";
import { useDragAndDrop } from "../drag/useDrag";
import staticStyles from "./Tile.module.css";
import { DropMode, TileIndex, TilesetIndex } from "../types";
import { useTileMateStore, TileMateStore } from "../store";

type Props = {
  tilesetIndex: TilesetIndex;
  index: TileIndex;
};

export const Tile: Component<Props> = (props) => {
  const store = useTileMateStore();
  const tilesetImage = () => TileMateStore.tilesetImage(props.tilesetIndex);
  const tileSize = () => TileMateStore.tileSize(props.tilesetIndex);
  const selectedTile = () => store.selectedTile(props.tilesetIndex);
  const selectTile = (id: TileIndex | null) =>
    store.selectTile(props.tilesetIndex, id);
  const tile = () => store.tile(props.tilesetIndex, props.index);
  const replaceTile = (targetId: TileIndex, sourceId: TileIndex) =>
    store.replaceTile(props.tilesetIndex, targetId, sourceId);
  const swapTiles = (tileId1: TileIndex, tileId2: TileIndex) =>
    store.swapTiles(props.tilesetIndex, tileId1, tileId2);

  const { onPointerDown, dragState } = useDragAndDrop({
    onPickUp: () => {
      selectTile(props.index);
    },
    onDrop: (hoveringElement) => {
      if (hoveringElement) {
        const tileElement: HTMLElement | undefined =
          hoveringElement.closest("[data-tile-id]");

        if (tileElement) {
          const targetId = parseInt(tileElement.dataset.tileId || "0");
          const mode = TileMateStore.selectedMode();

          // Don't do anything if source and target are the same
          if (props.index !== targetId) {
            if (mode === DropMode.Replace) {
              replaceTile(targetId, props.index);
            } else if (mode === DropMode.Swap) {
              swapTiles(props.index, targetId);
            }
          }
        }
      }
    },
  });

  const isSelected = () => {
    return selectedTile() === props.index;
  };

  const isDragOrigin = () => {
    const drag = dragState();

    return (
      drag.isDragging &&
      (drag.draggedElement as HTMLElement)?.dataset?.tileId ===
        props.index.toString()
    );
  };

  const isDragTarget = () => {
    const drag = dragState();
    const hoveringTile: HTMLElement | undefined =
      drag.hoveringElement?.closest("[data-tile-id]");

    return (
      drag.isDragging &&
      hoveringTile?.dataset?.tileId === props.index.toString()
    );
  };

  const tileData = tile();

  if (!tileData || !("imgX" in tileData) || !("imgY" in tileData)) {
    return (
      <span
        data-tile-id={props.index}
        style={getDynamicStyles({ size: tileSize() })}
        class={`${staticStyles.tile} ${
          isSelected() || isDragOrigin() ? staticStyles.selected : ""
        } ${isDragTarget() ? staticStyles.dragTarget : ""}`}
        on:click={() => selectTile(props.index)}
        on:pointerdown={onPointerDown}
      ></span>
    );
  }

  return (
    <img
      src={tilesetImage()}
      alt={`Tile ${props.index}`}
      data-tile-id={props.index}
      style={getDynamicStyles({ ...tileData, size: tileSize() })}
      class={`${staticStyles.tile} ${
        isSelected() || isDragOrigin() ? staticStyles.selected : ""
      } ${isDragTarget() ? staticStyles.dragTarget : ""}`}
      on:click={() => selectTile(props.index)}
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
