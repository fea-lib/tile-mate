import type { Component } from "solid-js";
import Tileset from "./Tileset";
import tilesetImage from "./tileset.png";

const App: Component = () => {
  return <Tileset showGrid tilesetImage={tilesetImage} />;
};

export default App;
