import { type Component, createEffect, createSignal, onMount } from "solid-js";
import { Tileset } from "./Tileset";
import staticStyles from "./TilesetEditor.module.css";
import { Toggle } from "../toggle/Toggle";
import { ToggleGroup } from "../toggle/ToggleGroup";
import { DropMode, TilesetIndex } from "../types";
import { TileMateStore } from "../store";

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
  const [tilesetIndex, setTilesetIndex] = createSignal<TilesetIndex | null>(
    null
  );

  onMount(async () => {
    try {
      const index = await TileMateStore.addTileset(tilesetImage, tileSize);
      setTilesetIndex(index);
    } catch (error) {
      console.error("Failed to load tileset:", error);
    }
  });

  return (
    <div class={staticStyles.tilesetEditor}>
      <Actions />
      <div class={staticStyles.tilesets}>
        {tilesetIndex() !== null && (
          <Tileset tilesetIndex={tilesetIndex()!} showGrid={showGrid} />
        )}
      </div>
    </div>
  );
};

const Actions: Component = () => {
  return (
    <div class={staticStyles.actions}>
      <label>Mode</label>
      <ToggleGroup>
        {Object.values(DropMode).map((value) => (
          <Toggle
            label={value}
            value={value}
            isChecked={TileMateStore.selectedMode() === value}
            onChange={(e) =>
              TileMateStore.selectMode(e.currentTarget.value as DropMode)
            }
          />
        ))}
      </ToggleGroup>
    </div>
  );
};
