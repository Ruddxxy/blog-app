'use client'

import { useState, useTransition } from 'react'
import { toggleLike, addComment, deleteComment } from '@/app/actions/social'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SocialProps {
  postId: string
  initialLikes: number
  initialComments: any[]
  userId?: string
  userRole?: string
  isLiked: boolean
}

export function Social({ postId, initialLikes, initialComments, userId, userRole, isLiked }: SocialProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(isLiked)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLike = async () => {
    if (!userId) {
      toast.error("Please login to like posts")
      return
    }

    // Optimistic update
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)

    const result = await toggleLike(postId)
    if (result?.error) {
      // Revert on error
      setLiked(!liked)
      setLikes(liked ? likes - 1 : likes + 1)
      toast.error(result.error)
    }
  }

  const handleComment = async (formData: FormData) => {
    if (!userId) {
      toast.error("Please login to comment")
      return
    }

    const content = formData.get('content') as string
    if (!content) return

    startTransition(async () => {
      const result = await addComment(postId, content)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Comment added")
        // Reset form
        const form = document.getElementById('comment-form') as HTMLFormElement
        form.reset()
      }
    })
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure?")) return

    startTransition(async () => {
      const result = await deleteComment(commentId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Comment deleted")
      }
    })
  }

  return (
    <div className="mt-12 border-t border-black pt-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 border border-black font-bold uppercase tracking-widest transition-all ${
            liked ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
          }`}
        >
          <span>{liked ? 'Liked' : 'Like'}</span>
          <span>({likes})</span>
        </button>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold uppercase tracking-tight">Comments ({initialComments.length})</h3>
        
        {userId && (
          <form id="comment-form" action={handleComment} className="space-y-4">
            <input type="hidden" name="postId" value={postId} />
            <textarea
              name="content"
              placeholder="Write a comment..."
              className="w-full border-brutal p-4 h-32 focus:bg-black focus:text-white transition-colors"
              required
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
            >
              {isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        <div className="space-y-6">
          {initialComments.map((comment) => (
            <div key={comment.id} className="border-brutal p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-bold uppercase tracking-widest text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
                {(userId === comment.user_id || userRole === 'admin') && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-bold uppercase tracking-widest"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
          
          {initialComments.length === 0 && (
            <p className="text-gray-500 italic">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
