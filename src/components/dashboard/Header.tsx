'use client';

import React from 'react';
import Link from 'next/link';
import { Sun, Moon, BookOpen, Info, X, Wrench, User, LogOut, ShieldAlert, TrendingDown, Dices, Activity } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from '../auth/AuthModal';
import ForcePasswordChangeModal from '../auth/ForcePasswordChangeModal';
import UserProfileModal from '../auth/UserProfileModal';
import pkg from '../../../package.json';

export default function Header() {
  const { toggleTheme, theme, setShowAuthModal } = useDashboard();
  const [showToast, setShowToast] = React.useState(false);
  const { data: session } = useSession();
  const [showAbout, setShowAbout] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);

  const handleEngineClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Close dropdown if clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <header className="h-16 shrink-0 border-b border-card-border bg-card px-6 flex items-center justify-between z-30">
        
        {/* Left Side: Engine Selection */}
        <div className="flex items-center gap-4">
          <div className="flex bg-background border border-card-border rounded-xl p-0.5 text-xs font-semibold shrink-0">
            <button
              onClick={handleEngineClick}
              className={`py-1.5 px-3.5 rounded-lg font-bold shadow border cursor-pointer flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-cyan-900/35 border-cyan-800/40 text-cyan-400'
                  : 'bg-cyan-100 border-cyan-300 text-cyan-800'
              }`}
            >
              <Dices className="w-3.5 h-3.5" />
              Monte Carlo Sim
            </button>
            <Link
              href="/dca"
              className="py-1.5 px-3.5 rounded-lg text-text-secondary hover:text-text-primary cursor-pointer flex items-center justify-center gap-1.5"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              DCA
            </Link>
          </div>
          
          {/* Tools Page Link */}
          <Link
            href="/tools"
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-card border border-card-border text-text-secondary hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all duration-200 text-xs font-bold cursor-pointer shrink-0"
          >
            <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Tools</span>
          </Link>
        </div>

        {/* Center Side: Logo, App Name & Version */}
        <div className="flex items-center gap-3 justify-center">
          <img src="/logo.png" alt="ResoLogix Logo" className="w-8 h-8 rounded-lg shadow shadow-cyan-500/20 object-contain animate-pulse" />
          <div className="flex flex-col justify-center select-none text-left">
            <span className="font-extrabold text-[22px] leading-none tracking-[0.025em] text-text-primary">
              ResoLogix&trade;
            </span>
            <span className="text-[9px] text-text-primary font-bold uppercase tracking-wider mt-0.5">
              Resource Evaluation
            </span>
          </div>
          <span className="text-[9px] bg-card-border/50 text-text-primary px-2 py-0.5 rounded-md font-mono shrink-0 select-none ml-1">
            v{pkg.version}
          </span>
        </div>

        {/* Right Side: Docs, About & Theme Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Auth Button */}
          {session ? (
            <div className="flex items-center gap-2 relative profile-dropdown-container">
              {(session.user as any).isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-200 text-xs font-bold cursor-pointer shrink-0"
                  title="Admin Dashboard"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}
              
              {/* Profile Avatar Button */}
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center justify-center h-8 px-3 rounded-full bg-cyan-900/30 border border-cyan-800/50 text-cyan-400 hover:bg-cyan-800/40 transition-colors gap-1.5"
                title="User Profile"
              >
                <User className="w-3.5 h-3.5" />
                <span className="text-xs font-bold truncate max-w-[100px]">
                  {((session.user as any)?.name || session.user?.email?.split('@')[0] || 'User')}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute top-10 right-0 w-64 bg-card border border-card-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-card-border/50">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {(session.user as any)?.name}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5">{session.user?.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        (session.user as any)?.isSuperAdmin ? 'bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-500/30' :
                        (session.user as any)?.isAdmin ? 'bg-purple-900/40 text-purple-400 border border-purple-500/30' : 
                        'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        Role: {(session.user as any)?.isSuperAdmin ? 'SuperAdmin' : (session.user as any)?.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </div>
                    {(session.user as any)?.lastLogin && (
                      <p className="text-[10px] text-text-muted mt-2">
                        Last Login:<br/>{new Date((session.user as any).lastLogin).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="px-2 pt-2 flex flex-col gap-1">
                    <button
                      onClick={() => { setShowProfileDropdown(false); setShowProfileModal(true); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-text-secondary hover:text-cyan-400 hover:bg-cyan-950/20 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> User Profile
                    </button>
                    <button
                      onClick={() => signOut({ redirect: false })}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-text-secondary hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-card border border-card-border text-text-secondary hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-950/10 transition-all duration-200 text-xs font-bold cursor-pointer shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              Log In
            </button>
          )}

          {/* Docs Page Link */}
          <Link
            href="/docs"
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-card border border-card-border text-text-secondary hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all duration-200 text-xs font-bold cursor-pointer shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Docs</span>
          </Link>

          {/* About Dialog Button */}
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-card border border-card-border text-text-secondary hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all duration-200 text-xs font-bold cursor-pointer shrink-0"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>About</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-background border border-card-border text-text-secondary hover:text-primary hover:border-card-border/80 transition-all duration-200 cursor-pointer shrink-0"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

        </div>
      </header>

      {/* Floating Toast Notification */}
      <div 
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${
          showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
        }`}
      >
        <div className="bg-cyan-950/90 border border-cyan-500/50 text-cyan-100 px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md flex items-center gap-2.5">
          <Dices className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-bold tracking-wide">Current computing engine: Monte Carlo Simulation (active)</span>
        </div>
      </div>

      {/* Render Auth Modals Here */}
      <AuthModal />
      <ForcePasswordChangeModal />
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* About Modal Dialog Box */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-card-border/70 bg-card/95 relative overflow-hidden shadow-2xl shadow-cyan-950/20 text-center flex flex-col items-center gap-4">
            
            {/* Top Right Close Icon */}
            <button
              type="button"
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary hover:bg-card-border/20 p-1.5 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none"
              title="Close dialogue"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Logo and Name */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <img src="/logo.png" alt="ResoLogix Logo" className="w-16 h-16 rounded-2xl shadow-lg shadow-cyan-500/20 object-contain animate-pulse" />
              <h2 className="text-3xl font-black tracking-tight text-text-primary mb-1">
                ResoLogix&trade;
              </h2>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Resource Evaluation Suite
              </span>
            </div>

            {/* Version Info from package.json */}
            <div className="text-xs font-semibold text-cyan-400 bg-cyan-950/35 border border-cyan-800/30 px-3 py-1 rounded-full font-mono mt-1">
              version {pkg.version}
            </div>

            {/* alfazen.org Branding & Copyright */}
            <div className="flex flex-col gap-1 text-xs text-text-secondary font-medium mt-2 mb-2">
              <p className="text-text-primary font-bold">An alfazen.org Product</p>
              <p className="text-[10px] text-text-muted mt-2 border-t border-card-border/30 pt-3 font-semibold">
                All rights reserved @2026
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
