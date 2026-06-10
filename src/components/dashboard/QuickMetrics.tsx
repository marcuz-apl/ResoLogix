'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';

export default function QuickMetrics() {
  const { fluidType, simResults, includeSecondary, formatVolume } = useDashboard();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Card 1: Primary Mean In-Place */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-cyan-500">
        <div className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">
          Unrisked Mean {fluidType === 'OIL' ? 'OOIP' : 'OGIP'}
        </div>
        <div className="text-xl font-black text-text-primary">
          {simResults ? formatVolume(simResults.inPlaceStats.mean) : '—'} <span className="text-[10px] text-text-muted font-bold">{fluidType === 'OIL' ? 'MMSTB' : 'BCF'}</span>
        </div>
        <span className="text-[10px] text-text-muted mt-1">Based on volumetric simulation</span>
      </div>

      {/* Card 2: Primary Mean Recoverable */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-emerald-500">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Unrisked Mean Recoverable {fluidType === 'OIL' ? '(Oil)' : '(Gas)'}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {simResults ? formatVolume(simResults.recoverableStats.mean) : '—'}
          </span>
          <span className="text-xs text-text-secondary font-semibold">{fluidType === 'OIL' ? 'MMSTB' : 'BCF'}</span>
        </div>
        <span className="text-[10px] text-text-muted mt-1">Primary Product Reserves</span>
      </div>

      {/* Card 3: Secondary Mean In-Place */}
      <div className={`glass-panel p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-purple-500 transition-all duration-300 ${!includeSecondary ? 'opacity-50' : ''}`}>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Unrisked Mean {fluidType === 'OIL' ? 'Solution Gas In-Place' : 'Condensate In-Place'}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {simResults && includeSecondary && simResults.secInPlaceStats 
              ? formatVolume(simResults.secInPlaceStats.mean, 'secondary') 
              : '—'}
          </span>
          <span className="text-xs text-text-secondary font-semibold">{fluidType === 'OIL' ? 'BCF' : 'MMSTB'}</span>
        </div>
        <span className="text-[10px] text-text-muted mt-1">
          {!includeSecondary ? 'Secondary Product Disabled' : 'Secondary Product'}
        </span>
      </div>

      {/* Card 4: Secondary Mean Recoverable */}
      <div className={`glass-panel p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-pink-500 transition-all duration-300 ${!includeSecondary ? 'opacity-50' : ''}`}>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          Unrisked Mean Rec. {fluidType === 'OIL' ? 'Solution Gas' : 'Condensate'}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-pink-500 dark:text-pink-400">
            {simResults && includeSecondary && simResults.secRecoverableStats 
              ? formatVolume(simResults.secRecoverableStats.mean, 'secondary') 
              : '—'}
          </span>
          <span className="text-xs text-text-secondary font-semibold">{fluidType === 'OIL' ? 'BCF' : 'MMSTB'}</span>
        </div>
        <span className="text-[10px] text-text-muted mt-1">
          {!includeSecondary ? 'Secondary Product Disabled' : 'Associated Secondary Reserves'}
        </span>
      </div>
    </div>
  );
}
