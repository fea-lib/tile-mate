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

  const value = {
    mode,
    selectMode,
    dragState,
    setDragState,
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
