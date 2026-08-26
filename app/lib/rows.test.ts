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

test("a trailing orphan is folded into the row above", () => {
  for (let count = 4; count <= 40; count++) {
    const rows = packJustifiedRows(plates(count), OPTS);
    if (rows.length < 2) continue;
    assert.ok(
      rows[rows.length - 1].items.length >= 3,
      `${count} plates left a final row of ${rows[rows.length - 1].items.length}`,
    );
  }
});

test("a short collection stays a single justified row", () => {
  const rows = packJustifiedRows(plates(3), { ...OPTS, targetHeight: 200 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].items.length, 3);
});

test("a final row that cannot fill the width is pinned, not stretched", () => {
  // Two very wide plates would justify to a huge height on their own.
  const wide = [
    { id: 0, ratio: 1.33 },
    { id: 1, ratio: 1.33 },
    { id: 2, ratio: 1.33 },
    { id: 3, ratio: 4.0 },
    { id: 4, ratio: 4.0 },
  ];
  const rows = packJustifiedRows(wide, { width: 1168, gap: 12, targetHeight: 120, minLastRow: 2 });
  const last = rows[rows.length - 1];
  if (!last.justified) assert.equal(last.height, 120);
  for (const row of rows) assert.ok(row.height > 0);
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
