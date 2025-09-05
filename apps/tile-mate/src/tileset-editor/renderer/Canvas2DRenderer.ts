import { ITilesetRenderer, RendererSceneState } from "./ITilesetRenderer";
import { Tile } from "../../types";

type ImageCacheEntry = { img: HTMLImageElement; loaded: boolean; error?: any };

export class Canvas2DRenderer implements ITilesetRenderer {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private tileSize = 32;
  private columns = 0;
  private rows = 0;
  private gap = 1; // grid gap in px (space between tiles)
  private scene: RendererSceneState | undefined;
  private images = new Map<string, ImageCacheEntry>();
  private overlayNeedsFull = true;

  init(cfg: {
    canvas: HTMLCanvasElement;
    tileSize: number;
    columns: number;
    rows: number;
    gap: number;
  }): void {
    this.canvas = cfg.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;
    this.tileSize = cfg.tileSize;
    this.columns = cfg.columns;
    this.rows = cfg.rows;
    this.gap = cfg.gap;
    this.resizeCanvasToContent();
  }

  resize(cfg: {
    tileSize: number;
    columns: number;
    rows: number;
    gap: number;
  }): void {
    const dimsChanged =
      cfg.tileSize !== this.tileSize ||
      cfg.columns !== this.columns ||
      cfg.rows !== this.rows ||
      cfg.gap !== this.gap;
    this.tileSize = cfg.tileSize;
    this.columns = cfg.columns;
    this.rows = cfg.rows;
    this.gap = cfg.gap;
    if (dimsChanged) {
      this.resizeCanvasToContent();
      if (this.scene) this.render(this.scene);
    }
  }

  private resizeCanvasToContent() {
    const width = this.columns * this.tileSize + (this.columns - 1) * this.gap;
    const height = this.rows * this.tileSize + (this.rows - 1) * this.gap;
    this.canvas.width = Math.max(1, width);
    this.canvas.height = Math.max(1, height);
  }

  private async ensureImages(tiles: Tile[]): Promise<void> {
    const needed = new Set<string>();
    for (const t of tiles)
      if ((t as any).img?.src) needed.add((t as any).img.src);
    const promises: Promise<any>[] = [];
    for (const src of needed) {
      if (!this.images.has(src)) {
        const entry: ImageCacheEntry = { img: new Image(), loaded: false };
        this.images.set(src, entry);
        entry.img.crossOrigin = "anonymous";
        promises.push(
          new Promise((resolve) => {
            entry.img.onload = () => {
              entry.loaded = true;
              resolve(null);
            };
            entry.img.onerror = (e) => {
              entry.error = e;
              resolve(null);
            };
            entry.img.src = src;
          })
        );
      }
    }
    if (promises.length) await Promise.all(promises);
  }

  async render(state: RendererSceneState): Promise<void> {
    this.scene = state;
    await this.ensureImages(state.tiles);
    this.clearAll();
    this.drawBackground(state.grid);
    this.drawTiles(state.tiles);
    this.drawOverlay(state);
    this.overlayNeedsFull = false;
  }

  redrawOverlay(state: Omit<RendererSceneState, "tiles">): void {
    if (!this.scene) return;
    if (this.overlayNeedsFull) {
      this.render({ ...this.scene, ...state });
      return;
    }
    // Efficient overlay redraw: clear overlay regions by redrawing underlying tiles for affected indices only
    const affected = new Set<number>();
    if (this.scene.selectedIndex !== undefined)
      affected.add(this.scene.selectedIndex);
    if (this.scene.hoverIndex !== undefined)
      affected.add(this.scene.hoverIndex);
    if (this.scene.dragSourceIndex !== undefined)
      affected.add(this.scene.dragSourceIndex);
    if (state.selectedIndex !== undefined) affected.add(state.selectedIndex);
    if (state.hoverIndex !== undefined) affected.add(state.hoverIndex);
    if (state.dragSourceIndex !== undefined)
      affected.add(state.dragSourceIndex);
    // Redraw tiles for affected indices
    for (const idx of affected) this.redrawTileIdx(idx);
    // Draw new overlay
    this.drawOverlay({ ...this.scene, ...state, tiles: this.scene.tiles });
    // Update stored scene
    this.scene = { ...this.scene, ...state };
  }

  private clearAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBackground(grid: RendererSceneState["grid"]) {
    if (!grid) return; // no special bg
    this.ctx.save();
    this.ctx.fillStyle = grid.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  private drawTiles(tiles: Tile[]) {
    for (let i = 0; i < tiles.length; i++) {
      this.drawSingleTile(tiles[i]);
    }
  }

  private tilePosition(index: number) {
    const col = index % this.columns;
    const row = Math.floor(index / this.columns);
    const x = col * (this.tileSize + this.gap);
    const y = row * (this.tileSize + this.gap);
    return { x, y };
  }

  private drawSingleTile(tile: Tile) {
    const { x, y } = this.tilePosition(tile.index);
    const s: any = tile as any;
    // empty tile background pattern
    if (!s.img) {
      this.drawEmptyCell(x, y);
      return;
    }
    const entry = this.images.get(s.img.src);
    if (!entry || !entry.loaded) {
      this.drawEmptyCell(x, y);
      return;
    }
    try {
      const sx = s.img.x * this.tileSize;
      const sy = s.img.y * this.tileSize;
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(
        entry.img,
        sx,
        sy,
        this.tileSize,
        this.tileSize,
        x,
        y,
        this.tileSize,
        this.tileSize
      );
      if (s.tint) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = "multiply";
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = s.tint;
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
        this.ctx.restore();
      }
    } catch {
      this.drawEmptyCell(x, y);
    }
  }

  private redrawTileIdx(index: number) {
    if (!this.scene) return;
    const tile = this.scene.tiles[index];
    if (!tile) return;
    const { x, y } = this.tilePosition(index);
    // redraw background gap color underneath tile area if grid background present
    if (this.scene.grid) {
      this.ctx.save();
      this.ctx.fillStyle = this.scene.grid.color;
      this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
      this.ctx.restore();
    } else {
      this.ctx.clearRect(x, y, this.tileSize, this.tileSize);
    }
    this.drawSingleTile(tile);
  }

  private drawEmptyCell(x: number, y: number) {
    const ts = this.tileSize;
    // create simple checker (2x2) using direct fill
    const s = ts / 4;
    this.ctx.save();
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(x, y, ts, ts);
    this.ctx.fillStyle = "#444";
    for (let cy = 0; cy < ts; cy += s) {
      for (let cx = 0; cx < ts; cx += s) {
        if (((cx + cy) / s) % 2 === 0) this.ctx.fillRect(x + cx, y + cy, s, s);
      }
    }
    this.ctx.restore();
  }

  private drawOverlay(state: RendererSceneState) {
    const { selectedIndex, hoverIndex, dragSourceIndex } = state;
    const outline = (idx: number, color: string, width = 2) => {
      const { x, y } = this.tilePosition(idx);
      this.ctx.save();
      this.ctx.lineWidth = width;
      this.ctx.strokeStyle = color;
      this.ctx.strokeRect(
        x + 0.5,
        y + 0.5,
        this.tileSize - 1,
        this.tileSize - 1
      );
      this.ctx.restore();
    };
    if (dragSourceIndex !== undefined) outline(dragSourceIndex, "#00FFFF", 2);
    if (hoverIndex !== undefined && hoverIndex !== dragSourceIndex)
      outline(hoverIndex, "#FFCC00", 2);
    if (selectedIndex !== undefined) outline(selectedIndex, "#FFFFFF", 2);
  }

  getTileIndexAt(x: number, y: number): number | undefined {
    if (x < 0 || y < 0) return;
    const stride = this.tileSize + this.gap;
    const col = Math.floor(x / stride);
    const row = Math.floor(y / stride);
    if (col < 0 || col >= this.columns || row < 0 || row >= this.rows) return;
    const withinX = x - col * stride;
    if (withinX >= this.tileSize) return; // inside gap
    const withinY = y - row * stride;
    if (withinY >= this.tileSize) return; // inside gap
    const index = row * this.columns + col;
    return index;
  }

  async exportImage(opts: {
    format: "png" | "jpeg";
    quality?: number;
  }): Promise<Blob> {
    // Re-render base (without overlays) to an offscreen canvas for fidelity
    if (!this.scene) throw new Error("No scene to export");
    const off = document.createElement("canvas");
    off.width = this.canvas.width;
    off.height = this.canvas.height;
    const ctx = off.getContext("2d");
    if (!ctx) throw new Error("2D context");
    if (this.scene.grid) {
      ctx.fillStyle = this.scene.grid.color;
      ctx.fillRect(0, 0, off.width, off.height);
    }
    // draw tiles
    for (const t of this.scene.tiles) this.drawTileToContext(ctx, t);
    const mime = opts.format === "png" ? "image/png" : "image/jpeg";
    const quality = opts.format === "jpeg" ? opts.quality ?? 0.92 : undefined;
    return new Promise<Blob>((resolve, reject) => {
      off.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
        mime,
        quality
      );
    });
  }

  private drawTileToContext(ctx: CanvasRenderingContext2D, tile: Tile) {
    const { x, y } = this.tilePosition(tile.index);
    const s: any = tile as any;
    if (!s.img) {
      ctx.fillStyle = "#333";
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
      return;
    }
    const entry = this.images.get(s.img.src);
    if (!entry?.loaded) return;
    const sx = s.img.x * this.tileSize;
    const sy = s.img.y * this.tileSize;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      entry.img,
      sx,
      sy,
      this.tileSize,
      this.tileSize,
      x,
      y,
      this.tileSize,
      this.tileSize
    );
    if (s.tint) {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = s.tint;
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
      ctx.restore();
    }
  }

  destroy(): void {
    // presently nothing persistent; could revoke object URLs later
    this.images.clear();
    (this as any).scene = undefined;
  }
}
