import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full border-brutal p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Authentication Error</h1>
        <p className="mb-8 text-gray-600">
          {error || 'There was an error signing you in. The link may have expired or is invalid.'}
        </p>
        <Link 
          href="/login"
          className="inline-block bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
