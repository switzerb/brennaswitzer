import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { POST_SERIES, seriesTitle } from "@/app/lib/postSeries";
import { PostSubnav } from "@/app/components/PostSubnav";
import { PostList } from "@/app/components/PostList";

export async function generateStaticParams() {
  return POST_SERIES.map((s) => ({ series: s.slug }));
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
    <div className="min-h-screen py-12">
      <main className="max-w-3xl mx-auto px-8">
        <h1 className="text-5xl font-light mb-2">Merge Anxiety</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          {title}
        </p>

        <PostSubnav active={series} />
        <PostList posts={posts} />
      </main>
    </div>
  );
}
