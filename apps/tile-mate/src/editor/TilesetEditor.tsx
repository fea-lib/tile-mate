import { type Component, onMount, For } from "solid-js";
import { Tileset } from "../tileset/Tileset";
import staticStyles from "./TilesetEditor.module.css";
import { Toggle } from "../common/toggle/Toggle";
import { ToggleGroup } from "../common/toggle/ToggleGroup";
import { DropMode } from "../types";
import { useTileMateStore } from "../store/TileMateStore";
import { Button } from "../common/button/Button";

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
  const { addTileset, tilesets } = useTileMateStore();

  onMount(async () => {
    if (tilesets().length > 0) return;

    try {
      await Promise.all([addTileset(tilesetImage, tileSize)]);
      await Promise.all([addTileset(tilesetImage, tileSize)]);
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
            <Tileset tilesetIndex={tileset.index} showGrid={showGrid} />
          )}
        </For>
      </div>
    </div>
  );
};

const Actions: Component = () => {
  const { selectedMode, selectMode } = useTileMateStore();

  return (
    <div class={staticStyles.actions}>
      <div class={staticStyles.actionGroup}>
        <Button>New Tileset</Button>
      </div>
      <div class={staticStyles.actionGroup}>
        <label>Mode</label>
        <ToggleGroup>
          {Object.values(DropMode).map((value) => (
            <Toggle
              value={value}
              isChecked={selectedMode() === value}
              onChange={(e) => {
                selectMode(e.currentTarget.value as DropMode);
              }}
            >
              {value}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};
