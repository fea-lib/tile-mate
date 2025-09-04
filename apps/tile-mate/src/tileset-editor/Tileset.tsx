import { For, createSignal, type Component } from "solid-js";
import { Tile } from "./Tile";
import { TileMateStoreState, useTileMateStore } from "../store/TileMateStore";
import staticStyles from "./Tileset.module.css";
import { TilesetIndex } from "../types";
import { Input } from "../common/input/Input";
import { Button } from "../common/button/Button";
import { exportTilesetImage, type ExportFormat } from "./exportTilesetImage";

type Props = {
  tilesetIndex: TilesetIndex;
};

export const Tileset: Component<Props> = (props) => {
  const {
    removeTileSet,
    columns,
    rows,
    setColumns,
    setRows,
    setTileSize,
    tiles,
    tileSize,
    showGrid,
  } = useTileMateStore();

  const [format, setFormat] = createSignal<ExportFormat>("png");
  const [isSaving, setIsSaving] = createSignal(false);

  const handleTileSizeChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      setTileSize(props.tilesetIndex, value);
    }
  };

  const handleColumnsChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      setColumns(props.tilesetIndex, value);
    }
  };

  const handleRowsChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (!isNaN(value) && value > 0) {
      setRows(props.tilesetIndex, value);
    }
  };

  const grid = () => toGridOptions(showGrid());

  const handleSave = async () => {
    if (isSaving()) return;
    setIsSaving(true);
    try {
      await exportTilesetImage({
        tiles: tiles(props.tilesetIndex),
        columns: columns(props.tilesetIndex),
        rows: rows(props.tilesetIndex),
        tileSize: tileSize(props.tilesetIndex),
        format: format(),
        filename: `tileset-${props.tilesetIndex}.${
          format() === "png" ? "png" : "jpg"
        }`,
      });
    } catch (e) {
      console.error("Failed to save tileset", e);
      alert("Failed to save tileset image. See console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div class={staticStyles.tilesetFrame}>
      <div class={staticStyles.tilesetHeader}>
        <span class={staticStyles.tilesetTitle}>
          Tileset {props.tilesetIndex}
        </span>
        <div class={staticStyles.tilesetControls}>
          <div class={staticStyles.controlGroup}>
            <Button onClick={() => removeTileSet(props.tilesetIndex)}>
              Remove
            </Button>
          </div>
          <div class={staticStyles.controlGroup}>
            <label>Format:</label>
            <select
              onChange={(e) =>
                setFormat((e.currentTarget.value as ExportFormat) || "png")
              }
              value={format()}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
            </select>
            <Button onClick={handleSave}>
              {isSaving() ? "Saving..." : "Save"}
            </Button>
          </div>
          <div class={staticStyles.controlGroup}>
            <label>Tile Size:</label>
            <Input
              type="number"
              value={tileSize(props.tilesetIndex)}
              onInput={handleTileSizeChange}
              min={1}
            />
          </div>
          <div class={staticStyles.controlGroup}>
            <label>Columns:</label>
            <Input
              type="number"
              value={columns(props.tilesetIndex)}
              onInput={handleColumnsChange}
              min={1}
            />
          </div>
          <div class={staticStyles.controlGroup}>
            <label>Rows:</label>
            <Input
              type="number"
              value={rows(props.tilesetIndex)}
              onInput={handleRowsChange}
              min={1}
            />
          </div>
        </div>
      </div>

      <div class={staticStyles.tilesetContent}>
        <div
          class={staticStyles.tileset}
          style={getDynamicStyle({
            grid: grid(),
            tileSize: tileSize(props.tilesetIndex),
            columns: columns(props.tilesetIndex),
            rows: rows(props.tilesetIndex),
          })}
        >
          <For each={tiles(props.tilesetIndex)}>
            {({ index }) => (
              <Tile tilesetIndex={props.tilesetIndex} index={index} />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

function getDynamicStyle({
  grid,
  tileSize,
  columns,
  rows,
}: {
  tileSize: number;
  columns: number;
  rows: number;
  grid: GridOptions;
}) {
  return `
    grid-template-columns: repeat(${columns}, ${tileSize}px);
    grid-template-rows: repeat(${rows}, ${tileSize}px);
    ${grid ? `gap: ${grid.gap}; background-color: ${grid.color};` : ""}
  `;
}

type GridOptions = {
  gap: string;
  color: string;
};

const defaultGridOptions: GridOptions = { gap: "1px", color: "magenta" };

function toGridOptions(showGrid: TileMateStoreState["showGrid"]): GridOptions {
  if (!showGrid) return;

  const gridOptions = { ...defaultGridOptions };

  if (showGrid === true) return gridOptions;

  if (showGrid.gap) {
    gridOptions.gap = `${showGrid.gap}px`;
  }

  if (showGrid.color) {
    gridOptions.color = showGrid.color;
  }

  return gridOptions;
}
