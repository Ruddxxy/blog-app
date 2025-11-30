'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminLogin } from '@/app/admin/login/actions';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await adminLogin(formData);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
    // Success redirect is handled by the server action
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md border-brutal p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">
          Admin Access
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-brutal p-3 focus:outline-none focus:bg-black focus:text-white transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-brutal p-3 focus:outline-none focus:bg-black focus:text-white transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Archive'}
          </button>
        </form>
      </div>
    </div>
  );
}
