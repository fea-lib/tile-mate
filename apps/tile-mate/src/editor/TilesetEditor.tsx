import { type Component, onMount, For, Show } from "solid-js";
import { Tileset } from "../tileset/Tileset";
import { Toggle } from "../common/toggle/Toggle";
import { ToggleGroup } from "../common/toggle/ToggleGroup";
import { DropMode } from "../types";
import { TileMateStoreState, useTileMateStore } from "../store/TileMateStore";
import { Button } from "../common/button/Button";
import staticStyles from "./TilesetEditor.module.css";
import { Input } from "../common/input/Input";
import { showModal } from "../common/modal/Modal";
import { NewTilesetForm } from "./NewTilesetForm";

export const TilesetEditor: Component = () => {
  const { tilesets } = useTileMateStore();

  return (
    <div class={staticStyles.tilesetEditor}>
      <Actions />
      <div class={staticStyles.tilesets}>
        <For each={tilesets()}>
          {(tileset) => <Tileset tilesetIndex={tileset.index} />}
        </For>
      </div>
    </div>
  );
};

const Actions: Component = () => {
  const { selectedMode, selectMode, showGrid, setShowGrid } =
    useTileMateStore();

  const gridGap = () => {
    const gridOptions = showGrid();

    if (!gridOptions) return 0;
    if (gridOptions === true) return 1;

    const { gap } = gridOptions;

    return gap;
  };

  const gridColor = () => {
    const gridOptions = showGrid();

    if (!gridOptions) return;
    if (gridOptions === true) return "#FF00FF";

    const { color } = gridOptions;

    return color;
  };

  const updateGrid = (value: Partial<TileMateStoreState["showGrid"]>) => {
    if (value && typeof value === "object") {
      setShowGrid({
        gap: gridGap(),
        color: gridColor(),
        ...value,
      });
      return;
    }

    setShowGrid(value);
  };

  return (
    <div class={staticStyles.actions}>
      <div class={staticStyles.actionGroup}>
        <Button
          onClick={() => {
            const close = showModal({
              title: "New Tileset",
              children: () => (
                <NewTilesetForm onSubmit={onDone} onCancel={onDone} />
              ),
            });

            function onDone() {
              close();
            }
          }}
        >
          New Tileset
        </Button>
      </div>
      <div class={staticStyles.actionGroup}>
        <label>Mode:</label>
        <ToggleGroup>
          {Object.values(DropMode).map((value) => (
            <Toggle
              name="drop-mode"
              type="radio"
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
      <div class={staticStyles.actionGroup}>
        <label>Grid</label>
        <Toggle
          name="show-grid"
          type="checkbox"
          isChecked={showGrid() !== false}
          onChange={() => updateGrid(!showGrid())}
        >
          <Show when={showGrid()} fallback="Off">
            On
          </Show>
        </Toggle>
        <Show when={showGrid() !== false}>
          <label>Gap:</label>
          <Input
            type="number"
            value={gridGap()}
            min={1}
            style="width:40px;"
            onInput={(e) => updateGrid({ gap: e.currentTarget.valueAsNumber })}
          />
          <label>Color:</label>
          <Input
            type="color"
            value={gridColor()}
            style="width:40px; height:20.5px; padding:0;"
            onInput={(e) => updateGrid({ color: e.currentTarget.value })}
          />
        </Show>
      </div>
    </div>
  );
};
