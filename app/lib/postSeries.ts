/** The series a piece of writing belongs to, and its catalogue prefix. */
export interface PostSeries {
  slug: string;
  title: string;
  /** Catalogue prefix, e.g. ME-04. */
  code: string;
}

export const POST_SERIES: readonly PostSeries[] = [
  { slug: "engineering", title: "Engineering", code: "ME" },
  { slug: "conversations", title: "Conversations with AI", code: "MC" },
] as const;

export function postSeries(slug: string): PostSeries | undefined {
  return POST_SERIES.find((s) => s.slug === slug);
}

export function seriesTitle(slug: string): string | undefined {
  return postSeries(slug)?.title;
}
