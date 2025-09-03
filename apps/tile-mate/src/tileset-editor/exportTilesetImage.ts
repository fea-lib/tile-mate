import { Tile } from "../types";

export type ExportFormat = "png" | "jpeg";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Helps avoid tainting if the server allows it; ignored for data: URLs
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function exportTilesetImage(opts: {
  tiles: Tile[];
  columns: number;
  rows: number;
  tileSize: number;
  format?: ExportFormat; // default png
  filename?: string; // default based on format
  jpegQuality?: number; // 0..1 only for jpeg
}): Promise<void> {
  const {
    tiles,
    columns,
    rows,
    tileSize,
    format = "png",
    jpegQuality = 0.92,
  } = opts;

  const ext = format === "png" ? "png" : "jpg";
  const filename = opts.filename ?? `tileset.${ext}`;

  const width = Math.max(1, columns * tileSize);
  const height = Math.max(1, rows * tileSize);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context not available");

  // JPEG doesn't support transparency; paint a background
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  // Preload unique source images
  const srcSet = new Set<string>();
  for (const t of tiles) if (t.img?.src) srcSet.add(t.img.src);
  const srcList = Array.from(srcSet);
  const images = new Map<string, HTMLImageElement>();

  await Promise.all(
    srcList.map(async (src) => {
      const img = await loadImage(src);
      images.set(src, img);
    })
  );

  // Draw each tile at its destination cell
  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    if (!t?.img) continue;
    const img = images.get(t.img.src);
    if (!img) continue;

    const sx = t.img.x * tileSize;
    const sy = t.img.y * tileSize;
    const dx = (i % columns) * tileSize;
    const dy = Math.floor(i / columns) * tileSize;

    try {
      ctx.drawImage(
        img,
        sx,
        sy,
        tileSize,
        tileSize,
        dx,
        dy,
        tileSize,
        tileSize
      );

      // If the tile has a tint, apply it using multiply blending to match the UI overlay
      if (t.tint) {
        const prevComp = ctx.globalCompositeOperation;
        const prevAlpha = ctx.globalAlpha;

        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.7; // Keep in sync with UI overlay opacity
        ctx.fillStyle = t.tint;
        ctx.fillRect(dx, dy, tileSize, tileSize);

        // Restore defaults for subsequent draws
        ctx.globalCompositeOperation = prevComp;
        ctx.globalAlpha = prevAlpha;
      }
    } catch (e) {
      // If anything goes wrong with drawing a tile, skip it but continue
      // eslint-disable-next-line no-console
      console.warn("Failed to draw tile", { i, tile: t, error: e });
    }
  }

  // Export and trigger download
  const mime = format === "png" ? "image/png" : "image/jpeg";
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        resolve();
      },
      mime,
      format === "jpeg" ? jpegQuality : undefined
    );
  });
}
