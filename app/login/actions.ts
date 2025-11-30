'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGoogle() {
    const supabase = await createClient()

    // Determine origin dynamically from headers
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const origin = `${protocol}://${host}`

    console.log('OAuth Origin:', origin)

    const next = encodeURIComponent('/dashboard?login=success')
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback?next=${next}`,
        },
    })

    if (data.url) {
        redirect(data.url)
    }

    if (error) {
        console.error('Google OAuth Error:', error)
        return { error: error.message }
    }
}

export async function signInWithGithub() {
    const supabase = await createClient()

    // Determine origin dynamically from headers
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const origin = `${protocol}://${host}`

    console.log('OAuth Origin:', origin)

    const next = encodeURIComponent('/dashboard?login=success')
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${origin}/auth/callback?next=${next}`,
        },
    })

    if (data.url) {
        redirect(data.url)
    }

    if (error) {
        console.error('Github OAuth Error:', error)
        return { error: error.message }
    }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
