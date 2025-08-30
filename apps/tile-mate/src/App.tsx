import type { Component } from "solid-js";
import tilesetImage from "./tileset.png";
import { TilesetEditor } from "./editor/TilesetEditor";
import { DragContextProvider } from "./common/drag/DragContext";
import { attachDebugger } from "@solid-devtools/debugger";

const tileSize = 48;

const App: Component = () => {
  attachDebugger();
  return (
    <DragContextProvider>
      <TilesetEditor tilesetImage={tilesetImage} tileSize={tileSize} />
    </DragContextProvider>
  );
};

export default App;
