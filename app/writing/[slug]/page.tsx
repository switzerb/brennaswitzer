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

  return (
    <div className="min-h-screen py-16">
      <article className="max-w-3xl mx-auto px-8">
        <time className="text-sm text-zinc-500 dark:text-zinc-500">
          {formatDate(post.date)}
        </time>
        <h1 className="text-4xl font-light mt-1 mb-8">{post.title}</h1>
        <div className="prose dark:prose-invert">{content}</div>
      </article>
    </div>
  );
}