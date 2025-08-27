import type { Component } from "solid-js";
import { TileId, useTilesetContext } from "./TilesetContext";
import { useTilesetEditorContext, DropMode } from "./TilesetEditorContext";
import { useDragAndDrop } from "../../hooks/useDrag";
import staticStyles from "./Tile.module.css";

type Props = {
  id: TileId;
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

  const { onPointerDown } = useDragAndDrop({
    onPickUp: () => {
      setSelectedTile(props.id);
      editorContext.startDrag(props.id);
    },
    onDrag: ({ over }) => {
      const tileElement = over.closest("[data-tile-id]") as HTMLElement;
      if (tileElement) {
        const targetId = parseInt(tileElement.dataset.tileId || "0");
        editorContext.updateDragTarget(targetId);
      }
    },
    onDrop: () => {
      const dragState = editorContext.dragState();
      const mode = editorContext.mode();

      if (dragState.draggedTile !== null && dragState.targetTile !== null) {
        const sourceId = dragState.draggedTile;
        const targetId = dragState.targetTile;

        // Don't do anything if source and target are the same
        if (sourceId !== targetId) {
          if (mode === DropMode.Replace) {
            replaceTile(targetId, sourceId);
          } else if (mode === DropMode.Swap) {
            swapTiles(sourceId, targetId);
          }
        }
      }

      editorContext.endDrag();
    },
  });

  const isSelected = () => {
    return selectedTile() === props.id;
  };

  const isDragOrigin = () => {
    const drag = editorContext.dragState();
    return drag.isDragging && drag.draggedTile === props.id;
  };

  const isDragTarget = () => {
    const drag = editorContext.dragState();
    return drag.isDragging && drag.targetTile === props.id;
  };

  const handlePointerEnter = () => {
    const drag = editorContext.dragState();
    if (drag.isDragging) {
      editorContext.updateDragTarget(props.id);
    }
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
        on:pointerenter={handlePointerEnter}
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
      on:pointerenter={handlePointerEnter}
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
