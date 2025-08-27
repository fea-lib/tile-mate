import type { Component } from "solid-js";
import { TilesetContextProvider } from "./TilesetContext";
import { Tileset } from "./Tileset";
import staticStyles from "./TilesetEditor.module.css";

type Props = {
  tilesetImage: string;
  tileSize: number;
  showGrid?: boolean | { color?: string; gap?: number };
};

export const TilesetEditor: Component<Props> = ({
  tilesetImage,
  tileSize,
  showGrid = false,
}) => {
  return (
    <TilesetContextProvider tileSize={tileSize} tilesetImage={tilesetImage}>
      <div class={staticStyles.tilesetEditor}>
        <Actions />
        <div class={staticStyles.tileset}>
          <Tileset showGrid={showGrid} />
        </div>
      </div>
    </TilesetContextProvider>
  );
};

const Actions: Component = () => {
  return (
    <div class={staticStyles.actions}>
      <button>Save</button>
      <button>Cancel</button>
    </div>
  );
};
