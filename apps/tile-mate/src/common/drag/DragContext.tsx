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
  startDrag: (element: Element) => void;
  updateHover: (element: Element | null) => void;
  endDrag: () => void;
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

  const startDrag = (element: Element) => {
    setDragState({
      isDragging: true,
      draggedElement: element,
      hoveringElement: null,
    });
  };

  const updateHover = (element: Element | null) => {
    const current = dragState();
    if (current.isDragging) {
      setDragState({
        ...current,
        hoveringElement: element,
      });
    }
  };

  const endDrag = () => {
    setDragState({
      isDragging: false,
      draggedElement: null,
      hoveringElement: null,
    });
  };

  const value = {
    dragState,
    setDragState,
    startDrag,
    updateHover,
    endDrag,
  };

  return (
    <DragContext.Provider value={value}>
      {props.children}
    </DragContext.Provider>
  );
};

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDragContext must be used within a DragContextProvider");
  }
  return context;
};
