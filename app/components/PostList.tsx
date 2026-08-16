import Link from "next/link";
import type { Post } from "@/app/generated/prisma/client";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.slug}>
          <Link
            href={`/writing/${post.slug}`}
            className="group block hover:bg-zinc-50 dark:hover:bg-zinc-900 -mx-4 px-4 py-4 transition-colors"
          >
            <time className="text-sm text-zinc-500 dark:text-zinc-500">
              {formatDate(post.date)}
            </time>
            <h2 className="text-2xl font-light mt-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                {post.excerpt}
              </p>
            )}
          </Link>
        </article>
      ))}
    </div>
  );
}