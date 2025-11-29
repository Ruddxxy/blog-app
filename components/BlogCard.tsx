import Link from 'next/link';
import { Post } from '@/types';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: Post;
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'block border-brutal p-6 h-full hover-inverse group',
        className
      )}
    >
      <article className="flex flex-col h-full justify-between">
        <div>
          {post.cover_image_url && (
            <div className="mb-6 border-b border-black pb-6 -mx-6 px-6">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-48 object-cover border border-black grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold tracking-tight mb-4 group-hover:text-white">
            {post.title}
          </h2>
          <p className="text-sm line-clamp-3 mb-6 group-hover:text-white">
            {post.excerpt}
          </p>
        </div>
        <div className="text-xs uppercase tracking-widest border-t border-black pt-4 group-hover:border-white group-hover:text-white">
          {new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </article>
    </Link>
  );
}
