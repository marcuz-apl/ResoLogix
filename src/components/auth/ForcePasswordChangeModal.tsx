'use client';

import React, { useState } from 'react';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ForcePasswordChangeModal() {
  const { data: session, update } = useSession();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const needsPasswordChange = session?.user && (session.user as any).needsPasswordChange;

  if (!needsPasswordChange) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      
      setSuccess(true);
      // Update session to remove the needsPasswordChange flag
      await update({ needsPasswordChange: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-card/80 backdrop-blur-xl border border-card-border rounded-3xl shadow-2xl overflow-hidden flex flex-col p-8">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            {success ? 'Password Updated' : 'Security Required'}
          </h2>
          <p className="text-sm font-bold text-text-secondary mt-2">
            {success ? 'You can now use ResoLogix™ securely.' : 'Please choose a permanent password for your account to continue.'}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="p-3 bg-rose-950/30 border border-rose-500/50 text-rose-400 text-xs font-bold rounded-xl text-center">{error}</div>}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="Re-type password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <div className="flex justify-center">
             {/* Note: since needsPasswordChange flag drops, the modal unmounts usually. But this success screen is nice. */}
          </div>
        )}

      </div>
    </div>
  );
}
