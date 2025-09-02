import { type Component } from "solid-js";
import { TilesetEditor } from "./tileset-editor/TilesetEditor";
import { useTileMateStore } from "./store/TileMateStore";

const App: Component = () => {
  const { addTileset, tilesets } = useTileMateStore();

  return <TilesetEditor />;
};

export default App;
