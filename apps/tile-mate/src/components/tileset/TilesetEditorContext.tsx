import {
  createContext,
  useContext,
  createSignal,
  JSX,
  Component,
} from "solid-js";
import { Tile, TileId } from "./TilesetContext";

export const DropMode = {
  Replace: "Replace",
  Swap: "Swap",
};
export type DropMode = (typeof DropMode)[keyof typeof DropMode];

type DragState = {
  isDragging: boolean;
  draggedTile: TileId | null;
  targetTile: TileId | null;
};

type TilesetEditorState = {
  mode: () => DropMode;
  selectMode: (mode: DropMode) => void;
  dragState: () => DragState;
  setDragState: (state: DragState) => void;
  // Drag handlers
  startDrag: (tileId: TileId) => void;
  updateDragTarget: (tileId: TileId) => void;
  endDrag: () => void;
  cancelDrag: () => void;
};

const TilesetEditorContext = createContext<TilesetEditorState>();

type Props = {
  children: JSX.Element;
};

export const TilesetEditorContextProvider: Component<Props> = (props) => {
  const [mode, selectMode] = createSignal<DropMode>(DropMode.Replace);
  const [dragState, setDragState] = createSignal<DragState>({
    isDragging: false,
    draggedTile: null,
    targetTile: null,
  });

  const startDrag = (tileId: TileId) => {
    setDragState({
      isDragging: true,
      draggedTile: tileId,
      targetTile: null,
    });
  };

  const updateDragTarget = (tileId: TileId) => {
    const current = dragState();
    if (current.isDragging) {
      setDragState({
        ...current,
        targetTile: tileId,
      });
    }
  };

  const endDrag = () => {
    setDragState({
      isDragging: false,
      draggedTile: null,
      targetTile: null,
    });
  };

  const cancelDrag = () => {
    setDragState({
      isDragging: false,
      draggedTile: null,
      targetTile: null,
    });
  };

  const value = {
    mode,
    selectMode,
    dragState,
    setDragState,
    startDrag,
    updateDragTarget,
    endDrag,
    cancelDrag,
  };

  return (
    <TilesetEditorContext.Provider value={value}>
      {props.children}
    </TilesetEditorContext.Provider>
  );
};

export const useTilesetEditorContext = () => {
  const context = useContext(TilesetEditorContext);
  if (!context) {
    throw new Error(
      "useTilesetEditorContext must be used within a TilesetEditorContextProvider"
    );
  }
  return context;
};
