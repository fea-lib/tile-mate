import {
  type Component,
  createSignal,
  Show,
  onMount,
  onCleanup,
  createEffect,
} from "solid-js";
import { Button } from "../common/button/Button";
import { Input } from "../common/input/Input";
import { TileIndex, TilesetIndex } from "../types";
import { useTileMateStore } from "../store/TileMateStore";
import staticStyles from "./TileEditForm.module.css";

type Props = {
  tilesetIndex: TilesetIndex;
  tileIndex: TileIndex;
  initialTint?: string;
  onAccept: (tint?: string) => void;
  onCancel: () => void;
};

export const TileEditForm: Component<Props> = (props) => {
  const { tile, tileSize } = useTileMateStore();
  const [selectedTint, setSelectedTint] = createSignal<string>(
    props.initialTint ?? ""
  );

  const tileData = tile(props.tilesetIndex, props.tileIndex);
  const previewSize = tileSize(props.tilesetIndex); // Fixed larger size for modal preview

  const handleTintChange = (color: string) => {
    setSelectedTint(color);
  };

  const handleAccept = () => {
    const tint = selectedTint();
    props.onAccept(tint || undefined);
  };

  const handleCancel = () => {
    props.onCancel();
  };

  // Create a copy of tile data with the selected tint for preview
  const createTintedTileData = () => {
    if (!tileData || !selectedTint()) return tileData;
    return {
      ...tileData,
      tint: selectedTint(),
    };
  };

  return (
    <Show when={tileData?.img}>
      <div class={staticStyles.container}>
        <div class={staticStyles.previewSection}>
          <div class={staticStyles.preview}>
            <h3>Original</h3>
            <CanvasTilePreview
              tilesetIndex={props.tilesetIndex}
              tileIndex={props.tileIndex}
              tileSize={previewSize}
              tint={undefined}
              class={staticStyles.previewTile}
            />
          </div>
          <div class={staticStyles.preview}>
            <h3>Tinted Preview</h3>
            <CanvasTilePreview
              tilesetIndex={props.tilesetIndex}
              tileIndex={props.tileIndex}
              tileSize={previewSize}
              tint={selectedTint() || undefined}
              class={staticStyles.previewTile}
            />
          </div>
        </div>
        <div class={staticStyles.colorSection}>
          <label>Tint Color:</label>
          <Input
            type="color"
            value={selectedTint()}
            onInput={(e) => handleTintChange(e.currentTarget.value)}
          />
          <Show when={selectedTint()}>
            <Button onClick={() => setSelectedTint("")}>Clear</Button>
          </Show>
        </div>
        <div class={staticStyles.actions}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleAccept}>Accept</Button>
        </div>
      </div>
    </Show>
  );
};

// Canvas-based preview rendering ONLY the selected tile (neighbors removed for clarity).
// Display size fixed to 64x64 while sampling the original tile region at its native tileSize, scaled pixel-perfect.
const CanvasTilePreview: Component<{
  tilesetIndex: TilesetIndex;
  tileIndex: TileIndex;
  tileSize: number; // logical tile size
  tint?: string; // optional override tint for central tile
  class?: string;
}> = (p) => {
  const { tile } = useTileMateStore();
  let canvasRef: HTMLCanvasElement | undefined;
  let imgEl: HTMLImageElement | undefined;
  const DISPLAY_SIZE = 64; // fixed preview dimension

  // Load the shared sprite sheet once (based on central tile's img.src)
  const loadImage = (src: string) => {
    if (imgEl && imgEl.src === src) return;
    imgEl = new Image();
    imgEl.src = src;
    if (!imgEl.complete) {
      imgEl.onload = () => draw();
    }
  };

  const centerTile = () => tile(p.tilesetIndex, p.tileIndex);

  const rgbaFromHex = (hex?: string, alpha: number = 0.7) => {
    if (!hex) return undefined;
    const rgb = hexToRgb(hex);
    return `rgba(${rgb},${alpha})`;
  };

  const draw = () => {
    const c = canvasRef;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const ct = centerTile();
    if (!ct || !ct.img) {
      ctx.clearRect(0, 0, c.width, c.height);
      // Checkerboard background if missing
      const size = 8;
      for (let y = 0; y < c.height; y += size) {
        for (let x = 0; x < c.width; x += size) {
          ctx.fillStyle = (x / size + y / size) % 2 === 0 ? "#444" : "#333";
          ctx.fillRect(x, y, size, size);
        }
      }
      return;
    }
    loadImage(ct.img.src);
    if (!imgEl) return; // will retry on load
    const tSize = p.tileSize; // source tile pixel size in spritesheet
    // Ensure canvas bitmap matches display size (fixed 64x64)
    const targetW = DISPLAY_SIZE;
    const targetH = DISPLAY_SIZE;
    if (c.width !== targetW) c.width = targetW;
    if (c.height !== targetH) c.height = targetH;

    const sx = ct.img.x * tSize;
    const sy = ct.img.y * tSize;
    try {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        imgEl as HTMLImageElement,
        sx,
        sy,
        tSize,
        tSize,
        0,
        0,
        DISPLAY_SIZE,
        DISPLAY_SIZE
      );
    } catch (e) {}
    const appliedTint = p.tint ?? ct.tint;
    if (appliedTint) {
      const rgba = rgbaFromHex(appliedTint);
      if (rgba) {
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = rgba;
        ctx.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
        ctx.restore();
      }
    }
    // Outline (single pass)
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, DISPLAY_SIZE - 1, DISPLAY_SIZE - 1);
    ctx.restore();
  };

  onMount(() => {
    draw();
  });

  // Redraw on reactive dependencies
  createEffect(() => {
    // Depend on center & neighbor tiles' tint + provided tint override + tileSize
    const ct = centerTile();
    p.tint; // dependency
    p.tileSize; // dependency
    if (ct && ct.img) {
      ct.tint; // center tint dependency
    }
    draw();
  });

  onCleanup(() => {
    // Nothing persistent to cleanup beyond letting GC reclaim image
    imgEl = undefined as any;
  });

  const style = () => ({
    width: `${DISPLAY_SIZE}px`,
    height: `${DISPLAY_SIZE}px`,
    display: "inline-block",
    "image-rendering": "pixelated",
    contain: "layout paint style",
    background:
      "repeating-conic-gradient(#444 0% 25%, #333 0% 50%) 50% / 8px 8px",
  });

  return (
    <canvas
      ref={canvasRef}
      class={p.class}
      width={DISPLAY_SIZE}
      height={DISPLAY_SIZE}
      style={style() as any}
      role="img"
      aria-label={`Tile ${p.tileIndex}`}
      data-preview-tile
    />
  );
};

// Simple hex (#rgb/#rrggbb) to r,g,b string converter
function hexToRgb(hex: string): string {
  if (!hex) return "255,0,255";
  let value = hex.replace("#", "").trim();
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (value.length !== 6 || /[^0-9a-fA-F]/.test(value)) return "255,0,255";
  const num = parseInt(value, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r},${g},${b}`;
}
