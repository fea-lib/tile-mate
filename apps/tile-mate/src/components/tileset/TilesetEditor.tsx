import { type Component } from "solid-js";
import { TilesetContextProvider } from "./TilesetContext";
import {
  DropMode,
  TilesetEditorContextProvider,
  useTilesetEditorContext,
} from "./TilesetEditorContext";
import { DragContextProvider } from "../../common/drag/DragContext";
import { Tileset } from "./Tileset";
import staticStyles from "./TilesetEditor.module.css";
import { Toggle } from "../../common/toggle/Toggle";
import { ToggleGroup } from "../../common/toggle/ToggleGroup";

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
    <TilesetEditorContextProvider>
      <DragContextProvider>
        <TilesetContextProvider tileSize={tileSize} tilesetImage={tilesetImage}>
          <div class={staticStyles.tilesetEditor}>
            <Actions />
            <div class={staticStyles.tilesets}>
              <Tileset showGrid={showGrid} />
            </div>
          </div>
        </TilesetContextProvider>
      </DragContextProvider>
    </TilesetEditorContextProvider>
  );
};

const Actions: Component = () => {
  const { mode, selectMode } = useTilesetEditorContext();

  return (
    <div class={staticStyles.actions}>
      <label>Mode</label>
      <ToggleGroup>
        {Object.values(DropMode).map((value) => (
          <Toggle
            label={value}
            value={value}
            isChecked={mode() === value}
            onChange={(e) => selectMode(e.currentTarget.value)}
          />
        ))}
      </ToggleGroup>
    </div>
  );
};
