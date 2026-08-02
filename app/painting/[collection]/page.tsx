import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PAINTING_COLLECTIONS, collectionTitle } from "@/app/lib/paintingCollections";
import { PaintingSubnav } from "@/app/components/PaintingSubnav";

export async function generateStaticParams() {
  return PAINTING_COLLECTIONS.map((c) => ({ collection: c.slug }));
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
    <div className="min-h-screen py-16">
      <main className="max-w-6xl mx-auto px-8">
        <h1 className="text-4xl font-light mb-4">{title}</h1>
        {collection === "houses" && paintings.length > 0 && (
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            A painting of every place I&apos;ve lived.
          </p>
        )}
        <PaintingSubnav active={collection} />

        {paintings.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            Gallery coming soon
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paintings.map((painting) => (
              <Link
                key={painting.slug}
                href={`/painting/${collection}/${painting.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  <Image
                    src={painting.imagePath}
                    alt={painting.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:opacity-80 transition-opacity"
                  />
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                  {painting.title}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
