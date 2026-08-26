import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { getPostContent } from "@/app/lib/mdx";
import { seriesTitle } from "@/app/lib/postSeries";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, ".");
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

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) {
    notFound();
  }

  const { content } = await getPostContent(post.filePath);

  const [newer, older] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true, series: post.series, date: { gt: post.date } },
      orderBy: { date: "asc" },
    }),
    prisma.post.findFirst({
      where: { published: true, series: post.series, date: { lt: post.date } },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="sheet-pad">
      <article className="article">
        <header className="article-head">
          <div className="mono" style={{ display: "flex", gap: "1.2rem" }}>
            <time dateTime={post.date.toISOString()}>
              {formatDate(post.date)}
            </time>
            <Link
              href={`/writing/series/${post.series}`}
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              {seriesTitle(post.series) ?? post.series}
            </Link>
          </div>
          <h1>{post.title}</h1>
        </header>

        <div className="post-content">{content}</div>

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
      </article>
    </div>
  );
}
