/**
 * Revision labelling, as a drawing sheet does it: the first issue is A, the
 * next B, and so on. Past Z it doubles up rather than starting over, so the
 * label stays a stable handle for a given revision no matter how many there
 * eventually are.
 */
export function revisionLabel(index: number): string {
  if (index < 0) throw new RangeError(`Revision index cannot be ${index}`);

  let label = "";
  for (let n = index; ; n = Math.floor(n / 26) - 1) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    if (n < 26) return label;
  }
}
