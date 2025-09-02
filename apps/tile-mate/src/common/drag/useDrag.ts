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

    // Immediately prevent default to stop scrolling conflicts
    e.preventDefault();
    e.stopPropagation();

    // Track whether we've actually started a drag
    let dragging = false;
    let dragStartTimer: number | undefined;
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const LONG_PRESS_MS = 300;

    console.log(
      "👆 Touch detected on:",
      draggedElement.tagName,
      draggedElement.dataset
    );

    const startDrag = () => {
      if (dragging) return;
      dragging = true;

      console.log("🚀 Starting drag mode!");

      // Disable scrolling more aggressively
      document.body.style.touchAction = "none";
      document.body.style.overflow = "hidden";

      // Call pickup callback FIRST
      onPickUp?.(draggedElement);
      // Then start drag in context
      dragContext.pickUp(draggedElement); // Capture pointer so subsequent events are targeted here
      try {
        draggedElement.setPointerCapture?.(pointerId);
      } catch {}

      // Skip haptic feedback due to browser restrictions
      // if ("vibrate" in navigator) {
      //   navigator.vibrate(50);
      // }
    };

    const resetDragStyles = () => {
      // Re-enable scrolling
      document.body.style.touchAction = "";
      document.body.style.overflow = "";
    };

    // For mouse/pen, start drag immediately; for touch, require long press
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      console.log("🖱️ Mouse/pen detected - starting drag immediately");
      startDrag();
    } else {
      console.log("👆 Touch detected - starting long press timer");
      // For touch: Require deliberate long press
      // Start timer but don't allow scrolling to interfere
      dragStartTimer = window.setTimeout(() => {
        console.log("⏰ Long press timer fired!");
        startDrag();
      }, LONG_PRESS_MS) as unknown as number;
    }

    const clearTimer = () => {
      if (dragStartTimer !== undefined) {
        window.clearTimeout(dragStartTimer);
        dragStartTimer = undefined;
      }
    };

    const handlePointerMove = (evt: PointerEvent) => {
      // Always prevent default during any movement to stop scrolling
      evt.preventDefault();
      evt.stopPropagation();

      if (!dragging) {
        // If user moves significantly before long press completes, cancel drag
        const dx = Math.abs(evt.clientX - startX);
        const dy = Math.abs(evt.clientY - startY);
        const MOVE_THRESHOLD = 15; // Reduced threshold for more sensitivity

        if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
          console.log(
            `❌ Movement too large (${dx}, ${dy}) - canceling drag timer`
          );
          clearTimer();
          return;
        }
        return;
      }

      console.log("🎯 Dragging - updating position");

      // Use geometric hit detection only - more reliable than DOM methods
      let hoveringElement: Element | null = null;

      console.log("🔍 Using geometric hit detection for all tiles");
      const allTiles = document.querySelectorAll("[data-tile-id]");
      let bestMatch: Element | null = null;
      let smallestDistance = Infinity;

      for (const tile of allTiles) {
        if (tile === draggedElement) continue; // Skip the dragged element

        const rect = tile.getBoundingClientRect();
        const tileCenterX = rect.left + rect.width / 2;
        const tileCenterY = rect.top + rect.height / 2;

        // Calculate distance from cursor to tile center
        const distance = Math.sqrt(
          Math.pow(evt.clientX - tileCenterX, 2) +
            Math.pow(evt.clientY - tileCenterY, 2)
        );

        // Check if cursor is within tile bounds
        const isWithinBounds =
          evt.clientX >= rect.left &&
          evt.clientX <= rect.right &&
          evt.clientY >= rect.top &&
          evt.clientY <= rect.bottom;

        if (isWithinBounds && distance < smallestDistance) {
          bestMatch = tile;
          smallestDistance = distance;
        }
      }

      if (bestMatch) {
        hoveringElement = bestMatch;
        console.log(
          "🔍 Found tile geometrically:",
          (bestMatch as HTMLElement).dataset
        );
      } else {
        console.log("🔍 No tile found within cursor bounds");
      }

      console.log(
        "🎯 Final result:",
        "-> Tile:",
        hoveringElement?.tagName,
        (hoveringElement as HTMLElement)?.dataset
      );

      dragContext.drag(hoveringElement);
    };

    const handlePointerUp = (evt: PointerEvent) => {
      evt.preventDefault();
      evt.stopPropagation();

      console.log("👆 Pointer up - dragging:", dragging);
      clearTimer();

      if (dragging) {
        console.log("🎯 Ending drag mode");

        const currentState = dragContext.dragState();
        console.log("🎯 Final drop state:", {
          hoveringElement: currentState.hoveringElement?.tagName,
          dataset: (currentState.hoveringElement as HTMLElement)?.dataset,
          draggedElement: (currentState.draggedElement as HTMLElement)?.dataset,
        });

        // Reset styles first
        resetDragStyles();

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
