import type { Component } from "solid-js";
import tilesetImage from "./tileset.png";
import { TilesetEditor } from "./tileset/TilesetEditor";

const tileSize = 48;

const App: Component = () => {
  return (
    <TilesetEditor showGrid tilesetImage={tilesetImage} tileSize={tileSize} />
  );
};

export default App;
