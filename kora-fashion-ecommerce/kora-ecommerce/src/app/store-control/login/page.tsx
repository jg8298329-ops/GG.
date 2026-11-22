'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !data.user) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Verify user is an active admin
      const verifyRes = await fetch('/api/admin/verify');
      if (!verifyRes.ok) {
        await supabase.auth.signOut();
        setError('This account is not authorized for store administration.');
        setLoading(false);
        return;
      }

      router.push('/store-control');
      router.refresh();
    } catch {
      setError('Unable to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-alabaster border border-hairline p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto bg-charcoal text-alabaster rounded-full flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="font-serif text-3xl">Store Control</h1>
          <p className="text-xs text-taupe">
            Authorized administrator access only.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-crimson/10 border border-crimson text-crimson text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-1.5">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourdomain.com"
              className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-charcoal text-alabaster text-xs uppercase tracking-editorial hover:bg-charcoal/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/store-control/reset-password"
            className="text-xs text-taupe hover:text-charcoal underline underline-offset-4"
          >
            Forgot or reset password?
          </Link>
        </div>
      </div>
    </div>
  );
}
