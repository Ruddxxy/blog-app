import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const redirectUrl = `${origin}${next}`
            return NextResponse.redirect(redirectUrl)
        } else {
            console.error('Auth Error:', error)
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No+code+provided`)
}
