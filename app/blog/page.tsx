import { createClient } from "@/lib/supabase/server";
import { BlogCard } from "@/components/BlogCard";
import { Post } from "@/types";

export const revalidate = 60;

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 flex flex-col">
      {/* Header Section */}
      <section className="border-b border-black p-12 md:p-24">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase">
          The Archive
        </h1>
        <p className="mt-4 text-xl font-mono text-gray-600 max-w-2xl">
          A collection of thoughts, stories, and ideas.
        </p>
      </section>

      {/* Blog Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black border-b border-black">
        {posts?.map((post) => (
          <BlogCard key={post.id} post={post as Post} />
        ))}
        {(!posts || posts.length === 0) && (
          <div className="p-12 col-span-full text-center text-gray-500 font-mono">
            No posts found in the archive.
          </div>
        )}
      </section>
    </main>
  );
}
