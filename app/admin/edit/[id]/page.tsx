import { PostForm } from '@/components/PostForm';
import { createClient } from '@/lib/supabase/server';
import { Post } from '@/types';
import { notFound } from 'next/navigation';

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-black p-8">
        <h1 className="text-4xl font-bold tracking-tighter">Edit Entry</h1>
      </header>
      <div className="p-8">
        <PostForm post={post as Post} />
      </div>
    </div>
  );
}
