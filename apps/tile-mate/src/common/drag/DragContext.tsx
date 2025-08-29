import {
  createContext,
  useContext,
  createSignal,
  JSX,
  Component,
} from "solid-js";

type DragState = {
  isDragging: boolean;
  draggedElement: Element | null;
  hoveringElement: Element | null;
};

type DragContextState = {
  dragState: () => DragState;
  setDragState: (state: DragState) => void;
  pickUp: (element: Element) => void;
  drag: (element: Element | null) => void;
  drop: () => void;
};

const DragContext = createContext<DragContextState>();

type Props = {
  children: JSX.Element;
};

export const DragContextProvider: Component<Props> = (props) => {
  const [dragState, setDragState] = createSignal<DragState>({
    isDragging: false,
    draggedElement: null,
    hoveringElement: null,
  });

  const pickUp = (draggedElement: Element) => {
    setDragState({
      isDragging: true,
      draggedElement,
      hoveringElement: null,
    });
  };

  const drag = (hoveringElement: Element | null) => {
    const current = dragState();
    if (current.isDragging) {
      setDragState({
        ...current,
        hoveringElement,
      });
    }
  };

  const drop = () => {
    setDragState({
      isDragging: false,
      draggedElement: null,
      hoveringElement: null,
    });
  };

  const value = {
    dragState,
    setDragState,
    pickUp,
    drag,
    drop,
  };

  return (
    <DragContext.Provider value={value}>{props.children}</DragContext.Provider>
  );
};

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDragContext must be used within a DragContextProvider");
  }
  return context;
};
