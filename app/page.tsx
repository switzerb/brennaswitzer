import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import {
  OPENING_SPECIMEN,
  PAINTING_COLLECTIONS,
} from "@/app/lib/paintingCollections";
import { POST_SERIES } from "@/app/lib/postSeries";
import { EDUCATION, EXPERIENCE, span } from "@/app/lib/cv";
import {
  BookIndex,
  type Family,
  type IndexSection,
} from "@/src/components/BookIndex";
import {code, monthOf} from "@/src/utils";

export const metadata: Metadata = {
  title: "Brenna Switzer — Staff Software Engineer",
  description:
    "Paintings and writing, indexed.",
};

export default async function Home() {
  const [paintings, posts] = await Promise.all([
    prisma.painting.findMany({ orderBy: { order: "asc" } }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const sections: IndexSection[] = [];
  const families: Family[] = [];
  let openingCode = "";

  for (const collection of PAINTING_COLLECTIONS) {
    const works = paintings.filter((p) => p.collection === collection.slug);
    if (works.length === 0) continue;

    const opening = works.findIndex((w) => w.slug === OPENING_SPECIMEN);
    if (opening !== -1) openingCode = code(collection.code, opening);

    sections.push({
      id: collection.slug,
      title: collection.title,
      entries: works.map((work, i) => ({
        code: code(collection.code, i),
        title: work.title,
        detail: work.region ?? work.medium ?? "",
        href: `/painting/${collection.slug}/${work.slug}`,
        hex: work.field ?? undefined,
      })),
    });

    families.push({
      id: collection.slug,
      title: collection.title,
      specimens: works.flatMap((work, i) =>
        work.field
          ? [
              {
                code: code(collection.code, i),
                title: work.title,
                hex: work.field,
                provenance: [collection.title, work.region]
                  .filter(Boolean)
                  .join(" · "),
              },
            ]
          : [],
      ),
    });
  }

  for (const series of POST_SERIES) {
    const written = posts.filter((p) => p.series === series.slug);
    if (written.length === 0) continue;

    sections.push({
      id: series.slug,
      title: `Merge Anxiety · ${series.title}`,
      entries: written.map((post, i) => ({
        code: code(series.code, i),
        title: post.title,
        detail: monthOf(post.date),
        href: `/writing/${post.slug}`,
      })),
    });
  }

  const total = sections.reduce((n, s) => n + s.entries.length, 0);
  const specimens = families.flatMap((family) => family.specimens);
  const opening =
    specimens.find((s) => s.code === openingCode)?.code ??
    specimens[0]?.code ??
    "";

  return (
    <div className="sheet-pad">
      <div className="measure index-page">
        <header className="index-head">
          <div>
            <h1 className="display index-display">
              Everything
              <br />
              starts out rough.
            </h1>
            <p className="index-lede">
              Index of {paintings.length} paintings and {posts.length} posts. If you&apos;re here, it&apos;s probably because you know I
              paint and you&apos;re curious to see, you know I code and you&apos;re here to judge, or you&apos;re lost. All three are fine by me.
            </p>
            <p className="index-lede">
              This site is less a personal brand than a digital sketchbook.  None of us actually know what we&apos;re doing. That&apos;s never a reason to stop flailing — learning something new is still the finest pleasure there is.
            </p>
          </div>
        </header>

        <BookIndex
          sections={sections}
          families={families}
          defaultSpecimen={opening}
        />
      </div>
    </div>
  );
}
