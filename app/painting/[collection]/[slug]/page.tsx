import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { PAINTING_COLLECTIONS } from "@/app/lib/paintingCollections";
import { PaintingSubnav } from "@/app/components/PaintingSubnav";

export async function generateStaticParams() {
  const paintings = await prisma.painting.findMany({
    where: { collection: { in: PAINTING_COLLECTIONS.map((c) => c.slug) } },
    select: { collection: true, slug: true },
  });

  return paintings.map((p) => ({ collection: p.collection, slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const painting = await prisma.painting.findUnique({ where: { slug } });
  return {
    title: painting?.title ?? "Plate",
    description: painting?.medium ?? undefined,
  };
}

export default async function PaintingDetailPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = await params;
  if (!PAINTING_COLLECTIONS.some((c) => c.slug === collection)) {
    notFound();
  }

  const painting = await prisma.painting.findUnique({ where: { slug } });
  if (!painting || painting.collection !== collection) {
    notFound();
  }

  const [prev, next] = await Promise.all([
    prisma.painting.findFirst({
      where: { collection, order: { lt: painting.order } },
      orderBy: { order: "desc" },
    }),
    prisma.painting.findFirst({
      where: { collection, order: { gt: painting.order } },
      orderBy: { order: "asc" },
    }),
  ]);

  const details = [
    painting.region,
    painting.medium,
    painting.dimensions,
    painting.date ? painting.date.toISOString().slice(0, 10) : null,
  ].filter(Boolean);

  return (
    <div className="sheet-pad">
      <div className="measure">
        <PaintingSubnav active={collection} />

        <div className="solo">
          <header className="sheet-head">
            <h1>{painting.title}</h1>
            {details.length > 0 && (
              <p className="blurb mono solo-meta">
                {details.map((detail) => (
                  <span key={detail as string}>{detail}</span>
                ))}
              </p>
            )}
          </header>

          <div
            className="solo-frame"
            style={
              { "--field": painting.field ?? "#55647D" } as React.CSSProperties
            }
          >
            <Image
              src={painting.imagePath}
              alt={painting.title}
              fill
              sizes="(max-width: 1100px) 100vw, 1100px"
              className="object-contain"
              priority
            />
          </div>

          {painting.description && (
            <div className="post-content whitespace-pre-line">
              {painting.description}
            </div>
          )}
        </div>

        <nav className="pager mono">
          {prev ? (
            <Link href={`/painting/${collection}/${prev.slug}`}>
              &larr; {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/painting/${collection}/${next.slug}`}>
              {next.title} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
