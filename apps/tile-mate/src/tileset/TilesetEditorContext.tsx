import {
  createContext,
  useContext,
  createSignal,
  JSX,
  Component,
} from "solid-js";
import { DropMode } from "../types";

type TilesetEditorState = {
  mode: () => DropMode;
  selectMode: (mode: DropMode) => void;
};
const TilesetEditorContext = createContext<TilesetEditorState>();

type Props = {
  children: JSX.Element;
};

export const TilesetEditorContextProvider: Component<Props> = (props) => {
  const [mode, selectMode] = createSignal<DropMode>(DropMode.Replace);

  const value = {
    mode,
    selectMode,
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
