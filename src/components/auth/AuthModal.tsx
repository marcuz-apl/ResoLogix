'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useDashboard } from '../dashboard/DashboardContext';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal } = useDashboard();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const res = await signIn('credentials', {
          redirect: false,
          email,
          password
        });
        if (res?.error) {
          setError('Invalid email or password');
        } else {
          setShowAuthModal(false);
        }
      } else if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register');
        setSuccess(data.message);
        setTimeout(() => setMode('login'), 3000);
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to request reset');
        setSuccess(data.message);
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-card/80 backdrop-blur-xl border border-card-border rounded-3xl shadow-2xl overflow-hidden flex flex-col p-8">
        
        <button 
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary bg-background/50 hover:bg-background rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-sm font-bold text-text-secondary mt-2">
            {mode === 'login' ? 'Sign in to save your evaluations' : mode === 'register' ? 'Get a temporary password via email' : 'We will email you a new temporary password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {error && <div className="p-3 bg-rose-950/30 border border-rose-500/50 text-rose-400 text-xs font-bold rounded-xl text-center">{error}</div>}
          {success && <div className="p-3 bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-xl text-center">{success}</div>}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-card-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Send Password' : 'Reset Password'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-2 text-center text-xs font-bold text-text-secondary">
          {mode === 'login' ? (
            <>
              <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} className="hover:text-cyan-400 transition-colors">Forgot password?</button>
              <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className="hover:text-cyan-400 transition-colors">Not registered? Sign up now</button>
            </>
          ) : (
            <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="hover:text-cyan-400 transition-colors">Back to Login</button>
          )}
        </div>

      </div>
    </div>
  );
}
