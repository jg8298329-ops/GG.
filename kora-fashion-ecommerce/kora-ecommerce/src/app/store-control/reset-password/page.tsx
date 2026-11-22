'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/store-control/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );
      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('If this email is registered, a password reset link has been sent.');
      }
    } catch {
      setError('Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Password updated successfully. You may now sign in.');
      }
    } catch {
      setError('Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-alabaster border border-hairline p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl">Password Reset</h1>
          <p className="text-xs text-taupe">
            {isRecoverySession
              ? 'Enter your new administrator password.'
              : 'Enter your administrator email to receive a reset link.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-crimson/10 border border-crimson text-crimson text-xs">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-600 text-emerald-800 text-xs">
            {message}
          </div>
        )}

        {isRecoverySession ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-editorial text-taupe mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full border border-hairline bg-alabaster px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-charcoal text-alabaster text-xs uppercase tracking-editorial"
            >
              {loading ? 'Updating...' : 'Save New Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-charcoal text-alabaster text-xs uppercase tracking-editorial"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link
            href="/store-control/login"
            className="text-xs text-taupe hover:text-charcoal underline underline-offset-4"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
