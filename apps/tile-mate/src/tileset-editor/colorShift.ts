// Shared color shifting utilities replacing legacy simple tint overlay.
// Computes dominant color of a tile region and shifts hue/saturation/lightness toward a target color.
// Designed for small pixel-art tiles; performance acceptable for typical sizes (8-64px).

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  if (!hex) return [255, 0, 255];
  let value = hex.replace("#", "").trim();
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (value.length !== 6 || /[^0-9a-fA-F]/.test(value)) return [255, 0, 255];
  const num = parseInt(value, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

// Determine dominant color emphasizing saturated mid-tone pixels to avoid flat recolors.
export function computeDominantColor(data: Uint8ClampedArray): RGB {
  const buckets: Record<
    number,
    { c: number; r: number; g: number; b: number; sAcc: number }
  > = {};
  let maxKey = -1;
  let maxScore = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 8) continue; // ignore mostly transparent
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [, s, l] = rgbToHsl(r, g, b);
    // discard extremes which often belong to outlines/background
    if (l < 0.04 || l > 0.96) continue;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let bucket = buckets[key];
    if (!bucket) bucket = buckets[key] = { c: 0, r: 0, g: 0, b: 0, sAcc: 0 };
    bucket.c++;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.sAcc += s;
    const avgS = bucket.sAcc / bucket.c;
    const score = bucket.c * (avgS * 0.75 + 0.25); // weight saturation but still let frequency dominate
    if (score > maxScore) {
      maxScore = score;
      maxKey = key;
    }
  }
  if (maxKey === -1) return [127, 127, 127];
  const bkt = buckets[maxKey];
  const base: RGB = [
    Math.round(bkt.r / bkt.c),
    Math.round(bkt.g / bkt.c),
    Math.round(bkt.b / bkt.c),
  ];
  // If low saturation, compute weighted colorful average fallback
  const [, domS] = rgbToHsl(base[0], base[1], base[2]);
  if (domS < 0.12) {
    let wr = 0,
      wg = 0,
      wb = 0,
      wTot = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 8) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const [, s, l] = rgbToHsl(r, g, b);
      if (l < 0.04 || l > 0.96) continue;
      const w = s * s + 0.05; // emphasize saturated pixels
      wr += r * w;
      wg += g * w;
      wb += b * w;
      wTot += w;
    }
    if (wTot > 0) {
      return [
        Math.round(wr / wTot),
        Math.round(wg / wTot),
        Math.round(wb / wTot),
      ];
    }
  }
  return base;
}

export function applyColorShift(
  imageData: ImageData,
  source: RGB,
  target: RGB
): ImageData {
  const d = imageData.data;
  const [hs, ss, ls] = rgbToHsl(source[0], source[1], source[2]);
  const [ht, st, lt] = rgbToHsl(target[0], target[1], target[2]);
  const dh = ((ht - hs + 540) % 360) - 180; // shortest hue delta
  const SAT_BLEND = 0.75;
  const L_BLEND = 0.75;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a < 8) continue;
    const r0 = d[i];
    const g0 = d[i + 1];
    const b0 = d[i + 2];
    let [h, s, l] = rgbToHsl(r0, g0, b0);
    if (ss < 0.05) {
      // Dominant grayscale: adopt target hue, push saturation while preserving structure
      h = ht;
      s = clamp01(s + st * 0.9);
    } else {
      h = (h + dh + 360) % 360;
    }
    s = clamp01(s + (st - ss) * SAT_BLEND);
    l = clamp01(l + (lt - ls) * L_BLEND);
    const [rShift, gShift, bShift] = hslToRgb(h, s, l);
    const blend = 0.55 + 0.35 * s; // maintain details
    d[i] = rShift * blend + r0 * (1 - blend);
    d[i + 1] = gShift * blend + g0 * (1 - blend);
    d[i + 2] = bShift * blend + b0 * (1 - blend);
  }
  return imageData;
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Cache for dominant color per (src|x|y|size) key to avoid recomputation across shifts.
const dominantCache = new Map<string, RGB>();

export function shiftTileRegion(
  srcImg: HTMLImageElement,
  tileSize: number,
  tileX: number,
  tileY: number,
  targetHex: string,
  cache?: Map<string, HTMLCanvasElement>
): HTMLCanvasElement {
  const keyBase = `${srcImg.src}|${tileX}|${tileY}|${tileSize}`;
  const cacheKey = `${keyBase}|${targetHex}`;
  if (cache && cache.has(cacheKey)) return cache.get(cacheKey)!;
  // Create working canvas
  const c = document.createElement("canvas");
  c.width = tileSize;
  c.height = tileSize;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const sx = tileX * tileSize;
  const sy = tileY * tileSize;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(srcImg, sx, sy, tileSize, tileSize, 0, 0, tileSize, tileSize);
  const imgData = ctx.getImageData(0, 0, tileSize, tileSize);
  let dominant = dominantCache.get(keyBase);
  if (!dominant) {
    dominant = computeDominantColor(imgData.data);
    dominantCache.set(keyBase, dominant);
  }
  const target = hexToRgb(targetHex);
  applyColorShift(imgData, dominant, target);
  ctx.putImageData(imgData, 0, 0);
  if (cache) cache.set(cacheKey, c);
  return c;
}

export function clearColorShiftCaches() {
  dominantCache.clear();
}
