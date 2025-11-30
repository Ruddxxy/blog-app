'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// OWASP: Input Validation Schemas
const emailSchema = z.string().email().toLowerCase().trim()
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export async function login(formData: FormData) {
    const supabase = await createClient()

    const emailInput = formData.get('email') as string
    const passwordInput = formData.get('password') as string

    // Validate inputs
    const emailResult = emailSchema.safeParse(emailInput)
    if (!emailResult.success) return { error: 'Invalid email address' }

    const { error } = await supabase.auth.signInWithPassword({
        email: emailResult.data,
        password: passwordInput,
    })

    if (error) {
        console.error('Login Action Error:', error)
        return { error: 'Invalid login credentials' } // OWASP: Generic error message
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard?login=success')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const emailInput = formData.get('email') as string
    const passwordInput = formData.get('password') as string

    // Validate inputs
    const emailResult = emailSchema.safeParse(emailInput)
    const passwordResult = passwordSchema.safeParse(passwordInput)

    if (!emailResult.success) return { error: 'Invalid email address' }
    if (!passwordResult.success) return { error: passwordResult.error.issues[0].message }

    const { error } = await supabase.auth.signUp({
        email: emailResult.data,
        password: passwordInput,
        options: {
            // We want to verify the email via OTP, not a link
            // Supabase sends a link by default, but we can verify the token from it as an OTP
            // or configure the template to send a code.
            // For this flow, we assume the user will receive a code.
        }
    })

    if (error) {
        console.error('Signup Action Error:', error)
        return { error: error.message }
    }

    // Do NOT redirect. Return success to trigger OTP step on client.
    return { success: true, action: 'verify' }
}

export async function verifyOtp(email: string, token: string, type: 'signup' | 'email' = 'signup') {
    const supabase = await createClient()

    // Validate email
    const emailResult = emailSchema.safeParse(email)
    if (!emailResult.success) return { error: 'Invalid email address' }

    const { error } = await supabase.auth.verifyOtp({
        email: emailResult.data,
        token,
        type: type === 'signup' ? 'signup' : 'email',
    })

    if (error) {
        console.error('Verify OTP Error:', error)
        return { error: 'Invalid verification code' }
    }

    // Check role for redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'admin') {
            revalidatePath('/', 'layout')
            redirect('/admin')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard?login=success')
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard?login=success`,
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
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard?login=success`,
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
