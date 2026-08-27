import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { getPostContent } from "@/app/lib/mdx";
import { postSeries } from "@/app/lib/postSeries";

const formatDate = (date: Date) =>
  date.toISOString().slice(0, 10).replace(/-/g, ".");

/** The flag a drawing carries beside its current revision. */
function RevisionFlag() {
  return (
    <svg viewBox="0 0 16 14" className="rev-flag" aria-hidden="true">
      <path d="M8 1 L15 13 L1 13 Z" />
    </svg>
  );
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  return {
    title: post?.title ?? "Writing",
    description: post?.excerpt ?? undefined,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const found = await prisma.post.findUnique({ where: { slug } });
  if (!found || !found.published) notFound();

  const series = postSeries(found.series);

  // The series in reading order supplies the sheet number and both
  // neighbours in one query, the same way a collection does for a plate.
  const sheets = await prisma.post.findMany({
    where: { published: true, series: found.series },
    orderBy: { date: "desc" },
    include: { revisions: { orderBy: { order: "desc" } } },
  });

  const index = sheets.findIndex((p) => p.slug === slug);
  const post = sheets[index];
  const newer = sheets[index - 1];
  const older = sheets[index + 1];

  const code = series
    ? `${series.code}-${String(index + 1).padStart(2, "0")}`
    : "";
  const revisions = post.revisions;
  const current = revisions[0];

  const { content } = await getPostContent(post.filePath);

  return (
    <div className="sheet-pad">
      <div className="measure">
        <div className="drawing-titleblock mono">
          <span className="tb-who">Brenna Switzer</span>
          <span>Merge Anxiety</span>
          {code && <span className="tb-code">{code}</span>}
          <span className="tb-subject">{post.title}</span>
          <span>First issued {formatDate(post.date)}</span>
          {current && (
            <span className="tb-rev">
              <RevisionFlag />
              Rev {current.label}
            </span>
          )}
        </div>

        <div className="sheet-cols sheet-cols-essay">
          <article className="essay">
            <div className="essay-meta mono">
              <time dateTime={post.date.toISOString()}>
                {formatDate(post.date)}
              </time>
              {series && (
                <Link href={`/writing/series/${series.slug}`}>
                  {series.title}
                </Link>
              )}
            </div>

            <h1 className="essay-title">{post.title}</h1>

            <div className="post-content">{content}</div>
          </article>

          <aside className="sheet-margin">
            {revisions.length > 0 && (
              <section>
                <h2 className="margin-head mono margin-head-split">
                  <span>Revisions</span>
                  <span>{String(revisions.length).padStart(2, "0")}</span>
                </h2>

                <ol className="revisions mono">
                  <li className="revisions-head">
                    <span>Rev</span>
                    <span>Date</span>
                    <span>Description</span>
                  </li>
                  {revisions.map((revision) => (
                    <li key={revision.commit}>
                      <span className="rev-label">{revision.label}</span>
                      <time
                        className="rev-date"
                        dateTime={revision.date.toISOString()}
                      >
                        {formatDate(revision.date)}
                      </time>
                      <span>
                        {revision.subject}
                        <span className="rev-commit">{revision.commit}</span>
                      </span>
                    </li>
                  ))}
                </ol>

                <p className="margin-note">
                  Read straight out of git. It fills in as the piece gets
                  revised.
                </p>
              </section>
            )}

            <section>
              <h2 className="margin-head mono">Status</h2>
              <dl className="record mono">
                <div>
                  <dt>First issued</dt>
                  <dd>{formatDate(post.date)}</dd>
                </div>
                {current && (
                  <div>
                    <dt>Last revised</dt>
                    <dd>{formatDate(current.date)}</dd>
                  </div>
                )}
                <div>
                  <dt>Series</dt>
                  <dd>{series?.title ?? post.series}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <nav className="pager mono">
          {newer ? (
            <Link href={`/writing/${newer.slug}`}>&larr; {newer.title}</Link>
          ) : (
            <span />
          )}
          {older ? (
            <Link href={`/writing/${older.slug}`}>{older.title} &rarr;</Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
