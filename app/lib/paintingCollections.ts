/**
 * The painting collections, and how each one wants to be hung.
 *
 * `targetRowHeight` is the height the gallery packs rows toward. It is the
 * one dial that decides how a collection reads: a small collection with a
 * tall target shows large, a big one with a short target shows dense. Rows
 * fill to the target rather than to a fixed count, so this keeps working as
 * work is added.
 */
export interface PaintingCollection {
  slug: string;
  title: string;
  /** Catalogue prefix, e.g. HO-21. */
  code: string;
  blurb: string;
  targetRowHeight: number;
}

export const PAINTING_COLLECTIONS: readonly PaintingCollection[] = [
  {
    slug: "abstract-landscape",
    title: "Abstract Landscape",
    code: "AL",
    blurb:
      "Acrylic on paper. Mostly painted somewhere other than where I live.",
    targetRowHeight: 200,
  },
  {
    slug: "houses",
    title: "Houses",
    code: "HO",
    blurb:
      "A drawing of every place I have ever lived, in the order I lived in them.",
    targetRowHeight: 130,
  },
  {
    slug: "sketches",
    title: "Sketches",
    code: "SK",
    blurb: "Studies, and things that would not sit still.",
    targetRowHeight: 200,
  },
] as const;

/**
 * The painting the site opens wearing.
 *
 * Deliberately separate from hanging order: which work leads a collection
 * and which colour the interface takes are different decisions, and tying
 * them together would mean reordering a gallery to change an accent.
 * Falls back to the first sampled work if this slug goes away.
 */
export const OPENING_SPECIMEN = "tuscany-seven";

export function paintingCollection(
  slug: string,
): PaintingCollection | undefined {
  return PAINTING_COLLECTIONS.find((c) => c.slug === slug);
}

export function collectionTitle(slug: string): string | undefined {
  return paintingCollection(slug)?.title;
}
