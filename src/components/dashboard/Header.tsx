'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Sun, Moon, BookOpen, Info, X } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import pkg from '../../../package.json';

export default function Header() {
  const { toggleTheme, theme } = useDashboard();
  const [showAbout, setShowAbout] = React.useState(false);

  return (
    <>
      <header className="h-16 shrink-0 border-b border-card-border bg-card px-6 flex items-center justify-between z-30">
        
        {/* Left Side: Engine Selection */}
        <div className="flex items-center gap-4">
          <div className="flex bg-background border border-card-border rounded-xl p-0.5 text-xs font-semibold shrink-0">
            <button
              onClick={() => alert("Current computing engine: Monte Carlo Simulation (active).")}
              className={`py-1.5 px-3.5 rounded-lg font-bold shadow border cursor-pointer ${
                theme === 'dark'
                  ? 'bg-cyan-900/35 border-cyan-800/40 text-cyan-400'
                  : 'bg-cyan-100 border-cyan-300 text-cyan-800'
              }`}
            >
              Monte Carlo Sim
            </button>
            <Link
              href="/dca"
              className="py-1.5 px-3.5 rounded-lg text-text-secondary hover:text-text-primary cursor-pointer flex items-center justify-center"
            >
              DCA
            </Link>
          </div>
        </div>

        {/* Center Side: Logo, App Name & Version */}
        <div className="flex items-center gap-3 justify-center">
          <img src="/logo.png" alt="ResoLogix Logo" className="w-8 h-8 rounded-lg shadow shadow-cyan-500/20 object-contain animate-pulse" />
          <div className="flex flex-col justify-center select-none text-left">
            <span className="font-extrabold text-[19px] leading-none tracking-[0.025em] text-text-primary">
              ResoLogix
            </span>
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
              Reserve Evaluation
            </span>
          </div>
          <span className="text-[9px] bg-card-border/50 text-text-muted px-2 py-0.5 rounded-md font-mono shrink-0 select-none ml-1">
            v{pkg.version}
          </span>
        </div>

        {/* Right Side: Docs, About & Theme Toggle */}
        <div className="flex items-center gap-3">
          
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
              <h3 className="font-extrabold text-xl tracking-wide text-text-primary mt-1">
                ResoLogix
              </h3>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Reserve Evaluation Suite
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
