import { Tile } from "../../types";

export type RendererSceneState = {
  tiles: Tile[];
  selectedIndex?: number;
  hoverIndex?: number;
  dragSourceIndex?: number;
  grid?: { gap: number; color: string } | false;
};

export interface ITilesetRenderer {
  /** Initialize internal structures; canvas is already in the DOM */
  init(config: {
    canvas: HTMLCanvasElement;
    tileSize: number;
    columns: number;
    rows: number;
    gap: number;
  }): void;
  /** Update dimensions (tileSize / columns / rows / gap) */
  resize(cfg: {
    tileSize: number;
    columns: number;
    rows: number;
    gap: number;
  }): void;
  /** Full scene draw (recommended after any structural change) */
  render(state: RendererSceneState): void;
  /** Redraw only overlays (selection / hover) if possible */
  redrawOverlay(state: Omit<RendererSceneState, "tiles">): void;
  /** Convert canvas coordinate to tile index; returns undefined if outside */
  getTileIndexAt(x: number, y: number): number | undefined;
  /** Export current visual (including tint & overlays=false) */
  exportImage(opts: {
    format: "png" | "jpeg";
    quality?: number;
  }): Promise<Blob>;
  destroy(): void;
}
