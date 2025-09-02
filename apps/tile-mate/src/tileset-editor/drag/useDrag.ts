import { useDragContext } from "./DragContext";

type DragCallbacks = {
  onPickUp?: (element: Element) => void;
  onDrop?: (hoveringElement: Element | null) => void;
};

// Utility function to detect touch devices
const isTouchDevice = () => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
};

export const useDragAndDrop = (callbacks: DragCallbacks = {}) => {
  const { onPickUp, onDrop } = callbacks;
  const dragContext = useDragContext();

  const onPointerDown = (e: PointerEvent) => {
    e.preventDefault();

    const draggedElement = e.currentTarget as Element;
    const isTouch = isTouchDevice();

    if (isTouch) {
      // Touch device logic
      let longPressTimer: number;
      let hasLongPressed = false;

      // Disable context menu for touch
      const preventContextMenu = (e: Event) => {
        e.preventDefault();
      };

      draggedElement.addEventListener("contextmenu", preventContextMenu);

      // Start long press timer
      longPressTimer = setTimeout(() => {
        hasLongPressed = true;
        onPickUp?.(draggedElement);
        dragContext.pickUp(draggedElement);
      }, 500); // 500ms long press threshold

      const handlePointerUp = () => {
        clearTimeout(longPressTimer);
        draggedElement.removeEventListener("contextmenu", preventContextMenu);

        // Clean up listeners
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("pointermove", handlePointerMove);
      };

      const handlePointerMove = () => {
        // Cancel long press if user moves finger
        clearTimeout(longPressTimer);
        hasLongPressed = false;
        document.removeEventListener("pointermove", handlePointerMove);
      };

      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("pointermove", handlePointerMove);
    } else {
      // Desktop logic - existing drag behavior
      onPickUp?.(draggedElement);
      dragContext.pickUp(draggedElement);

      const handlePointerMove = (e: PointerEvent) => {
        const hoveringElement = document.elementFromPoint(e.clientX, e.clientY);
        dragContext.drag(hoveringElement);
      };

      const handlePointerUp = () => {
        const currentState = dragContext.dragState();
        onDrop?.(currentState.hoveringElement);
        dragContext.drop();

        // Clean up listeners
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }
  };

  const onTouchClick = (e: PointerEvent) => {
    const currentState = dragContext.dragState();

    if (currentState.isDragging) {
      const targetElement = e.currentTarget as Element;
      const draggedElement = currentState.draggedElement;

      // Only execute drop if this is NOT the dragged element
      if (targetElement !== draggedElement) {
        e.preventDefault();
        onDrop?.(targetElement);
        dragContext.drop();
      }
    }
  };

  return {
    onPointerDown,
    onTouchClick,
    dragState: dragContext.dragState,
  };
};
