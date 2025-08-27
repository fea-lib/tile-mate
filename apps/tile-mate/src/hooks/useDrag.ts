type DragCallbacks = {
  onPickUp?: () => void;
  onDrag?: (params: { over: Element }) => void;
  onDrop?: () => void;
};

export const useDragAndDrop = (callbacks: DragCallbacks = {}) => {
  const { onPickUp, onDrag, onDrop } = callbacks;

  const onPointerDown = (e: PointerEvent) => {
    e.preventDefault();

    // Call pickup callback
    onPickUp?.();

    const handlePointerMove = (e: PointerEvent) => {
      // Find the element under the pointer
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element && onDrag) {
        onDrag({ over: element });
      }
    };

    const handlePointerUp = () => {
      // Call drop callback
      onDrop?.();

      // Clean up listeners
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  return {
    onPointerDown,
  };
};
