import { createClient } from "@/lib/supabase/server";
import { BlogCard } from "@/components/BlogCard";
import { Post } from "@/types";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-black p-12 md:p-24">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
          Written Work
        </h1>
      </section>

      {/* Blog Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black border-b border-black">
        {posts?.map((post) => (
          <BlogCard key={post.id} post={post as Post} />
        ))}
        {(!posts || posts.length === 0) && (
          <div className="p-12 col-span-full text-center text-gray-500">
            No posts found.
          </div>
        )}
      </section>
    </main>
  );
}
