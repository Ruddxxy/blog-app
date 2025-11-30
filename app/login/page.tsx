'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login, signup, signInWithOtp, verifyOtp } from './actions';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      if (mode === 'otp') {
        if (!otpSent) {
          const result = await signInWithOtp(email);
          if (result?.error) {
            toast.error(result.error);
          } else {
            setOtpSent(true);
            toast.success('OTP sent to your email!');
          }
        } else {
          const result = await verifyOtp(email, otp);
          if (result?.error) {
            toast.error(result.error);
          }
        }
      } else {
        const action = mode === 'login' ? login : signup;
        const result = await action(formData);
        if (result?.error) {
          toast.error(result.error);
        }
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md border-brutal p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">
          {mode === 'login' && 'Login'}
          {mode === 'signup' && 'Sign Up'}
          {mode === 'otp' && 'Login with OTP'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
          
          {mode !== 'otp' && (
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
                minLength={6}
              />
            </div>
          )}

          {mode === 'otp' && otpSent && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border-brutal p-3 focus:outline-none focus:bg-black focus:text-white transition-colors"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              mode === 'otp' 
                ? (otpSent ? 'Verify OTP' : 'Send OTP') 
                : (mode === 'login' ? 'Login' : 'Sign Up')
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm font-bold uppercase tracking-widest">
          {mode !== 'login' && (
            <button onClick={() => { setMode('login'); setOtpSent(false); }} className="hover:underline">
              Back to Login
            </button>
          )}
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('signup')} className="hover:underline">
                Create Account
              </button>
              <button onClick={() => setMode('otp')} className="hover:underline text-gray-600">
                Login with OTP (Passwordless)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
