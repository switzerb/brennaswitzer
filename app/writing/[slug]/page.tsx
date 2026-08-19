import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getPostContent } from "@/app/lib/mdx";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
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
    <div className="min-h-screen py-12">
      <article className="max-w-3xl mx-auto px-8">
        <time className="text-sm text-zinc-500 dark:text-zinc-500">
          {formatDate(post.date)}
        </time>
        <h1 className="text-4xl font-light mt-1 mb-6">{post.title}</h1>
        <div className="post-content">{content}</div>

        <nav className="flex justify-between mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          {newer ? (
            <Link
              href={`/writing/${newer.slug}`}
              className="text-sm hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              &larr; {newer.title}
            </Link>
          ) : (
            <span />
          )}
          {older ? (
            <Link
              href={`/writing/${older.slug}`}
              className="text-sm text-right hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              {older.title} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}