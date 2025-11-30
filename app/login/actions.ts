'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGoogle() {
    const supabase = await createClient()

    // Determine origin with robust fallbacks
    const isDev = process.env.NODE_ENV === 'development'
    let origin = isDev ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

    // Fallback to VERCEL_URL if available and not in dev
    if (!isDev && !process.env.NEXT_PUBLIC_SITE_URL && process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`
    }

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

    // Determine origin with robust fallbacks
    const isDev = process.env.NODE_ENV === 'development'
    let origin = isDev ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

    // Fallback to VERCEL_URL if available and not in dev
    if (!isDev && !process.env.NEXT_PUBLIC_SITE_URL && process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`
    }

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
