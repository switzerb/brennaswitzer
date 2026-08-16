import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { Message, Conversation } from "@/app/components/Message";

export async function getPostContent(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = await fs.readFile(fullPath, "utf8");
  const { content, data } = matter(fileContent);

  const { content: mdxContent } = await compileMDX({
    source: content,
    options: { parseFrontmatter: false }, // Already parsed with gray-matter
    components: { Message, Conversation },
  });

  return { content: mdxContent, frontmatter: data };
}
