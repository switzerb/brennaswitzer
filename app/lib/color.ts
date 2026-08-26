/**
 * Colour maths for the sampled palette.
 *
 * The site's palette is not chosen — every colour is sampled from a painting
 * (see scripts/sample-paintings.py). That honesty costs something: a colour
 * lifted off pale paper can be far too light to set type in, and a colour
 * lifted off a graphite drawing can be a near-neutral that has no meaningful
 * hue to sort by. Both problems are handled here, in one place, so the
 * sampler and the browser can never disagree about the answer.
 */

export interface Hsl {
  /** Degrees, 0–360. */
  h: number;
  /** 0–1. */
  s: number;
  /** 0–1. */
  l: number;
}

/** WCAG AA for normal-size text. */
export const AA_CONTRAST = 4.5;

/**
 * Below this HSL saturation a colour reads as a neutral rather than as a
 * hue, so sorting it by hue is meaningless — it goes to the end instead.
 */
export const NEUTRAL_SATURATION = 0.09;

/**
 * The hue wheel has to be cut somewhere. Cutting at 0° splits the reds
 * across both ends of a sort; rotating by 30° moves the seam into magenta,
 * where this palette has nothing.
 */
export const HUE_SEAM_ROTATION = 30;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const part = (v: number) =>
    clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

export function toHsl(hex: string): Hsl {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return rgbToHex(...(rgb.map((v) => (v + m) * 255) as [number, number, number]));
}

/** WCAG relative luminance. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Return a version of `hex` that clears `minRatio` against `ground`, keeping
 * the original hue and saturation and walking only the lightness down.
 *
 * This is what lets any painting's colour be used as the site's accent
 * without a pale one making the page unreadable: the tint you see in a
 * swatch is the raw sample, and the tint the type is set in is this.
 */
export function readableOn(
  hex: string,
  ground: string,
  { minRatio = AA_CONTRAST, fallback = "#222220", step = 0.02 } = {},
): string {
  const { h, s, l } = toHsl(hex);
  for (let lightness = l; lightness > 0.05; lightness -= step) {
    const candidate = hslToHex(h, s, lightness);
    if (contrastRatio(candidate, ground) >= minRatio) return candidate;
  }
  return fallback;
}

/**
 * Sort key that arranges a set of sampled colours into a spectrum, with the
 * near-neutrals collected at the end rather than pretending to be reds.
 */
export function hueSortKey(hex: string): number {
  const { h, s } = toHsl(hex);
  if (s < NEUTRAL_SATURATION) return Number.MAX_SAFE_INTEGER;
  return (h + HUE_SEAM_ROTATION) % 360;
}
