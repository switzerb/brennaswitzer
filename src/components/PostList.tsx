import Link from "next/link";
import type { Post } from "@/app/generated/prisma/client";
import { seriesTitle } from "@/app/lib/postSeries";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, ".");
}


type PostListProps = {
  posts: Post[];
  featureFirst?: boolean;
  showSeries?: boolean;
}

export function PostList({
  posts,
  featureFirst = false,
  showSeries = true,
}: PostListProps ) {
  return (
    <div className="index">
      {posts.map((post, index) => (
        <Link
          key={post.slug}
          href={`/writing/${post.slug}`}
          className={`entry${featureFirst && index === 0 ? " featured" : ""}`}
        >
          <time className="mono" dateTime={post.date.toISOString()}>
            {formatDate(post.date)}
          </time>
          <div>
            <h2>{post.title}</h2>
            {post.excerpt && <p className="excerpt">{post.excerpt}</p>}
          </div>
          {showSeries && (
            <span className="tag mono">
              {seriesTitle(post.series) ?? post.series}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
