import type { Component } from "solid-js";
import { TilesetContextProvider } from "./TilesetContext";
import { Tileset } from "./Tileset";

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
      <Tileset showGrid={showGrid} />
    </TilesetContextProvider>
  );
};
