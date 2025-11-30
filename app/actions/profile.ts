'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric'),
})

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const username = formData.get('username') as string
    const parsed = profileSchema.safeParse({ username })

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id)

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { error: 'Username already taken' }
        }
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
