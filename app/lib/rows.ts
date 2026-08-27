/**
 * Justified-row packing for the gallery ("the run").
 *
 * Every plate in a row shares one height and its width follows the work's
 * true proportions, so nothing is cropped and nothing is hand-placed. The
 * number of rows is derived from a target height rather than fixed, which is
 * what lets a nine-work collection show large and a twenty-five-work
 * collection show dense without a second layout.
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
  /**
   * The height rows aim for. Treated as a floor rather than an average: an
   * extra row is preferred over squashing every plate below it.
   */
  targetHeight: number;
  /**
   * How much taller than the target a row may go before it is pinned to the
   * target and left-aligned instead. Rows legitimately vary in height — that
   * is what justification means — so this is set loose enough to leave a
   * two-row collection alone, and only bites when a row of one or two would
   * otherwise fill the whole screen.
   */
  maxStretch?: number;
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
  { width, gap, targetHeight, maxStretch = 2.4 }: PackOptions,
): RowLayout<T>[] {
  if (items.length === 0) return [];

  const totalRatio = items.reduce((sum, item) => sum + item.ratio, 0);

  // How many rows it takes to hang everything at the target height. Laying
  // N plates at height h needs `totalRatio * h` of image plus the gaps, and R
  // rows supply `R * width - gap * (N - R)` of it; solving for R and rounding
  // up is what makes the target a floor. Filling rows greedily instead —
  // taking plates until the next one would drop the row below target — packs
  // a small collection into one squashed strip, because the row never gets
  // the chance to break.
  const rowCount = Math.max(
    1,
    Math.ceil(
      (totalRatio * targetHeight + gap * items.length) / (width + gap),
    ),
  );

  // Spread the ratio evenly across those rows, so no row is left a runt.
  const ratioPerRow = totalRatio / rowCount;
  const rows: T[][] = [];
  let current: T[] = [];
  let currentRatio = 0;

  for (const item of items) {
    const isFinalRow = rows.length === rowCount - 1;
    const wouldOvershoot = currentRatio + item.ratio / 2 > ratioPerRow;
    if (!isFinalRow && current.length > 0 && wouldOvershoot) {
      rows.push(current);
      current = [];
      currentRatio = 0;
    }
    current.push(item);
    currentRatio += item.ratio;
  }
  if (current.length > 0) rows.push(current);

  return rows.map((row) => {
    const natural = rowHeight(row, width, gap);
    const overstretched = natural > targetHeight * maxStretch;
    return {
      items: row,
      height: overstretched ? targetHeight : natural,
      justified: !overstretched,
    };
  });
}
