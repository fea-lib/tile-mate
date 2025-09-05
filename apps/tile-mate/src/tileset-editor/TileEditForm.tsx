import { type Component, createSignal, Show } from "solid-js";
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
            <PreviewImage
              tilesetIndex={props.tilesetIndex}
              tileIndex={props.tileIndex}
              tileSize={previewSize}
              img={tileData.img}
              class={staticStyles.previewTile}
            />
          </div>

          <div class={staticStyles.preview}>
            <h3>Tinted Preview</h3>
            <Show
              when={selectedTint()}
              fallback={
                <PreviewImage
                  tilesetIndex={props.tilesetIndex}
                  tileIndex={props.tileIndex}
                  tileSize={previewSize!}
                  img={tileData.img}
                  class={`${staticStyles.previewTile} ${staticStyles.noTint}`}
                />
              }
            >
              <PreviewImage
                tilesetIndex={props.tilesetIndex}
                tileIndex={props.tileIndex}
                tileSize={previewSize}
                img={tileData.img}
                tint={createTintedTileData().tint}
                class={staticStyles.previewTile}
              />
            </Show>
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

// Local minimal Image preview component (decoupled from legacy Tile.tsx)
const PreviewImage: Component<{
  tilesetIndex: TilesetIndex; // kept for potential future a11y labels
  tileIndex: TileIndex;
  tileSize: number;
  img?: { src: string; x: number; y: number };
  tint?: string;
  class?: string;
}> = (p) => {
  const size = () => `${p.tileSize}px`;
  const style = () => {
    const base: Record<string, string> = {
      width: size(),
      height: size(),
      position: "relative",
      display: "inline-block",
      "image-rendering": "pixelated",
      contain: "layout paint style",
      "background-color": "transparent",
      "background-blend-mode": "normal",
    };
    if (!p.img) {
      base["background"] =
        "repeating-conic-gradient(#444 0% 25%, #333 0% 50%) 50% / 8px 8px";
      return base;
    }
    const offsetX = p.img.x * p.tileSize;
    const offsetY = p.img.y * p.tileSize;
    base["background-image"] = `url(${p.img.src})`;
    base["background-position"] = `-${offsetX}px -${offsetY}px`;
    base["background-repeat"] = "no-repeat";
    if (p.tint) {
      const rgb = hexToRgb(p.tint);
      base["background-color"] = `rgba(${rgb},0.7)`;
      base["background-blend-mode"] = "multiply";
    }
    return base;
  };
  return (
    <div
      class={p.class}
      role="img"
      aria-label={`Tile ${p.tileIndex}`}
      style={style()}
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
