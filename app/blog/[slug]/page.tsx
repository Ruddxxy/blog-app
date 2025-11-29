import { createClient } from "@/lib/supabase/server";
import { Post } from "@/types";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export const revalidate = 0;

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) {
    notFound();
  }

  const postData = post as Post;

  return (
    <article className="flex-1 flex flex-col">
      <header className="border-b border-black p-12 md:p-24 text-center">
        {postData.cover_image_url && (
          <div className="max-w-4xl mx-auto mb-12">
            <img
              src={postData.cover_image_url}
              alt={postData.title}
              className="w-full h-[400px] object-cover border border-black grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
          {postData.title}
        </h1>
        <div className="text-sm uppercase tracking-widest">
          {new Date(postData.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full p-8 md:p-12 border-x border-black min-h-[50vh]">
        <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:underline hover:prose-a:text-black">
          <ReactMarkdown>{postData.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
