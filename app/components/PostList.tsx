import Link from "next/link";
import type { Post } from "@/app/generated/prisma/client";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
      {posts.map((post) => (
        <article key={post.slug}>
          <Link
            href={`/writing/${post.slug}`}
            className="group block hover:bg-zinc-50 dark:hover:bg-zinc-900 -mx-4 px-4 py-3 transition-colors"
          >
            <time className="text-sm text-zinc-500 dark:text-zinc-500">
              {formatDate(post.date)}
            </time>
            <h2 className="text-xl font-light mt-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {post.excerpt}
              </p>
            )}
          </Link>
        </article>
      ))}
    </div>
  );
}