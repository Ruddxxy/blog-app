import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/login/actions';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <header className="border-b border-black p-6 flex justify-between items-center bg-white sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
        The Silent Archive
      </Link>

      <nav className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest">
        <Link href="/search" className="hover:underline flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          Search
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>
        
        {user ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              Profile
            </Link>
            <form action={signOut}>
              <button type="submit" className="hover:underline cursor-pointer">
                Logout
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
