import { createSignal } from "solid-js";

export type DragPoint = { tilesetIndex: number; tileIndex: number };

const [dragSource, setDragSource] = createSignal<DragPoint | undefined>();
const [hoverTarget, setHoverTarget] = createSignal<DragPoint | undefined>();
const [isDragging, setIsDragging] = createSignal(false);

export function startDrag(point: DragPoint) {
  setDragSource(point);
  setHoverTarget(undefined);
  setIsDragging(true);
  const onUp = () => endDrag();
  window.addEventListener("pointerup", onUp, { once: true });
}

export function updateHover(point: DragPoint | undefined) {
  setHoverTarget(point);
}

export function endDrag() {
  setIsDragging(false);
  setDragSource(undefined);
  setHoverTarget(undefined);
}

export const dragState = () => ({
  source: dragSource(),
  hover: hoverTarget(),
  isDragging: isDragging(),
});

export const dragSignals = {
  dragSource,
  hoverTarget,
  isDragging,
};
