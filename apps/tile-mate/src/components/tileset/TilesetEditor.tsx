import { createSignal, type Component } from "solid-js";
import { TilesetContextProvider } from "./TilesetContext";
import { Tileset } from "./Tileset";
import staticStyles from "./TilesetEditor.module.css";
import { Toggle } from "../toggle/Toggle";
import { ToggleGroup } from "../toggle/ToggleGroup";

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
        <div class={staticStyles.tilesets}>
          <Tileset showGrid={showGrid} />
        </div>
      </div>
    </TilesetContextProvider>
  );
};

const Modes = {
  Replace: "Replace",
  Insert: "Insert",
  Swap: "Swap",
};

const Actions: Component = () => {
  const [selectedMode, setSelectedMode] = createSignal(Modes.Replace);

  return (
    <div class={staticStyles.actions}>
      <label>Mode</label>
      <ToggleGroup>
        {Object.values(Modes).map((mode) => (
          <Toggle
            label={mode}
            value={mode}
            isChecked={selectedMode() === mode}
            onChange={(e) => setSelectedMode(e.currentTarget.value)}
          />
        ))}
      </ToggleGroup>
    </div>
  );
};
