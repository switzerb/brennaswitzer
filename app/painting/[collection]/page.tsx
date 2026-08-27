import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import {
  PAINTING_COLLECTIONS,
  paintingCollection,
} from "@/app/lib/paintingCollections";
import { PaintingSubnav } from "@/app/components/PaintingSubnav";
import { Run } from "@/app/components/Run";

export async function generateStaticParams() {
  return PAINTING_COLLECTIONS.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection } = await params;
  const config = paintingCollection(collection);
  return { title: config?.title ?? "Plates", description: config?.blurb };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const config = paintingCollection(collection);
  if (!config) notFound();

  const paintings = await prisma.painting.findMany({
    where: { collection },
    orderBy: { order: "asc" },
  });

  return (
    <div className="sheet-pad">
      <div className="measure">
        <header className="sheet-head">
          <h1>{config.title}</h1>
          <p className="blurb">{config.blurb}</p>
        </header>

        <PaintingSubnav active={collection} />

        {paintings.length === 0 ? (
          <p className="mono" style={{ color: "var(--soft)" }}>
            Gallery coming soon
          </p>
        ) : (
          <Run
            targetHeight={config.targetRowHeight}
            items={paintings.map((painting) => ({
              imagePath: painting.imagePath,
              title: painting.title,
              ratio: painting.ratio,
              field: painting.field,
              meta: painting.medium,
              marker: painting.region,
              href: `/painting/${collection}/${painting.slug}`,
            }))}
          />
        )}
      </div>
    </div>
  );
}
