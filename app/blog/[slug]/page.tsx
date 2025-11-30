import { createClient } from "@/lib/supabase/server";
import { Post } from "@/types";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Social } from "@/components/Social";
import Link from "next/link";
import Image from "next/image";
import DeletePostButton from "@/components/DeletePostButton";

export const revalidate = 60;

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const [postResult, userResult] = await Promise.all([
    supabase
      .from("posts")
      .select(`
        *,
        likes (user_id),
        comments (
          id,
          content,
          created_at,
          user_id
        )
      `)
      .eq("slug", slug)
      .order('created_at', { foreignTable: 'comments', ascending: false })
      .single(),
    supabase.auth.getUser()
  ]);

  const post = postResult.data;
  const user = userResult.data.user;
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  if (!post) {
    notFound();
  }

  const postData = post as Post;

  return (
    <article className="flex-1 flex flex-col">
      <header className="border-b border-black p-12 md:p-24 text-center">
        {postData.cover_image_url && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative w-full h-[400px]">
              <Image
                src={postData.cover_image_url}
                alt={postData.title}
                fill
                className="object-cover border border-black grayscale hover:grayscale-0 transition-all duration-500"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
          {postData.title}
        </h1>
        <div className="text-sm uppercase tracking-widest mb-6">
          {new Date(postData.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        {(user?.id === postData.user_id || profile?.role === 'admin') && (
          <div className="flex justify-center gap-4">
            <Link 
              href={`/admin/edit/${postData.id}`}
              className="text-sm font-bold uppercase tracking-widest hover:underline"
            >
              Edit
            </Link>
            <DeletePostButton postId={postData.id} />
          </div>
        )}
      </header>

      <div className="max-w-3xl mx-auto w-full p-8 md:p-12 border-x border-black min-h-[50vh]">
        <div className="prose prose-neutral prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:underline hover:prose-a:text-black">
          <ReactMarkdown>{postData.content}</ReactMarkdown>
        </div>

        <Social 
          postId={postData.id}
          initialLikes={postData.likes?.length || 0}
          initialComments={postData.comments || []}
          userId={user?.id}
          userRole={profile?.role}
          isLiked={postData.likes?.some((like: any) => like.user_id === user?.id) || false}
        />
      </div>
    </article>
  );
}
