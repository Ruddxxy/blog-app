'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const followSchema = z.object({
    targetUserId: z.string().uuid(),
})

export async function followUser(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const parsed = followSchema.safeParse({ targetUserId })
    if (!parsed.success) {
        return { error: 'Invalid user ID' }
    }

    const { error } = await supabase
        .from('follows')
        .insert({
            follower_id: user.id,
            following_id: targetUserId,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/user/${targetUserId}`)
    revalidatePath('/dashboard')
}

export async function unfollowUser(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const parsed = followSchema.safeParse({ targetUserId })
    if (!parsed.success) {
        return { error: 'Invalid user ID' }
    }

    const { error } = await supabase
        .from('follows')
        .delete()
        .match({
            follower_id: user.id,
            following_id: targetUserId,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/user/${targetUserId}`)
    revalidatePath('/dashboard')
}

export async function getDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // Parallelize queries for performance
    const [posts, followers, following] = await Promise.all([
        supabase.from('posts').select('id, title, created_at').eq('user_id', user.id),
        supabase.from('follows').select('follower_id').eq('following_id', user.id),
        supabase.from('follows').select('following_id').eq('follower_id', user.id),
    ])

    // Re-fetching posts with counts to get likes/comments
    // Note: This is a bit inefficient but works for now without complex RPCs
    const { data: userPosts } = await supabase
        .from('posts')
        .select(`
      id, 
      title, 
      created_at,
      likes (count),
      comments (count)
    `)
        .eq('user_id', user.id)

    const totalLikes = userPosts?.reduce((acc, post) => acc + (post.likes?.[0]?.count || 0), 0) || 0
    const totalComments = userPosts?.reduce((acc, post) => acc + (post.comments?.[0]?.count || 0), 0) || 0

    return {
        posts: userPosts || [],
        followersCount: followers.count || followers.data?.length || 0,
        followingCount: following.count || following.data?.length || 0,
        totalLikes,
        totalComments,
        followersList: followers.data || [],
        followingList: following.data || []
    }
}

// --- Restored Actions ---

export async function toggleLike(postId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Check if already liked
    const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

    if (existingLike) {
        await supabase.from('likes').delete().eq('id', existingLike.id)
    } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
    }

    revalidatePath(`/blog/[slug]`, 'page')
}

export async function addComment(postId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: user.id, content })

    if (error) return { error: error.message }
    revalidatePath(`/blog/[slug]`, 'page')
}

export async function deleteComment(commentId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) return { error: error.message }
    revalidatePath(`/blog/[slug]`, 'page')
}
