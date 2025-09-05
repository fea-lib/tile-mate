import { type Component, JSX, splitProps } from "solid-js";
import { useDragAndDrop } from "./drag/useDrag";
import staticStyles from "./Tile.module.css";
import { DropMode, TileIndex, TilesetIndex } from "../types";
import { useTileMateStore } from "../store/TileMateStore";
import { showModal } from "../common/modal/Modal";
import { TileEditForm } from "./TileEditForm";
import { StyledComponentProps } from "../common/StyledComponent";

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
    tileSize,
    copyTile,
    swapTiles,
    setTileTint,
  } = useTileMateStore();

  const { onPointerDown, onTouchClick, dragState } = useDragAndDrop({
    onDrop: (hoveringElement) => {
      if (hoveringElement) {
        const tileElement: HTMLElement | undefined =
          hoveringElement.closest("[data-tile-id]");

        if (tileElement) {
          const targetId = parseInt(tileElement.dataset.tileId || "0");
          const targetTilesetIndex = parseInt(
            tileElement.dataset.tilesetId || "0"
          );

          // Get source from the actual dragged element, not current tile props
          const currentState = dragState();
          const draggedElement = currentState.draggedElement as HTMLElement;
          const sourceIndex = parseInt(draggedElement?.dataset.tileId || "0");
          const sourceTilesetIndex = parseInt(
            draggedElement?.dataset.tilesetId || "0"
          );

          const mode = selectedMode();

          // Don't do anything if source and target are the same tile in the same tileset
          if (
            sourceIndex !== targetId ||
            sourceTilesetIndex !== targetTilesetIndex
          ) {
            if (mode === DropMode.Copy) {
              copyTile(
                sourceTilesetIndex,
                sourceIndex,
                targetTilesetIndex,
                targetId
              );
            } else if (mode === DropMode.Swap) {
              swapTiles(
                sourceTilesetIndex,
                sourceIndex,
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

  const isDragging = () => {
    const drag = dragState();
    const element = drag.draggedElement as HTMLElement;

    return (
      drag.isDragging &&
      element &&
      element.dataset.tileId === props.index.toString() &&
      element.dataset.tilesetId === props.tilesetIndex.toString()
    );
  };

  const img = () => tile(props.tilesetIndex, props.index).img;
  const tint = () => tile(props.tilesetIndex, props.index).tint;

  const handleDoubleClick = () => {
    if (!img()) return;

    const close = showModal({
      title: "Tint Tile",
      children: () => (
        <TileEditForm
          tilesetIndex={props.tilesetIndex}
          tileIndex={props.index}
          initialTint={tint()}
          onAccept={(tint) => {
            setTileTint(props.tilesetIndex, props.index, tint);
            close();
          }}
          onCancel={() => {
            close();
          }}
        />
      ),
    });
  };

  return (
    <Image
      tilesetIndex={props.tilesetIndex}
      tileIndex={props.index}
      tileSize={tileSize(props.tilesetIndex)}
      img={img()}
      tint={tint()}
      class={`${
        isSelectedTile([props.tilesetIndex, props.index]) || isDragOrigin()
          ? staticStyles.selected
          : ""
      } ${isDragTarget() ? staticStyles.dragTarget : ""} ${
        isDragging() ? staticStyles.dragging : ""
      }`}
      onClick={() => selectTile([props.tilesetIndex, props.index])}
      onDblClick={handleDoubleClick}
      onPointerDown={onPointerDown}
      onPointerUp={onTouchClick}
      data-tile-id={props.index.toString()}
      data-tileset-id={props.tilesetIndex.toString()}
      data-img={img() ? JSON.stringify([img().x, img().y]) : "none"}
    />
  );
};

type ImageProps = StyledComponentProps<
  {
    tilesetIndex: TilesetIndex;
    tileIndex: TileIndex;
    tileSize: number;
    img?: {
      src: string;
      x: number;
      y: number;
    };
    tint?: string;
  } & Pick<
    JSX.HTMLAttributes<HTMLElement>,
    "onClick" | "onDblClick" | "onPointerDown" | "onPointerUp"
  > &
    Record<`data-${string}`, any>
>;

export const Image: Component<ImageProps> = (props) => {
  const [control, rest] = splitProps(props, [
    "img",
    "tint",
    "tilesetIndex",
    "tileIndex",
    "tileSize",
    "class",
    "style",
  ]);

  // Reactive background styling (recomputes on control.img/control.tint changes)
  const backgroundStyles = () => {
    const img = control.img; // reactive read
    const tint = control.tint; // reactive read
    if (!img) return "";
    const offsetX = img.x * control.tileSize;
    const offsetY = img.y * control.tileSize;
    if (tint) {
      const rgb = hexToRgb(tint);
      return `background-image: url(${img.src}); background-color: rgba(${rgb},0.7); background-blend-mode: multiply; background-position: -${offsetX}px -${offsetY}px; background-repeat: no-repeat; image-rendering: pixelated;`;
    }
    return `background-image: url(${img.src}); background-position: -${offsetX}px -${offsetY}px; background-repeat: no-repeat; image-rendering: pixelated;`;
  };

  return (
    <div
      {...rest}
      role="button"
      aria-label={`Tile ${control.tileIndex}`}
      data-tileset-id={control.tilesetIndex}
      data-tile-id={control.tileIndex}
      style={`position: relative; display: inline-block; width: ${
        control.tileSize
      }px; height: ${control.tileSize}px; ${backgroundStyles()} ${
        control.style
      }`}
      class={`${staticStyles.tile} ${control.class}`}
    >
      {!control.img && <span class={staticStyles.tileImage} />}
    </div>
  );
};

// Convert hex color (#rgb or #rrggbb) to r,g,b string; fallback to magenta if invalid
function hexToRgb(hex: string): string {
  if (!hex) return "255,0,255"; // fallback
  let value = hex.replace("#", "").trim();
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (value.length !== 6 || /[^0-9a-fA-F]/.test(value)) return "255,0,255";
  const num = parseInt(value, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r},${g},${b}`;
}
