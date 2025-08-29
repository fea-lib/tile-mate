import type { Component } from "solid-js";
import tilesetImage from "./tileset.png";
import { TilesetEditor } from "./editor/TilesetEditor";
import { DragContextProvider } from "./common/drag/DragContext";

const tileSize = 48;

const App: Component = () => {
  return (
    <DragContextProvider>
      <TilesetEditor showGrid tilesetImage={tilesetImage} tileSize={tileSize} />
    </DragContextProvider>
  );
};

export default App;
