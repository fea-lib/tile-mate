import { type Component, onMount, For } from "solid-js";
import { Tileset } from "./Tileset";
import staticStyles from "./TilesetEditor.module.css";
import { Toggle } from "../toggle/Toggle";
import { ToggleGroup } from "../toggle/ToggleGroup";
import { DropMode } from "../types";
import { TileMateStore, useTileMateStore } from "../store/TileMateStore";

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
  const { tilesets } = useTileMateStore();

  onMount(async () => {
    if (tilesets().length > 0) return;

    try {
      await Promise.all([
        TileMateStore.addTileset(tilesetImage, tileSize),
        TileMateStore.addTileset(tilesetImage, tileSize),
        TileMateStore.addTileset(tilesetImage, tileSize),
        TileMateStore.addTileset(tilesetImage, tileSize),
      ]);
    } catch (error) {
      console.error("Failed to load tileset:", error);
    }
  });

  return (
    <div class={staticStyles.tilesetEditor}>
      <Actions />
      <div class={staticStyles.tilesets}>
        <For each={tilesets()}>
          {(tileset) => (
            <Tileset tilesetIndex={tileset.tileset.index} showGrid={showGrid} />
          )}
        </For>
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
