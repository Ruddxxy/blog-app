'use client'

import { deletePost } from '@/app/actions/posts'
import { toast } from 'sonner'
import { useTransition } from 'react'

export default function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.')
    if (!confirmed) return

    const formData = new FormData()
    formData.append('postId', postId)

    startTransition(async () => {
      const result = await deletePost(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Post deleted successfully')
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
