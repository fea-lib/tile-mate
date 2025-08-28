import { type Component, createSignal, onMount, For } from "solid-js";
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
  const [tilesetIndices, setTilesetIndices] = createSignal<TilesetIndex[]>([]);

  onMount(async () => {
    try {
      const index1 = await TileMateStore.addTileset(tilesetImage, tileSize);
      const index2 = await TileMateStore.addTileset(tilesetImage, tileSize);
      const index3 = await TileMateStore.addTileset(tilesetImage, tileSize);
      const index4 = await TileMateStore.addTileset(tilesetImage, tileSize);
      setTilesetIndices([index1, index2, index3, index4]);
    } catch (error) {
      console.error("Failed to load tileset:", error);
    }
  });

  return (
    <div class={staticStyles.tilesetEditor}>
      <Actions />
      <div class={staticStyles.tilesets}>
        <For each={tilesetIndices()}>
          {(tilesetIndex) => (
            <Tileset tilesetIndex={tilesetIndex} showGrid={showGrid} />
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
