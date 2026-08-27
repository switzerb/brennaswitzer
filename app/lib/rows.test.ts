import { test } from "node:test";
import assert from "node:assert/strict";
import { packJustifiedRows, rowHeight, type Proportioned } from "./rows.ts";

interface Plate extends Proportioned {
  id: number;
}

const plates = (count: number, ratio = 1.33): Plate[] =>
  Array.from({ length: count }, (_, i) => ({ id: i, ratio }));

const OPTS = { width: 1168, gap: 12, targetHeight: 95 };

test("row height falls as plates are added", () => {
  const four = rowHeight(plates(4), 1168, 12);
  const eight = rowHeight(plates(8), 1168, 12);
  assert.ok(eight < four);
});

test("a row justifies to the available width", () => {
  const row = plates(6);
  const h = rowHeight(row, 1168, 12);
  const widths = row.reduce((sum, p) => sum + p.ratio * h, 0);
  assert.ok(Math.abs(widths + 12 * 5 - 1168) < 0.001);
});

test("empty input packs to no rows", () => {
  assert.deepEqual(packJustifiedRows([], OPTS), []);
});

test("every plate appears exactly once, in order", () => {
  // This is a regression test. An earlier merge step aliased one row into
  // two slots, so a quarter of the collection rendered twice and the rest
  // vanished — and it looked plausible until you read the plates.
  const input = plates(25);
  const rows = packJustifiedRows(input, OPTS);
  const flat = rows.flatMap((row) => row.items);
  assert.equal(flat.length, input.length);
  assert.deepEqual(
    flat.map((p) => p.id),
    input.map((p) => p.id),
  );
});

test("no two rows share an item", () => {
  const rows = packJustifiedRows(plates(25), OPTS);
  const seen = new Set<number>();
  for (const row of rows) {
    for (const item of row.items) {
      assert.ok(!seen.has(item.id), `plate ${item.id} appears in two rows`);
      seen.add(item.id);
    }
  }
});

test("rows come out balanced, not front-loaded", () => {
  for (let count = 4; count <= 40; count++) {
    const rows = packJustifiedRows(plates(count), OPTS);
    const sizes = rows.map((row) => row.items.length);
    assert.ok(
      Math.max(...sizes) - Math.min(...sizes) <= 2,
      `${count} plates split unevenly: ${sizes.join(", ")}`,
    );
  }
});

test("the target height is a floor, not an average", () => {
  // Filling rows greedily until the next plate drops them below target does
  // the opposite: it squashes a small collection into one strip. Nine near
  // square works at a 200px target used to land in a single 159px row.
  const mixed = [1.03, 0.99, 0.75, 1.2, 1.41, 1.05, 0.9, 1.33, 1.1].map(
    (ratio, id) => ({ id, ratio }),
  );
  const rows = packJustifiedRows(mixed, {
    width: 1400,
    gap: 12,
    targetHeight: 200,
  });
  assert.ok(rows.length > 1, "should not cram nine works into one row");
  for (const row of rows) {
    if (!row.justified) continue;
    assert.ok(
      row.height >= 200,
      `row of ${row.items.length} came out at ${Math.round(row.height)}`,
    );
  }
});

test("a short collection stays a single justified row", () => {
  const rows = packJustifiedRows(plates(3), { ...OPTS, targetHeight: 200 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].items.length, 3);
  assert.ok(rows[0].justified);
});

test("a single work does not fill the page", () => {
  const rows = packJustifiedRows(plates(1), { ...OPTS, targetHeight: 200 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].justified, false);
  assert.equal(rows[0].height, 200);
});

test("no row is ever taller than the stretch limit", () => {
  // Whether a given row needs pinning depends on the width it is hung at,
  // so the invariant worth asserting is the ceiling, not which rows hit it.
  const maxStretch = 2.4;
  const targetHeight = 200;
  for (const count of [1, 2, 3, 5, 9, 25, 40]) {
    const rows = packJustifiedRows(plates(count), { ...OPTS, targetHeight });
    for (const row of rows) {
      assert.ok(
        row.height <= targetHeight * maxStretch + 1e-6,
        `${count} plates produced a row of ${Math.round(row.height)}`,
      );
    }
  }
});

test("mixed proportions still justify to the width", () => {
  const mixed = [1.03, 0.99, 1.5, 1.41, 2.09, 0.9, 1.33].map((ratio, id) => ({ id, ratio }));
  const rows = packJustifiedRows(mixed, { width: 1168, gap: 12, targetHeight: 180 });
  for (const row of rows) {
    if (!row.justified) continue;
    const widths = row.items.reduce((sum, p) => sum + p.ratio * row.height, 0);
    const gaps = 12 * (row.items.length - 1);
    assert.ok(Math.abs(widths + gaps - 1168) < 0.01);
  }
});
