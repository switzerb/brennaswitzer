/* Randomisation helpers. The site's colour comes from the paintings
   themselves: each Painting row carries a `field` sampled from the image by
   scripts/sample-paintings.py, so there is no hand-picked palette here. */

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
