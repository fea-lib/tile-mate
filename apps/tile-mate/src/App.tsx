import { onMount, type Component } from "solid-js";
import tilesetImage from "./tileset.png";
import { TilesetEditor } from "./tileset-editor/TilesetEditor";
import { useTileMateStore } from "./store/TileMateStore";

const tileSize = 48;

const App: Component = () => {
  const { addTileset, tilesets } = useTileMateStore();

  onMount(async () => {
    if (tilesets().length > 0) return;

    try {
      await Promise.all([addTileset(tilesetImage, tileSize)]);
    } catch (error) {
      console.error("Failed to load tileset:", error);
    }
  });
  return <TilesetEditor />;
};

export default App;
