'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const deletePostSchema = z.object({
    postId: z.string().uuid(),
})

export async function deletePost(formData: FormData) {
    const postId = formData.get('postId') as string

    const result = deletePostSchema.safeParse({ postId })
    if (!result.success) {
        return { error: "Invalid post ID" }
    }

    const supabase = await createClient()

    // RLS policies will handle permission checks (owner or admin)
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
}
