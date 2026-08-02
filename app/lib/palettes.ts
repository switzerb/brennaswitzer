export type Palette = [string, string, string];

export const PALETTES: Palette[] = [
  ["#B5603E", "#7A5C1C", "#5B3A29"], // clay
  ["#2B4C7E", "#3E8E7E", "#5B4B8A"], // ocean
  ["#4A5D23", "#7A8B4F", "#2F3E2F"], // botanical
  ["#B5484A", "#C97A3A", "#6E3B5C"], // sunset
  ["#22333B", "#5E6472", "#9C5148"], // ink & rust
  ["#7A2048", "#B5566B", "#40233C"], // berry
];

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
