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
import { shiftTileRegion } from "./colorShift";

type Props = {
  tilesetIndex: TilesetIndex;
  tileIndex: TileIndex;
  initialTint?: string; // legacy name retained for compatibility (represents target color)
  onAccept: (tint?: string) => void; // tint here means target shift color
  onCancel: () => void;
};

export const TileEditForm: Component<Props> = (props) => {
  const { tile, tileSize } = useTileMateStore();
  const [selectedTargetColor, setSelectedTargetColor] = createSignal<string>(
    props.initialTint ?? ""
  );

  const tileData = tile(props.tilesetIndex, props.tileIndex);
  const previewSize = tileSize(props.tilesetIndex); // Fixed larger size for modal preview

  const handleTargetColorChange = (color: string) => {
    setSelectedTargetColor(color);
  };

  const handleAccept = () => {
    const target = selectedTargetColor();
    props.onAccept(target || undefined);
  };

  const handleCancel = () => {
    props.onCancel();
  };

  // Create a copy of tile data with the selected tint for preview
  // Removed: color shifting is applied dynamically in canvas rendering based on dominant color.

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
              class={staticStyles.previewTile}
            />
          </div>
          <div class={staticStyles.preview}>
            <h3>Shifted Preview</h3>
            <CanvasTilePreview
              tilesetIndex={props.tilesetIndex}
              tileIndex={props.tileIndex}
              tileSize={previewSize}
              targetColor={selectedTargetColor() || undefined}
              class={staticStyles.previewTile}
            />
          </div>
        </div>
        <div class={staticStyles.colorSection}>
          <label>Target Color:</label>
          <Input
            type="color"
            value={selectedTargetColor()}
            onInput={(e) => handleTargetColorChange(e.currentTarget.value)}
          />
          <Show when={selectedTargetColor()}>
            <Button onClick={() => setSelectedTargetColor("")}>Clear</Button>
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

// Canvas-based preview rendering ONLY the selected tile.
// If a targetColor is provided, applies color shift vs dominant color of the tile region.
const CanvasTilePreview: Component<{
  tilesetIndex: TilesetIndex;
  tileIndex: TileIndex;
  tileSize: number; // logical tile size
  targetColor?: string; // target color for shift
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
      if (p.targetColor || ct.tint) {
        const shifted = shiftTileRegion(
          imgEl as HTMLImageElement,
          tSize,
          ct.img.x,
          ct.img.y,
          (p.targetColor || ct.tint) as string
        );
        // draw shifted tile scaled
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(shifted, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);
      } else {
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
      }
    } catch (e) {}
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
    p.targetColor; // dependency
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

// (Deprecated local hexToRgb & multiply tint logic removed – using shared colorShift utilities.)
