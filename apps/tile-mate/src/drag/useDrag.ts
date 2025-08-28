import { useDragContext } from "./DragContext";

type DragCallbacks = {
  onPickUp?: (element: Element) => void;
  onDrop?: (hoveringElement: Element | null) => void;
};

export const useDragAndDrop = (callbacks: DragCallbacks = {}) => {
  const { onPickUp, onDrop } = callbacks;
  const dragContext = useDragContext();

  const onPointerDown = (e: PointerEvent) => {
    e.preventDefault();

    const draggedElement = e.currentTarget as Element;

    // Call pickup callback
    onPickUp?.(draggedElement);

    // Start drag in context
    dragContext.pickUp(draggedElement);

    const handlePointerMove = (e: PointerEvent) => {
      // Find the element under the pointer
      const hoveringElement = document.elementFromPoint(e.clientX, e.clientY);
      dragContext.drag(hoveringElement);
    };

    const handlePointerUp = () => {
      const currentState = dragContext.dragState();

      // Call drop callback with hovering element
      onDrop?.(currentState.hoveringElement);

      // End drag in context
      dragContext.drop();

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
