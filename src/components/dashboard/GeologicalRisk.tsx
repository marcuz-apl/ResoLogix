'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { type RiskFactors } from '@/lib/statistics';

export default function GeologicalRisk() {
  const {
    theme,
    rightPaneWidth,
    calculatedPg,
    riskFactors,
    handleRiskChange
  } = useDashboard();

  return (
    <section 
      className="shrink-0 glass-panel p-6 rounded-2xl flex flex-col gap-5"
      style={{ width: rightPaneWidth }}
    >
      <div className="flex items-center justify-between pb-3 border-b border-card-border">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary truncate">Geological Risk</h2>
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
          theme === 'dark'
            ? 'bg-emerald-950/35 border-emerald-850/20 text-emerald-400'
            : 'bg-emerald-100 border-emerald-300 text-emerald-800'
        }`}>
          Chance: {(calculatedPg * 100).toFixed(1)}%
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {(Object.keys(riskFactors) as Array<keyof RiskFactors>).map((key) => {
          const factorVal = riskFactors[key];
          const labelMap: Record<keyof RiskFactors, string> = {
            source: 'Source Rock / Charge',
            migration: 'Timing & Migration',
            reservoir: 'Reservoir Quality',
            closure: 'Trap Closure / Geometry',
            containment: 'Seal / Containment'
          };

          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-primary truncate">{labelMap[key]}</span>
                <span className={`font-black px-1.5 py-0.5 rounded text-[11px] shrink-0 border ${
                  theme === 'dark'
                    ? 'bg-emerald-950/20 border-emerald-850/15 text-emerald-400'
                    : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}>
                  {(factorVal * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={factorVal}
                  onChange={(e) => handleRiskChange(key, Number(e.target.value))}
                  className="flex-1 h-1.5 bg-panel rounded-lg appearance-none cursor-pointer focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Informational banner about Pg calculation */}
      <div className="mt-2 text-[10px] text-text-muted bg-panel p-3 rounded-xl border border-card-border/50 leading-relaxed">
        <p className="font-bold text-text-secondary mb-1">Methodology:</p>
        Geological Chance of Success ($P_g$) is the product of these 5 independent geological variables:
        <div className="font-mono text-emerald-500/95 mt-1 select-all font-bold">
          Pg = S × M × R × C × ST
        </div>
      </div>
    </section>
  );
}
