import { createSignal } from "solid-js";

export type DragPoint = { tilesetIndex: number; tileIndex: number };

const [dragSource, setDragSource] = createSignal<DragPoint | undefined>();
const [hoverTarget, setHoverTarget] = createSignal<DragPoint | undefined>();
const [isDragging, setIsDragging] = createSignal(false);
const [isPersistent, setIsPersistent] = createSignal(false);
const [awaitingTarget, setAwaitingTarget] = createSignal(false); // true after persistent drag first release

type StartDragOptions = { persistent?: boolean };

export function startDrag(point: DragPoint, options?: StartDragOptions) {
  setDragSource(point);
  setHoverTarget(undefined);
  setIsDragging(true);
  const persistent = !!options?.persistent;
  setIsPersistent(persistent);
  setAwaitingTarget(false);
  if (!persistent) {
    const onUp = () => endDrag();
    window.addEventListener("pointerup", onUp, { once: true });
  }
}

export function updateHover(point: DragPoint | undefined) {
  setHoverTarget(point);
}

export function endDrag() {
  setIsDragging(false);
  setIsPersistent(false);
  setAwaitingTarget(false);
  setDragSource(undefined);
  setHoverTarget(undefined);
}

export const dragState = () => ({
  source: dragSource(),
  hover: hoverTarget(),
  isDragging: isDragging(),
  isPersistent: isPersistent(),
  awaitingTarget: awaitingTarget(),
});

export const dragSignals = {
  dragSource,
  hoverTarget,
  isDragging,
  isPersistent,
  awaitingTarget,
  setAwaitingTarget,
};
