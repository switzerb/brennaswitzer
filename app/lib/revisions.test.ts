import { test } from "node:test";
import assert from "node:assert/strict";
import { revisionLabel } from "./revisions.ts";

test("the first issue is A", () => {
  assert.equal(revisionLabel(0), "A");
  assert.equal(revisionLabel(1), "B");
  assert.equal(revisionLabel(25), "Z");
});

test("past Z it doubles up rather than starting over", () => {
  assert.equal(revisionLabel(26), "AA");
  assert.equal(revisionLabel(27), "AB");
  assert.equal(revisionLabel(51), "AZ");
  assert.equal(revisionLabel(52), "BA");
});

test("labels are unique and ordered for any plausible history", () => {
  const seen = new Set<string>();
  let previous = "";
  for (let i = 0; i < 200; i++) {
    const label = revisionLabel(i);
    assert.ok(!seen.has(label), `${label} repeated at ${i}`);
    assert.ok(
      label.length > previous.length || label > previous,
      `${label} does not follow ${previous}`,
    );
    seen.add(label);
    previous = label;
  }
});

test("a negative index is a mistake, not a label", () => {
  assert.throws(() => revisionLabel(-1), RangeError);
});
