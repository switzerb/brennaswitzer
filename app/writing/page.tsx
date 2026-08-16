import { prisma } from "@/app/lib/prisma";
import { PostSubnav } from "@/app/components/PostSubnav";
import { PostList } from "@/app/components/PostList";

export default async function WritingPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="min-h-screen py-12">
      <main className="max-w-3xl mx-auto px-8">
        <h1 className="text-5xl font-light mb-2">Merge Anxiety</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Technical writing on software, systems, and craft
        </p>

        <PostSubnav />
        <PostList posts={posts} featureFirst />
      </main>
    </div>
  );
}