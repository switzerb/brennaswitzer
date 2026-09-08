import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { PAINTING_COLLECTIONS } from "@/app/lib/paintingCollections";
import { Plate } from "@/src/components/Plate";

export const metadata: Metadata = {
  title: "Plates",
  description:
    "Acrylic and watercolour on paper, and a graphite series of every place I have ever lived.",
};

export default async function PaintingPage() {
  const [covers, counts] = await Promise.all([
    prisma.painting.findMany({
      where: { collection: { in: PAINTING_COLLECTIONS.map((c) => c.slug) } },
      orderBy: { order: "desc" },
      distinct: ["collection"],
    }),
    prisma.painting.groupBy({ by: ["collection"], _count: true }),
  ]);

  const coverBy = new Map(covers.map((c) => [c.collection, c]));
  const countBy = new Map(counts.map((c) => [c.collection, c._count]));

  return (
    <div className="sheet-pad">
      <div className="measure">
        <header className="sheet-head">
          <h1>Plates</h1>
          <p className="blurb">
            Acrylic and watercolour on paper, and one long graphite series: a
            drawing of every place I have ever lived.
          </p>
        </header>

        <div className="collection-grid">
          {PAINTING_COLLECTIONS.map((collection) => {
            const cover = coverBy.get(collection.slug);
            const count = countBy.get(collection.slug) ?? 0;
            if (!cover) return null;
            return (
              <Plate
                key={collection.slug}
                imagePath={cover.imagePath}
                title={collection.title}
                meta={`${count} ${count === 1 ? "work" : "works"}`}
                field={cover.field}
                ratio={cover.ratio}
                href={`/painting/${collection.slug}`}
                aspect="4 / 3"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
