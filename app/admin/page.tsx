import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Post } from '@/types';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-black p-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tighter">Dashboard</h1>
        <Link 
          href="/admin/create" 
          className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors"
        >
          New Entry
        </Link>
      </header>

      <div className="divide-y divide-black border-b border-black">
        {posts?.map((post: Post) => (
          <div key={post.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
            <div>
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <span className={post.is_published ? 'text-green-600 font-bold' : 'text-gray-400 font-bold'}>
                  {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <Link 
                href={`/admin/edit/${post.id}`}
                className="text-sm font-bold uppercase tracking-widest hover:underline"
              >
                Edit
              </Link>
              <Link 
                href={`/blog/${post.slug}`}
                className="text-sm font-bold uppercase tracking-widest hover:underline"
                target="_blank"
              >
                View
              </Link>
            </div>
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <div className="p-12 text-center text-gray-500">
            No entries found. Start writing.
          </div>
        )}
      </div>
    </div>
  );
}
