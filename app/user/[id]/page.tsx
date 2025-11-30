import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FollowButton } from '@/components/FollowButton';
import Link from 'next/link';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch user profile (if exists) or just check auth user existence
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', id)
    .single();
  
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  // Check if following
  let isFollowing = false;
  if (currentUser) {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', id)
      .single();
    isFollowing = !!data;
  }

  // Get stats
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', id);

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', id);

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
      <header className="mb-12 border-b border-black pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">
            {profile?.username || 'User Profile'}
          </h1>
          <p className="font-mono text-gray-500 text-sm">{id}</p>
          <div className="flex gap-6 mt-4 text-sm font-bold uppercase tracking-widest">
            <span>{posts?.length || 0} Posts</span>
            <span>{followersCount || 0} Followers</span>
            <span>{followingCount || 0} Following</span>
          </div>
        </div>
        
        {currentUser && currentUser.id !== id && (
          <FollowButton targetUserId={id} initialIsFollowing={isFollowing} />
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post) => (
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
                <h2 className="text-2xl font-bold leading-tight mb-4 group-hover:underline decoration-2 underline-offset-4">
                  {post.title}
                </h2>
                <p className="text-gray-600 line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-auto">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      {posts?.length === 0 && (
        <p className="text-center text-gray-500 italic py-12">This user hasn't published any posts yet.</p>
      )}
    </div>
  );
}
