import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/app/lib/prisma";
import { PAINTING_COLLECTIONS } from "@/app/lib/paintingCollections";

export default async function PaintingPage() {
  const covers = await prisma.painting.findMany({
    where: { collection: { in: PAINTING_COLLECTIONS.map((c) => c.slug) } },
    orderBy: { order: "desc" },
    distinct: ["collection"],
  });
  const coverByCollection = new Map(covers.map((c) => [c.collection, c]));

  return (
    <div className="min-h-screen py-16">
      <main className="max-w-4xl mx-auto px-8">
        <h1 className="text-5xl font-light mb-12">Painting</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PAINTING_COLLECTIONS.map((collection) => {
            const cover = coverByCollection.get(collection.slug);
            return (
              <Link
                key={collection.slug}
                href={`/painting/${collection.slug}`}
                className="group block"
              >
                <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  {cover && (
                    <Image
                      src={cover.imagePath}
                      alt=""
                      fill
                      loading="eager"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {cover && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h2
                      className={`text-2xl transition-opacity group-hover:opacity-80 ${
                        cover
                          ? "text-white"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {collection.title}
                    </h2>
                    {!cover && (
                      <p className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-600 mt-1">
                        Coming soon
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
