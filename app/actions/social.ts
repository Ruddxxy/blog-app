'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const likeSchema = z.object({
    postId: z.string().uuid(),
})

const commentSchema = z.object({
    postId: z.string().uuid(),
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
})

const deleteCommentSchema = z.object({
    commentId: z.string().uuid(),
})

export async function toggleLike(postId: string) {
    const result = likeSchema.safeParse({ postId })
    if (!result.success) {
        return { error: "Invalid post ID" }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to like posts" }
    }

    // Check if already liked
    const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

    if (existingLike) {
        // Unlike
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId)

        if (error) return { error: error.message }
    } else {
        // Like
        const { error } = await supabase
            .from('likes')
            .insert({ user_id: user.id, post_id: postId })

        if (error) return { error: error.message }
    }

    revalidatePath(`/blog/[slug]`, 'page')
    return { success: true }
}

export async function addComment(formData: FormData) {
    const postId = formData.get('postId') as string
    const content = formData.get('content') as string

    const result = commentSchema.safeParse({ postId, content })
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to comment" }
    }

    const { error } = await supabase
        .from('comments')
        .insert({
            user_id: user.id,
            post_id: postId,
            content: content
        })

    if (error) return { error: error.message }

    revalidatePath(`/blog/[slug]`, 'page')
    return { success: true }
}

export async function deleteComment(commentId: string) {
    const result = deleteCommentSchema.safeParse({ commentId })
    if (!result.success) {
        return { error: "Invalid comment ID" }
    }

    const supabase = await createClient()

    // RLS policies will handle permission checks (owner or admin)
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

    if (error) return { error: error.message }

    revalidatePath(`/blog/[slug]`, 'page')
    return { success: true }
}
