'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, TrendingDown, Hourglass } from 'lucide-react';

export default function DcaPage() {
  return (
    <div className="min-h-screen bg-[#070a13] text-[#f8fafc] font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col justify-center items-center p-6">
      
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-[#0891b2]/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-[#4f46e5]/5 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-md w-full glass-panel p-8 rounded-2xl border border-card-border/50 bg-card/40 text-center flex flex-col items-center gap-6 shadow-2xl shadow-cyan-950/15">
        
        {/* Animated Icon */}
        <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl shadow-lg shadow-orange-500/5 animate-pulse">
          <TrendingDown className="w-10 h-10 text-orange-400" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-extrabold tracking-wide text-text-primary">
            Decline Curve Analysis
          </h1>
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <Hourglass className="w-3.5 h-3.5 animate-spin" />
            <span>Under Development</span>
          </span>
        </div>

        {/* Details list */}
        <div className="flex flex-col gap-4 text-xs text-text-secondary leading-relaxed text-left border-y border-card-border/40 py-5 w-full font-medium">
          <div className="flex items-start gap-2.5">
            <span className="text-orange-400 mt-1 select-none font-bold">•</span>
            <p>DCA (Decline Curve Analysis) is our alternative engine based on production analysis.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-orange-400 mt-1 select-none font-bold">•</span>
            <p>The DCA based computing engine is in development phase.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-orange-400 mt-1 select-none font-bold">•</span>
            <p>Visit us frequently for more details and opportunities.</p>
          </div>
        </div>

        {/* Back Link */}
        <Link 
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-card-border text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

      </div>

    </div>
  );
}
