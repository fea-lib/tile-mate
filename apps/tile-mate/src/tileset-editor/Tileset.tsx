import {
  createSignal,
  type Component,
  onCleanup,
  onMount,
  createEffect,
} from "solid-js";
import { TileMateStoreState, useTileMateStore } from "../store/TileMateStore";
import staticStyles from "./Tileset.module.css";
import { TilesetIndex } from "../types";
import { Input } from "../common/input/Input";
import { Button } from "../common/button/Button";
import { exportTilesetImage, type ExportFormat } from "./exportTilesetImage";
import { Canvas2DRenderer } from "./renderer/Canvas2DRenderer";
import { ITilesetRenderer } from "./renderer/ITilesetRenderer";
import {
  dragSignals,
  startDrag,
  updateHover,
  endDrag,
} from "./drag/canvasDragState";
import { showModal } from "../common/modal/Modal";
import { TileEditForm } from "./TileEditForm";

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

  const gridOptions = () => toGridOptions(showGrid());

  // Renderer (Scenario 5 hybrid)
  let canvasRef: HTMLCanvasElement | undefined;
  let renderer: ITilesetRenderer | undefined;

  // selection handled via store; no local state required

  const gap = () => {
    const g = gridOptions();
    return g ? parseInt(g.gap) || 1 : 0;
  };

  const fullState = () => {
    const { selectedTile } = useTileMateStore();
    const st = selectedTile();
    const selectedIndex =
      st && st[0] === props.tilesetIndex ? st[1] : undefined;
    const gSetting = showGrid();
    let gridValue: { gap: number; color: string } | false = false;
    if (gSetting) {
      const gOpts = gridOptions();
      gridValue = { gap: gap(), color: gOpts?.color || "#FF00FF" };
    }
    return {
      tiles: tiles(props.tilesetIndex),
      selectedIndex: selectedIndex as number | undefined,
      hoverIndex: hoverIndex() as number | undefined,
      dragSourceIndex: dragSourceIndex() as number | undefined,
      grid: gridValue as false | { gap: number; color: string },
    };
  };

  // Derive per-tileset indices from global drag state
  const dragSourceIndex = () => {
    const s = dragSignals.dragSource();
    return s && s.tilesetIndex === props.tilesetIndex ? s.tileIndex : undefined;
  };
  const hoverIndex = () => {
    const h = dragSignals.hoverTarget();
    return h && h.tilesetIndex === props.tilesetIndex ? h.tileIndex : undefined;
  };

  const redraw = () => {
    if (!renderer) return;
    renderer.render(fullState() as any);
  };

  const redrawOverlay = () => {
    if (!renderer) return;
    const state = fullState();
    renderer.redrawOverlay({
      selectedIndex: state.selectedIndex,
      hoverIndex: hoverIndex(),
      dragSourceIndex: dragSourceIndex(),
      grid: state.grid,
    } as any);
  };

  onMount(() => {
    if (!canvasRef) return;
    renderer = new Canvas2DRenderer();
    renderer.init({
      canvas: canvasRef,
      tileSize: tileSize(props.tilesetIndex),
      columns: columns(props.tilesetIndex),
      rows: rows(props.tilesetIndex),
      gap: gap(),
    });
    redraw();
  });

  onCleanup(() => {
    renderer?.destroy();
  });

  // Structural & tile content effect: re-render when size/structure or tile data mutates
  createEffect(() => {
    const cols = columns(props.tilesetIndex);
    const rws = rows(props.tilesetIndex);
    const size = tileSize(props.tilesetIndex);
    showGrid(); // dependency for grid toggling
    gridOptions(); // dependency for color/gap
    const tArr = tiles(props.tilesetIndex);
    // Touch nested reactive props so Solid tracks (tint + img coords)
    for (const t of tArr) {
      const anyT: any = t as any;
      if (anyT.img) {
        anyT.img.src;
        anyT.img.x;
        anyT.img.y;
      }
      anyT.tint;
    }
    if (renderer) {
      renderer.resize({ tileSize: size, columns: cols, rows: rws, gap: gap() });
      renderer.render(fullState() as any);
    }
  });

  // Overlay-only effect (selection / hover / drag source) to avoid full redraw
  const { selectedTile } = useTileMateStore();
  createEffect(() => {
    selectedTile(); // selection dependency
    dragSignals.hoverTarget();
    dragSignals.dragSource();
    if (renderer) {
      const state = fullState();
      renderer.redrawOverlay({
        selectedIndex: state.selectedIndex,
        hoverIndex: state.hoverIndex,
        dragSourceIndex: state.dragSourceIndex,
        grid: state.grid,
      } as any);
    }
  });

  const handlePointerEvent = (e: PointerEvent) => {
    if (!renderer || !canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const idx = renderer.getTileIndexAt(x, y);
    return idx;
  };

  const { selectTile, selectedMode, copyTile, swapTiles, setTileTint } =
    useTileMateStore();

  const onPointerDownCanvas = (e: PointerEvent) => {
    const idx = handlePointerEvent(e);
    if (idx === undefined) return;
    startDrag({ tilesetIndex: props.tilesetIndex, tileIndex: idx });
    selectTile([props.tilesetIndex, idx]);
    redrawOverlay();
  };

  const onPointerMoveCanvas = (e: PointerEvent) => {
    const idx = handlePointerEvent(e);
    if (dragSignals.isDragging()) {
      if (idx !== undefined)
        updateHover({ tilesetIndex: props.tilesetIndex, tileIndex: idx });
      else updateHover(undefined);
      redrawOverlay();
    }
  };

  const onPointerUpCanvas = (e: PointerEvent) => {
    const src = dragSignals.dragSource();
    if (!src) return;
    const targetIdx = handlePointerEvent(e);
    if (targetIdx !== undefined) {
      const mode = selectedMode();
      if (
        src.tilesetIndex !== props.tilesetIndex ||
        src.tileIndex !== targetIdx
      ) {
        if (mode === "Copy") {
          copyTile(
            src.tilesetIndex,
            src.tileIndex,
            props.tilesetIndex,
            targetIdx
          );
        } else if (mode === "Swap") {
          swapTiles(
            src.tilesetIndex,
            src.tileIndex,
            props.tilesetIndex,
            targetIdx
          );
        }
        redraw();
      }
    }
    endDrag();
    redrawOverlay();
  };

  const onDblClickCanvas = (e: MouseEvent) => {
    // Ignore if dragging (avoid unintended edit while dragging quickly)
    if (dragSignals.isDragging()) return;
    const idx = handlePointerEvent(e as any as PointerEvent);
    if (idx === undefined) return;
    const tileArr = tiles(props.tilesetIndex);
    const t: any = tileArr[idx];
    if (!t || !t.img) return; // empty tile, nothing to edit

    const initialTint = t.tint as string | undefined;
    const close = showModal({
      title: "Tint Tile",
      children: () => (
        <TileEditForm
          tilesetIndex={props.tilesetIndex}
          tileIndex={idx}
          initialTint={initialTint}
          onAccept={(tint) => {
            setTileTint(props.tilesetIndex, idx, tint);
            redraw();
            close();
          }}
          onCancel={() => close()}
        />
      ),
    });
  };

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
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDownCanvas as any}
          onPointerMove={onPointerMoveCanvas as any}
          onPointerUp={onPointerUpCanvas as any}
          onDblClick={onDblClickCanvas as any}
        />
      </div>
    </div>
  );
};

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
