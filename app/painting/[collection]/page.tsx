import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import {
  PAINTING_COLLECTIONS,
  collectionTitle,
} from "@/app/lib/paintingCollections";
import { PaintingSubnav } from "@/app/components/PaintingSubnav";
import { Plate } from "@/app/components/Plate";

const BLURBS: Record<string, string> = {
  houses: "A painting of every place I have ever lived.",
  "abstract-landscape":
    "Acrylic on paper, mostly painted somewhere other than where I live.",
  sketches: "Studies, and things that would not sit still.",
};

export async function generateStaticParams() {
  return PAINTING_COLLECTIONS.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  const title = collectionTitle(collection);
  return { title: title ?? "Plates", description: BLURBS[collection] };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const title = collectionTitle(collection);
  if (!title) notFound();

  const paintings = await prisma.painting.findMany({
    where: { collection },
    orderBy: { order: "desc" },
  });

  return (
    <div className="sheet-pad">
      <div className="measure">
        <header className="sheet-head">
          <h1>{title}</h1>
          {BLURBS[collection] && <p className="blurb">{BLURBS[collection]}</p>}
        </header>

        <PaintingSubnav active={collection} />

        {paintings.length === 0 ? (
          <p className="mono" style={{ color: "var(--soft)" }}>
            Gallery coming soon
          </p>
        ) : (
          <div className="plate-grid">
            {paintings.map((painting, i) => (
              <Plate
                key={painting.slug}
                imagePath={painting.imagePath}
                title={painting.title}
                meta={painting.medium ?? undefined}
                field={painting.field}
                ratio={painting.ratio}
                href={`/painting/${collection}/${painting.slug}`}
                uncropped
                priority={i < 6}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
