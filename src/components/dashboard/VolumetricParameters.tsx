'use client';

import React from 'react';
import { Layers, AlertTriangle } from 'lucide-react';
import { useDashboard, DEFAULT_PARAMS } from './DashboardContext';
import { type SimulationParams } from '@/lib/statistics';

export default function VolumetricParameters() {
  const {
    fluidType,
    parameters,
    handleParamChange,
    includeSecondary,
    handleToggleSecondary,
    paramLabels,
    primaryKeys,
    secondaryKeys
  } = useDashboard();

  return (
    <section className="flex-1 glass-panel p-6 rounded-2xl flex flex-col gap-5 min-w-0">
      <div className="flex items-center justify-between pb-3 border-b border-card-border">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">Volumetric Parameters Settings</h2>
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-panel text-text-muted border border-card-border/30">
          Inputs must be values &gt; 0
        </div>
      </div>

      {/* Primary Volumetric Parameters */}
      <div className="flex flex-col gap-4">
        <div className="text-[11px] font-black uppercase tracking-wider text-cyan-500/80 mb-1">
          Primary Product Parameters ({fluidType === 'OIL' ? 'Crude Oil' : 'Natural Gas'})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {primaryKeys.map((key) => {
            const param = parameters[key]!;
            const labelInfo = paramLabels[key];
            
            const isSw = key === 'Sw';
            const isInvalid = isSw ? (param.p10 > param.p90) : (param.p90 > param.p10);
            
            return (
              <div key={key} className="flex flex-col gap-2 p-3 bg-panel border border-card-border/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">{labelInfo.title}</span>
                    <span className="text-[10px] text-text-muted italic">Symbol: {key} ({labelInfo.unit})</span>
                  </div>
                  <select
                    value={param.distribution}
                    onChange={(e) => handleParamChange(key, 'distribution', e.target.value)}
                    className="bg-background border border-card-border rounded px-1.5 py-0.5 text-[10px] font-bold text-cyan-500 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="LOGNORMAL">LogNormal</option>
                    <option value="NORMAL">Normal</option>
                    <option value="UNIFORM">Uniform</option>
                    <option value="BETA">Beta</option>
                    <option value="TRIANGULAR">Triangular</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="text-[10px] text-text-muted font-bold tracking-wider block mb-1 truncate">
                      P90 {isSw ? '(Pessimistic, Max)' : '(Pessimistic, Min)'}
                    </label>
                    <input
                      type="number"
                      step={labelInfo.step}
                      min={labelInfo.min}
                      value={param.p90}
                      onChange={(e) => handleParamChange(key, 'p90', e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted font-bold tracking-wider block mb-1 truncate">
                      P10 {isSw ? '(Optimistic, Min)' : '(Optimistic, Max)'}
                    </label>
                    <input
                      type="number"
                      step={labelInfo.step}
                      min={labelInfo.min}
                      value={param.p10}
                      onChange={(e) => handleParamChange(key, 'p10', e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Display Warning message */}
                {isInvalid && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold mt-1.5 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>
                      {isSw
                        ? 'For Sw, P90 is typically greater than P10'
                        : 'P10 must be greater than P90'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Product Parameters */}
      <div className="flex flex-col gap-4 pt-4 border-t border-card-border">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-purple-500/80">
            Secondary Product Parameters ({fluidType === 'OIL' ? 'Solution Gas' : 'Condensate'})
          </div>
          
          {/* Segmented Control for secondary product toggle */}
          <div className="flex bg-background border border-card-border rounded-xl p-0.5 text-[10px] font-bold shrink-0">
            <button
              type="button"
              onClick={() => handleToggleSecondary(true)}
              className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
                includeSecondary
                  ? 'bg-purple-600 text-white font-bold shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              With Secondary
            </button>
            <button
              type="button"
              onClick={() => handleToggleSecondary(false)}
              className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
                !includeSecondary
                  ? 'bg-panel border border-card-border/80 text-text-muted font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Without Secondary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {secondaryKeys.map((key) => {
            const param = (parameters[key as keyof SimulationParams] || DEFAULT_PARAMS[key as keyof SimulationParams])!;
            const labelInfo = paramLabels[key];
            const isInvalid = param.p90 > param.p10;
            
            return (
              <div key={key} className={`flex flex-col gap-2 p-3 bg-panel border border-card-border/50 rounded-xl transition-all duration-300 ${
                !includeSecondary ? 'opacity-40 pointer-events-none select-none grayscale-[30%]' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">{labelInfo.title}</span>
                    <span className="text-[10px] text-text-muted italic">Symbol: {key} ({labelInfo.unit})</span>
                  </div>
                  <select
                    disabled={!includeSecondary}
                    value={param.distribution}
                    onChange={(e) => handleParamChange(key as any, 'distribution', e.target.value)}
                    className="bg-background border border-card-border rounded px-1.5 py-0.5 text-[10px] font-bold text-purple-500 focus:outline-none focus:border-purple-500 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="LOGNORMAL">LogNormal</option>
                    <option value="NORMAL">Normal</option>
                    <option value="UNIFORM">Uniform</option>
                    <option value="BETA">Beta</option>
                    <option value="TRIANGULAR">Triangular</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="text-[10px] text-text-muted font-bold tracking-wider block mb-1 truncate">
                      P90 (Pessimistic, Min)
                    </label>
                    <input
                      disabled={!includeSecondary}
                      type="number"
                      step={labelInfo.step}
                      min={labelInfo.min}
                      value={param.p90}
                      onChange={(e) => handleParamChange(key as any, 'p90', e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 font-semibold disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted font-bold tracking-wider block mb-1 truncate">
                      P10 (Optimistic, Max)
                    </label>
                    <input
                      disabled={!includeSecondary}
                      type="number"
                      step={labelInfo.step}
                      min={labelInfo.min}
                      value={param.p10}
                      onChange={(e) => handleParamChange(key as any, 'p10', e.target.value)}
                      className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 font-semibold disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Display Warning message */}
                {isInvalid && includeSecondary && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-semibold mt-1.5 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>P10 must be greater than P90</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
