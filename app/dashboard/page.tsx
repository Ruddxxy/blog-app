import { getDashboardStats } from '@/app/actions/social';
import { updateProfile } from '@/app/actions/profile';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile for username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single();

  const stats = await getDashboardStats();

  if (!stats) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
      <header className="mb-12 border-b border-black pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="flex items-end gap-6">
          {/* Avatar Upload */}
          <div className="relative group w-24 h-24 border border-black bg-gray-100 flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
                {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
            )}
            <form action={async (formData) => {
              'use server';
              const file = formData.get('avatar') as File;
              if (!file || file.size === 0) return;
              
              // Strict Validation
              if (!file.type.startsWith('image/')) {
                // In a real app we'd return an error state, here we rely on client-side check mostly
                // but server-side check is crucial.
                return; 
              }
              if (file.size > 2 * 1024 * 1024) { // 2MB
                return;
              }

              const supabase = await createClient();
              const fileExt = file.name.split('.').pop();
              // Sanitize filename
              const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
              
              const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

              if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
              }
            }} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 flex items-center justify-center cursor-pointer">
              <input 
                type="file" 
                name="avatar" 
                accept="image/*" 
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!file.type.startsWith('image/')) {
                      alert('Please upload an image file.');
                      e.target.value = '';
                      return;
                    }
                    if (file.size > 2 * 1024 * 1024) {
                      alert('File size must be less than 2MB.');
                      e.target.value = '';
                      return;
                    }
                    e.target.form?.requestSubmit();
                  }
                }}
              />
              <span className="text-white text-xs font-bold uppercase">Upload</span>
            </form>
          </div>

          <div>
            <h1 className="text-5xl font-bold tracking-tighter mb-4">Dashboard</h1>
            <div className="flex gap-4 items-center">
              <p className="text-xl text-gray-600">
                Welcome back, <span className="font-bold text-black">{profile?.username || user.email}</span>
              </p>
              <Link 
                href={`/user/${user.id}`}
                className="text-xs font-bold uppercase tracking-widest border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
              >
                View Public Profile
              </Link>
            </div>
          </div>
        </div>
        
        {/* Username Update Form */}
        <form action={async (formData) => {
          'use server';
          await updateProfile(formData);
        }} className="flex gap-2 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">
              Set Username
            </label>
            <input 
              name="username" 
              defaultValue={profile?.username || ''}
              placeholder="username"
              className="border-brutal p-2 text-sm w-40"
              minLength={3}
            />
          </div>
          <button type="submit" className="bg-black text-white px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-800">
            Save
          </button>
        </form>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="border-brutal p-6 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-2 text-gray-500">Total Posts</h3>
          <p className="text-4xl font-bold">{stats.posts.length}</p>
        </div>
        <div className="border-brutal p-6 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-2 text-gray-500">Total Likes</h3>
          <p className="text-4xl font-bold">{stats.totalLikes}</p>
        </div>
        <div className="border-brutal p-6 bg-white">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-2 text-gray-500">Total Comments</h3>
          <p className="text-4xl font-bold">{stats.totalComments}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Lists Column */}
        <div className="space-y-12">
          {/* Followers */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6 border-b border-black pb-2">
              Followers ({stats.followersCount})
            </h2>
            {stats.followersList.length === 0 ? (
              <p className="text-gray-500 italic">No followers yet.</p>
            ) : (
              <ul className="space-y-4">
                {stats.followersList.map((f: any) => (
                  <li key={f.follower_id} className="border-brutal p-4 flex justify-between items-center">
                    <span className="font-mono text-sm">{f.follower_id}</span>
                    {/* Link to public profile would go here */}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Following */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6 border-b border-black pb-2">
              Following ({stats.followingCount})
            </h2>
            {stats.followingList.length === 0 ? (
              <p className="text-gray-500 italic">Not following anyone.</p>
            ) : (
              <ul className="space-y-4">
                {stats.followingList.map((f: any) => (
                  <li key={f.following_id} className="border-brutal p-4 flex justify-between items-center">
                    <span className="font-mono text-sm">{f.following_id}</span>
                    <Link href={`/user/${f.following_id}`} className="text-xs font-bold uppercase hover:underline">
                      View Profile
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* My Posts Column */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6 border-b border-black pb-2">
            My Posts
          </h2>
          {stats.posts.length === 0 ? (
            <div className="text-center py-12 border-brutal border-dashed">
              <p className="mb-4">You haven't written any posts yet.</p>
              {/* Only show create button if we allow users to create, currently only admins */}
            </div>
          ) : (
            <div className="space-y-6">
              {stats.posts.map((post: any) => (
                <article key={post.id} className="border-brutal p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <span className="text-xs font-mono text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm font-bold uppercase tracking-widest text-gray-600">
                    <span>{post.likes?.[0]?.count || 0} Likes</span>
                    <span>{post.comments?.[0]?.count || 0} Comments</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
