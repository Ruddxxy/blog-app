import { z } from 'zod'

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_KEY: z.string().min(1).optional(),
})

// Validate environment variables at runtime
const env = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
})

if (!env.success) {
    console.error('❌ Invalid environment variables:', env.error.format())
    // Don't throw here, allow hardcoded fallback
}

// Hardcoded URL from user request
const HARDCODED_URL = 'https://ggsoqxkrrscpjecvoqln.supabase.co'

export const config = {
    supabase: {
        url: HARDCODED_URL,
        // Prefer SUPABASE_KEY, fallback to NEXT_PUBLIC_SUPABASE_ANON_KEY, then dummy for build
        anonKey: process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build',
    },
}
