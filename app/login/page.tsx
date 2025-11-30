'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login, signup, verifyOtp, signInWithGoogle, signInWithGithub } from './actions';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Password Strength Logic
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      if (mode === 'otp') {
        const result = await verifyOtp(email, otp, 'signup');
        if (result?.error) {
          toast.error(result.error);
        }
      } else if (mode === 'signup') {
        const result = await signup(formData);
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.success && result?.action === 'verify') {
          setMode('otp');
          toast.success('Verification code sent to your email!');
        }
      } else {
        // Login
        const result = await login(formData);
        if (result?.error) {
          toast.error(result.error);
        }
      }
    } catch (err: any) {
      console.error('Submit Error:', err);
      toast.error(err.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const action = provider === 'google' ? signInWithGoogle : signInWithGithub;
      const result = await action();
      
      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md border-brutal p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black tracking-tighter mb-8 text-center uppercase">
          {mode === 'login' && 'Enter Archive'}
          {mode === 'signup' && 'Join Archive'}
          {mode === 'otp' && 'Verify Account'}
        </h1>
        
        {mode !== 'otp' && (
          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-brutal p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 font-bold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            
            <button
              onClick={() => handleOAuth('github')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-brutal p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 font-bold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>
        )}

        {mode !== 'otp' && (
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-white px-2 text-gray-500">Or using email</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode !== 'otp' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-brutal p-3 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono text-sm"
                required
                placeholder="user@example.com"
              />
            </div>
          )}
          
          {mode !== 'otp' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-brutal p-3 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono text-sm"
                minLength={8}
                placeholder="••••••••"
              />
              {mode === 'signup' && (
                <div className="mt-2 flex gap-1 h-1">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 transition-colors ${i < passwordStrength ? 'bg-black' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              )}
              {mode === 'signup' && (
                <p className="text-[10px] text-gray-500 mt-1">
                  Must contain 8+ chars, uppercase, lowercase, number, and special char.
                </p>
              )}
            </div>
          )}

          {mode === 'otp' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border-brutal p-3 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono text-sm"
                required
                placeholder="123456"
              />
              <p className="text-xs text-gray-500 mt-2">
                We sent a code to <strong>{email}</strong>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-white hover:text-black border-brutal transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (
              mode === 'otp' 
                ? 'Verify Account' 
                : (mode === 'login' ? 'Enter Archive' : 'Create Account')
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-center text-xs font-bold uppercase tracking-widest">
          {mode !== 'login' && (
            <button onClick={() => { setMode('login'); setOtp(''); }} className="hover:underline">
              ← Back to Login
            </button>
          )}
          {mode === 'login' && (
            <button onClick={() => setMode('signup')} className="hover:underline">
              New here? Create Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
