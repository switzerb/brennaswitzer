import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
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
    painting.medium,
    painting.dimensions,
    painting.date ? painting.date.toISOString().slice(0, 10) : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen py-16">
      <article className="max-w-3xl mx-auto px-8">
        <PaintingSubnav active={collection} />
        {painting.region && (
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            {painting.region}
          </p>
        )}
        <h1 className="text-4xl font-light mt-1 mb-8">{painting.title}</h1>

        <div className="relative w-full h-[60vh] bg-zinc-100 dark:bg-zinc-900 mb-8">
          <Image
            src={painting.imagePath}
            alt={painting.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
            priority
          />
        </div>

        {details.length > 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">
            {details.join(" · ")}
          </p>
        )}

        {painting.description && (
          <div className="prose dark:prose-invert whitespace-pre-line">
            {painting.description}
          </div>
        )}

        <nav className="flex justify-between mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          {prev ? (
            <Link
              href={`/painting/${collection}/${prev.slug}`}
              className="text-sm hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              &larr; {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/painting/${collection}/${next.slug}`}
              className="text-sm text-right hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              {next.title} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}
