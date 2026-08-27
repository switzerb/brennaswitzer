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
} from "@/app/components/BookIndex";

export const metadata: Metadata = {
  title: "Brenna Switzer — Staff Software Engineer",
  description:
    "An ongoing index of paintings, essays and a working life. Every colour is sampled from the work it names.",
};

const code = (prefix: string, index: number) =>
  `${prefix}-${String(index + 1).padStart(2, "0")}`;

const monthOf = (date: Date) =>
  date.toISOString().slice(0, 7).replace("-", ".");

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

  sections.push({
    id: "work",
    title: "Work",
    entries: [
      ...EXPERIENCE.map((employer, i) => ({
        code: code("CV", i),
        title: `${employer.company} — ${employer.roles[0].title}`,
        detail: span(employer),
        href: "/about",
      })),
      {
        code: code("CV", EXPERIENCE.length),
        title: `${EDUCATION.school} — ${EDUCATION.degree}`,
        detail: EDUCATION.dates.replace(/\s/g, ""),
        href: "/about",
      },
    ],
  });

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
              An ongoing index of {paintings.length} paintings, {posts.length}{" "}
              essays and a working life &mdash; {total} entries in all. Every
              colour here was sampled from the work it is named after; nothing
              was chosen for it.
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
