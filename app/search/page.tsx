import { createClient } from '@/lib/supabase/server';
import { Post } from '@/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  const query = q || '';
  const supabase = await createClient();

  let posts: Post[] = [];

  if (query) {
    // Check if query is a UUID (for post_id search)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

    if (isUUID) {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('id', query)
        .eq('is_published', true);
      posts = data || [];
    } else {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .ilike('title', `%${query}%`)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      posts = data || [];
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-black p-8">
        <h1 className="text-4xl font-bold tracking-tighter mb-8">Search Archive</h1>
        <form className="max-w-xl">
          <div className="flex gap-2">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search by Title or Post ID..."
              className="flex-1 border-brutal p-3 focus:bg-black focus:text-white transition-colors font-mono text-sm"
              autoFocus
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </header>

      <div className="p-8">
        {query && (
          <p className="text-sm font-bold uppercase tracking-widest mb-8 text-gray-500">
            Found {posts.length} result{posts.length !== 1 ? 's' : ''} for "{query}"
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <article className="border-brutal h-full flex flex-col bg-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200">
                {post.cover_image_url && (
                  <div className="aspect-video w-full overflow-hidden border-b border-black">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold leading-tight mb-4 group-hover:underline decoration-2 underline-offset-4">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-6 flex-1 text-sm">
                    {post.excerpt}
                  </p>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-auto font-mono">
                    ID: {post.id.slice(0, 8)}...
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {query && posts.length === 0 && (
          <div className="text-center py-12 border-brutal border-dashed">
            <p className="text-gray-500">No entries found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
