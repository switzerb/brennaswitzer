import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/app/lib/prisma";
import { POST_SERIES, seriesTitle } from "@/app/lib/postSeries";
import { PostSubnav } from "@/app/components/PostSubnav";
import { PostList } from "@/app/components/PostList";

export async function generateStaticParams() {
  return POST_SERIES.map((s) => ({ series: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>;
}): Promise<Metadata> {
  const { series } = await params;
  return { title: seriesTitle(series) ?? "Merge Anxiety" };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const { series } = await params;
  const title = seriesTitle(series);
  if (!title) notFound();

  const posts = await prisma.post.findMany({
    where: { published: true, series },
    orderBy: { date: "desc" },
  });

  return (
    <div className="sheet-pad">
      <div className="measure">
        <header className="sheet-head">
          <h1>{title}</h1>
          <p className="blurb mono">
            Merge Anxiety · {posts.length}{" "}
            {posts.length === 1 ? "entry" : "entries"}
          </p>
        </header>

        <PostSubnav active={series} />
        <PostList posts={posts} showSeries={false} />
      </div>
    </div>
  );
}
