/**
 * Justified-row packing for the gallery ("the run").
 *
 * Every plate in a row shares one height and its width follows the work's
 * true proportions, so nothing is cropped and nothing is hand-placed. Rows
 * are filled to a target height rather than to a fixed count, which is what
 * lets a nine-work collection show large and a twenty-five-work collection
 * show dense without a second layout.
 *
 * The component renders a row as a flex container where each item gets
 * `flex-grow: ratio` and `flex-basis: 0`. Widths then come out proportional
 * to the ratios and the heights equalise on their own — the browser does the
 * arithmetic, so there is nothing to measure or recompute on resize.
 */

export interface Proportioned {
  /** width / height of the work itself. */
  ratio: number;
}

export interface RowLayout<T extends Proportioned> {
  items: T[];
  /** The height the row resolves to at `width`. */
  height: number;
  /**
   * False for a trailing row too short to fill the width. The component
   * pins those to `height` and left-aligns them instead of stretching one
   * plate across the page.
   */
  justified: boolean;
}

export interface PackOptions {
  /** Content width available to a row. */
  width: number;
  /** Gap between plates, in the same units as `width`. */
  gap: number;
  /** Rows fill until adding one more would drop below this height. */
  targetHeight: number;
  /**
   * A trailing row shorter than this is folded back into the row above —
   * a lone plate reads as an orphan however it is sized.
   */
  minLastRow?: number;
  /** How much taller than target a final row may be before it is pinned. */
  runtTolerance?: number;
}

/** The height a set of plates resolves to when justified across `width`. */
export function rowHeight(
  items: Proportioned[],
  width: number,
  gap: number,
): number {
  if (items.length === 0) return 0;
  const totalRatio = items.reduce((sum, item) => sum + item.ratio, 0);
  return (width - gap * (items.length - 1)) / totalRatio;
}

export function packJustifiedRows<T extends Proportioned>(
  items: readonly T[],
  {
    width,
    gap,
    targetHeight,
    minLastRow = 3,
    runtTolerance = 1.25,
  }: PackOptions,
): RowLayout<T>[] {
  if (items.length === 0) return [];

  const rows: T[][] = [];
  let current: T[] = [];

  for (const item of items) {
    const candidate = [...current, item];
    if (current.length > 0 && rowHeight(candidate, width, gap) < targetHeight) {
      rows.push(current);
      current = [item];
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) rows.push(current);

  // Fold a trailing orphan back into the row above and let that row go
  // denser. Written out rather than as `rows[rows.length - 2] += rows.pop()`,
  // which resolves its index against the already-shortened array and aliases
  // the merged row into two slots.
  if (rows.length > 1 && rows[rows.length - 1].length < minLastRow) {
    const orphan = rows.pop() as T[];
    rows[rows.length - 1] = [...rows[rows.length - 1], ...orphan];
  }

  return rows.map((row, index) => {
    const natural = rowHeight(row, width, gap);
    const isLast = index === rows.length - 1;
    const isRunt = isLast && natural > targetHeight * runtTolerance;
    return {
      items: row,
      height: isRunt ? targetHeight : natural,
      justified: !isRunt,
    };
  });
}
