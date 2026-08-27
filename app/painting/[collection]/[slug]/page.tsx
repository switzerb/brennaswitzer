import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import {
  PAINTING_COLLECTIONS,
  paintingCollection,
} from "@/app/lib/paintingCollections";
import { renderMarkdown } from "@/app/lib/mdx";

const DEFAULT_FIELD = "#55647D";
const DEFAULT_RATIO = 4 / 3;

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

/** A dash, not a guess: the field exists and has not been filled in. */
function Unrecorded() {
  return <span className="unrecorded">&mdash;</span>;
}

export default async function PaintingDetailPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = await params;
  const config = paintingCollection(collection);
  if (!config) notFound();

  // The whole collection, in hanging order — it supplies the plate number,
  // the sheet count and the neighbours in one query.
  const sheets = await prisma.painting.findMany({
    where: { collection },
    orderBy: { order: "asc" },
  });

  const index = sheets.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const painting = sheets[index];
  const previous = sheets[index - 1];
  const next = sheets[index + 1];
  const code = `${config.code}-${String(index + 1).padStart(2, "0")}`;
  const description = painting.description
    ? await renderMarkdown(painting.description)
    : null;

  return (
    <div className="sheet-pad">
      <div className="measure">
        <div className="drawing-titleblock mono">
          <span className="tb-who">Brenna Switzer</span>
          <span>{config.title}</span>
          <span className="tb-code">{code}</span>
          <span className="tb-subject">{painting.title}</span>
          <span>{painting.medium ?? <Unrecorded />}</span>
          <span>
            Sheet {index + 1} of {sheets.length}
          </span>
        </div>

        <div className="sheet-cols">
          <figure
            className="sheet-figure"
            style={
              {
                "--field": painting.field ?? DEFAULT_FIELD,
                "--ar": String(painting.ratio ?? DEFAULT_RATIO),
              } as React.CSSProperties
            }
          >
            <div className="plate-img">
              <Image
                src={painting.imagePath}
                alt={painting.title}
                fill
                sizes="(max-width: 900px) 100vw, 62vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Drawn only when there is a measurement to draw. */}
            {painting.dimensions && (
              <div className="dimension mono" aria-hidden="true">
                <span className="dimension-rule" />
                <span className="dimension-label">{painting.dimensions}</span>
                <span className="dimension-rule" />
              </div>
            )}
          </figure>

          <aside className="sheet-margin">
            <h1>{painting.title}</h1>

            {description ? (
              <div className="post-content plate-note">{description}</div>
            ) : (
              <p className="plate-note-empty">
                No note on this one yet.
              </p>
            )}

            <section>
              <h2 className="margin-head mono">Specimen</h2>
              <div className="specimen">
                <span
                  className="specimen-chip"
                  style={
                    {
                      background: painting.field ?? DEFAULT_FIELD,
                    } as React.CSSProperties
                  }
                />
                <div className="specimen-facts mono">
                  <span className="specimen-code">{code}</span>
                  <span>{painting.field ?? <Unrecorded />}</span>
                  <span>Sampled, not chosen</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="margin-head mono">Record</h2>
              <dl className="record mono">
                <div>
                  <dt>Collection</dt>
                  <dd>{config.title}</dd>
                </div>
                <div>
                  <dt>Region</dt>
                  <dd>{painting.region ?? <Unrecorded />}</dd>
                </div>
                <div>
                  <dt>Medium</dt>
                  <dd>{painting.medium ?? <Unrecorded />}</dd>
                </div>
                <div>
                  <dt>Dimensions</dt>
                  <dd>{painting.dimensions ?? <Unrecorded />}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>
                    {painting.date ? (
                      painting.date.toISOString().slice(0, 10)
                    ) : (
                      <Unrecorded />
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <nav className="pager mono">
          {previous ? (
            <Link href={`/painting/${collection}/${previous.slug}`}>
              &larr; {config.code}-{String(index).padStart(2, "0")}{" "}
              {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/painting/${collection}/${next.slug}`}>
              {config.code}-{String(index + 2).padStart(2, "0")} {next.title}{" "}
              &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
