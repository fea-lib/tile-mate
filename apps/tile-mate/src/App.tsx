import type { Component } from "solid-js";
import { Tileset } from "./components/tileset/Tileset";
import tilesetImage from "./tileset.png";

const tileSize = 48;
const cols = 16;
const rows = 15;

const App: Component = () => {
  return (
    <Tileset
      showGrid
      columns={cols}
      rows={rows}
      tilesetImage={tilesetImage}
      tileSize={tileSize}
    />
  );
};

export default App;
