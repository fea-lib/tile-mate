import { useDragContext } from "./DragContext";

type DragCallbacks = {
  onPickUp?: (element: Element) => void;
  onDrop?: (hoveringElement: Element | null) => void;
};

export const useDragAndDrop = (callbacks: DragCallbacks = {}) => {
  const { onPickUp, onDrop } = callbacks;
  const dragContext = useDragContext();

  const onPointerDown = (e: PointerEvent) => {
    const draggedElement = e.currentTarget as HTMLElement;

    // Track whether we've actually started a drag
    let dragging = false;
    let dragStartTimer: number | undefined;
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const MOVE_THRESHOLD = 6; // px
    const LONG_PRESS_MS = 200; // touch-only

    const startDrag = () => {
      if (dragging) return;
      dragging = true;
      // Call pickup callback
      onPickUp?.(draggedElement);
      // Start drag in context
      dragContext.pickUp(draggedElement);
      // Capture pointer so subsequent events are targeted here
      try {
        draggedElement.setPointerCapture?.(pointerId);
      } catch {}
    };

    // For mouse/pen, start drag immediately anywhere; for touch, restrict to handle area + short long-press.
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      e.preventDefault();
      startDrag();
    } else {
      // touch: Only initiate a drag if pressed within the bottom-right handle region
      const rect = draggedElement.getBoundingClientRect();
      const HANDLE_SIZE = Math.min(18, Math.max(12, Math.floor(rect.width * 0.25)));
      const withinHandle =
        e.clientX >= rect.right - HANDLE_SIZE &&
        e.clientY >= rect.bottom - HANDLE_SIZE;

      if (!withinHandle) {
        // Not in handle; let scroll happen
        return;
      }

      // In handle: schedule long-press to initiate drag; allow scroll if user moves away/scrolls
      dragStartTimer = window.setTimeout(startDrag, LONG_PRESS_MS) as unknown as number;
    }

    const clearTimer = () => {
      if (dragStartTimer !== undefined) {
        window.clearTimeout(dragStartTimer);
        dragStartTimer = undefined;
      }
    };

    const handlePointerMove = (evt: PointerEvent) => {
      const dx = Math.abs(evt.clientX - startX);
      const dy = Math.abs(evt.clientY - startY);

      if (!dragging) {
        // If the user starts moving before long-press, assume scroll intent; cancel drag.
        if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
          clearTimer();
          // Do not start drag; let browser handle scroll.
          return;
        }
        return;
      }

      // When dragging, prevent native scrolling gestures
      evt.preventDefault();
      const hoveringElement = document.elementFromPoint(
        evt.clientX,
        evt.clientY
      );
      dragContext.drag(hoveringElement);
    };

    const handlePointerUp = () => {
      clearTimer();

      if (dragging) {
        const currentState = dragContext.dragState();
        // Call drop callback with hovering element
        onDrop?.(currentState.hoveringElement);
        // End drag in context
        dragContext.drop();
        try {
          draggedElement.releasePointerCapture?.(pointerId);
        } catch {}
      }

      // Clean up listeners
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  return {
    onPointerDown,
    dragState: dragContext.dragState,
  };
};
