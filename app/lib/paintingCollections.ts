export const PAINTING_COLLECTIONS = [
  { slug: "abstract-landscape", title: "Abstract Landscape" },
  { slug: "houses", title: "Houses" },
  { slug: "sketches", title: "Sketches" },
] as const;

export type PaintingCollectionSlug = (typeof PAINTING_COLLECTIONS)[number]["slug"];

export function collectionTitle(slug: string): string | undefined {
  return PAINTING_COLLECTIONS.find((c) => c.slug === slug)?.title;
}
