import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AA_CONTRAST,
  contrastRatio,
  hslToHex,
  hueSortKey,
  NEUTRAL_SATURATION,
  readableOn,
  relativeLuminance,
  toHsl,
} from "./color.ts";

const PAPER = "#E5E4E0";
const INK = "#191919";

test("contrast ratio spans the full range", () => {
  assert.equal(Math.round(contrastRatio("#000000", "#FFFFFF")), 21);
  assert.equal(contrastRatio("#123456", "#123456"), 1);
});

test("contrast ratio is symmetric", () => {
  assert.equal(contrastRatio("#A46657", PAPER), contrastRatio(PAPER, "#A46657"));
});

test("hsl round-trips within a rounding step", () => {
  for (const hex of ["#A46657", "#9E985F", "#364352", "#91ACC7", "#525252"]) {
    const { h, s, l } = toHsl(hex);
    assert.equal(hslToHex(h, s, l), hex.toUpperCase());
  }
});

test("readableOn leaves an already-legible colour alone", () => {
  const dark = "#364352";
  assert.ok(contrastRatio(dark, PAPER) >= AA_CONTRAST);
  const { h, s, l } = toHsl(dark);
  assert.equal(readableOn(dark, PAPER), hslToHex(h, s, l));
});

test("every sampled colour becomes legible on paper", () => {
  // The pale end of the real palette: these are the ones that would make the
  // page unreadable if used raw.
  const palette = [
    "#B7B3B1", "#B5B4B3", "#C7A767", "#BB9061", "#AF985B",
    "#AB8B59", "#91ACC7", "#B8A06A", "#AD985A", "#A46657",
  ];
  for (const hex of palette) {
    const ink = readableOn(hex, PAPER);
    assert.ok(
      contrastRatio(ink, PAPER) >= AA_CONTRAST,
      `${hex} -> ${ink} only reached ${contrastRatio(ink, PAPER).toFixed(2)}`,
    );
  }
});

test("readableOn keeps the painting's hue", () => {
  for (const hex of ["#C7A767", "#91ACC7", "#A46657", "#9E985F"]) {
    const before = toHsl(hex).h;
    const after = toHsl(readableOn(hex, PAPER)).h;
    assert.ok(Math.abs(before - after) < 2, `${hex}: hue moved ${before} -> ${after}`);
  }
});

test("a near-neutral stays a near-neutral", () => {
  // Hue is numerically unstable down here — one 8-bit rounding step on a
  // colour this desaturated swings it by degrees — so hue is not the
  // invariant worth asserting. That it does not acquire a colour cast is.
  for (const hex of ["#B7B3B1", "#B5B4B3", "#525252"]) {
    const after = toHsl(readableOn(hex, PAPER));
    assert.ok(
      after.s < NEUTRAL_SATURATION,
      `${hex} picked up a cast: saturation ${after.s.toFixed(3)}`,
    );
  }
});

test("readableOn moves away from the ground, whichever way that is", () => {
  for (const hex of ["#C7A767", "#91ACC7", "#364352"]) {
    assert.ok(
      relativeLuminance(readableOn(hex, PAPER)) <= relativeLuminance(hex) + 1e-9,
      `${hex} should not get lighter on paper`,
    );
    assert.ok(
      relativeLuminance(readableOn(hex, INK)) >= relativeLuminance(hex) - 1e-9,
      `${hex} should not get darker on ink`,
    );
  }
});

test("every sampled colour becomes legible in dark mode too", () => {
  // The dark end of the palette is the problem here, the mirror of the pale
  // end on paper: #364352 is a perfectly good tint until the ground is ink.
  const palette = [
    "#364352", "#393E52", "#4D3A52", "#524E4D", "#525252",
    "#663835", "#73483C", "#814347", "#5E504F", "#8A6548",
  ];
  for (const hex of palette) {
    const ink = readableOn(hex, INK);
    assert.ok(
      contrastRatio(ink, INK) >= AA_CONTRAST,
      `${hex} -> ${ink} only reached ${contrastRatio(ink, INK).toFixed(2)} on ink`,
    );
  }
});

test("near-neutrals sort after every hue", () => {
  const grey = hueSortKey("#525252");
  for (const hex of ["#A46657", "#9E985F", "#364352", "#91ACC7"]) {
    assert.ok(hueSortKey(hex) < grey, `${hex} should sort before a neutral`);
  }
});

test("the hue seam keeps the reds together", () => {
  // #814347 sits just below 360 degrees and #663835 just above 0; an
  // unrotated sort would put the whole wheel between them.
  const a = hueSortKey("#814347");
  const b = hueSortKey("#663835");
  assert.ok(Math.abs(a - b) < 60, `reds split across the seam: ${a} vs ${b}`);
});
