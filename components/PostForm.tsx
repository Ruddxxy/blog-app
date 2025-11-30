'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { toast } from 'sonner';

interface PostFormProps {
  post?: Post;
}

export function PostForm({ post }: PostFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [isPublished, setIsPublished] = useState(post?.is_published || false);
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
      setCoverImageUrl(data.publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const postData = {
      title,
      slug,
      excerpt,
      content,
      cover_image_url: coverImageUrl,
      is_published: isPublished,
    };

    try {
      if (post?.id) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);
        if (error) throw error;
      }
      router.push('/dashboard');
      router.refresh();
      toast.success('Post saved successfully!');
    } catch (error: any) {
      toast.error('Error saving post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-brutal p-3 focus:bg-black focus:text-white transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border-brutal p-3 focus:bg-black focus:text-white transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full border-brutal p-3 h-24 focus:bg-black focus:text-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Content (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border-brutal p-3 h-64 font-mono text-sm focus:bg-black focus:text-white transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-widest mb-2">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="w-full border-brutal p-3 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-gray-800"
        />
        {uploading && <p className="text-sm mt-2">Uploading...</p>}
        {coverImageUrl && (
          <div className="mt-4 border border-black p-2">
            <img src={coverImageUrl} alt="Cover preview" className="max-h-40 object-cover" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-5 h-5 border-black rounded-none text-black focus:ring-0"
        />
        <label htmlFor="isPublished" className="text-sm font-bold uppercase tracking-widest">
          Publish Immediately
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Post'}
      </button>
    </form>
  );
}
