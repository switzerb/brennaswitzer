export const POST_SERIES = [
  { slug: "engineering", title: "Engineering" },
  { slug: "conversations", title: "Conversations with AI" },
] as const;

export type PostSeriesSlug = (typeof POST_SERIES)[number]["slug"];

export function seriesTitle(slug: string): string | undefined {
  return POST_SERIES.find((s) => s.slug === slug)?.title;
}