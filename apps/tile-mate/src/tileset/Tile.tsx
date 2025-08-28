import type { Component } from "solid-js";
import { useTilesetContext } from "./TilesetContext";
import { useTilesetEditorContext } from "./TilesetEditorContext";
import { useDragAndDrop } from "../drag/useDrag";
import staticStyles from "./Tile.module.css";
import { DropMode, TileIndex } from "../types";

type Props = {
  id: TileIndex;
};

export const Tile: Component<Props> = (props) => {
  const {
    tilesetImage,
    tileSize,
    selectedTile,
    setSelectedTile,
    tile,
    replaceTile,
    swapTiles,
  } = useTilesetContext();
  const editorContext = useTilesetEditorContext();

  const { onPointerDown, dragState } = useDragAndDrop({
    onPickUp: () => {
      setSelectedTile(props.id);
    },
    onDrop: (hoveringElement) => {
      if (hoveringElement) {
        const tileElement: HTMLElement | undefined =
          hoveringElement.closest("[data-tile-id]");

        if (tileElement) {
          const targetId = parseInt(tileElement.dataset.tileId || "0");
          const mode = editorContext.mode();

          // Don't do anything if source and target are the same
          if (props.id !== targetId) {
            if (mode === DropMode.Replace) {
              replaceTile(targetId, props.id);
            } else if (mode === DropMode.Swap) {
              swapTiles(props.id, targetId);
            }
          }
        }
      }
    },
  });

  const isSelected = () => {
    return selectedTile() === props.id;
  };

  const isDragOrigin = () => {
    const drag = dragState();

    return (
      drag.isDragging &&
      (drag.draggedElement as HTMLElement)?.dataset?.tileId ===
        props.id.toString()
    );
  };

  const isDragTarget = () => {
    const drag = dragState();
    const hoveringTile: HTMLElement | undefined =
      drag.hoveringElement?.closest("[data-tile-id]");

    return (
      drag.isDragging && hoveringTile?.dataset?.tileId === props.id.toString()
    );
  };

  const tileData = tile(props.id);

  if (!("imgX" in tileData) || !("imgY" in tileData)) {
    return (
      <span
        data-tile-id={props.id}
        style={getDynamicStyles({ size: tileSize })}
        class={`${staticStyles.tile} ${
          isSelected() || isDragOrigin() ? staticStyles.selected : ""
        } ${isDragTarget() ? staticStyles.dragTarget : ""}`}
        on:click={() => setSelectedTile(props.id)}
        on:pointerdown={onPointerDown}
      ></span>
    );
  }

  return (
    <img
      src={tilesetImage}
      alt={`Tile ${props.id}`}
      data-tile-id={props.id}
      style={getDynamicStyles({ ...tileData, size: tileSize })}
      class={`${staticStyles.tile} ${
        isSelected() || isDragOrigin() ? staticStyles.selected : ""
      } ${isDragTarget() ? staticStyles.dragTarget : ""}`}
      on:click={() => setSelectedTile(props.id)}
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
