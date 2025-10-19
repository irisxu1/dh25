import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

type Props = { onClose: () => void };

export default function LoginModal({ onClose }: Props) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');  // collected here
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign up with email+password (stores username in user_metadata)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }, // saved into user.user_metadata.username
        },
      });
      if (error) throw error;

      // If your project doesn’t require email confirmation, user may be available immediately.
      // We still rely on App.tsx listener to do the DB upsert reliably for all flows.
      alert('Check your email if confirmation is required. You can close this window.');
      onClose();
    } catch (err: any) {
      alert(err?.message ?? 'Sign up error');
    } finally {
      setLoading(false);
    }
  };

  // Magic link (no password). Username will be read from a later profile form or updated after sign-in.
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Magic link sent — check your email to sign in.');
      onClose();
    } catch (err: any) {
      alert(err?.message ?? 'Error sending magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Sign up / Log in</h2>

        <form className="space-y-3" onSubmit={handleSignUp}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="username (for profile)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="password"
            placeholder="password (for password signup)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-yellow-500 px-4 py-2 font-semibold text-white hover:from-pink-600 hover:to-yellow-600"
            >
              Sign up
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleMagicLink}
              className="rounded-xl border px-4 py-2"
            >
              Send magic link
            </button>
          </div>

          <div className="pt-2 text-right">
            <button type="button" onClick={onClose} className="text-sm text-gray-500">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
