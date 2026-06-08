'use client';

import React from 'react';
import { Sliders, Database } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function ParameterDataTable() {
  const { simResults, tableData, fluidType, includeSecondary, formatVolume } = useDashboard();

  if (!simResults || !tableData) return null;

  return (
    <div className="flex flex-col gap-6 mt-6 pb-12">
      {/* Parameter Data Table */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-card-border/50">
        <div className="flex items-center gap-2 pb-2 border-b border-card-border/60">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">
            Parameter Data Table
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-text-secondary border-collapse">
            <thead>
              <tr className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-card-border/80">
                <th className="py-2.5 px-3">Prob</th>
                <th className="py-2.5 px-3 text-right">Area (acres)</th>
                <th className="py-2.5 px-3 text-right">h (ft)</th>
                <th className="py-2.5 px-3 text-right">Phi (frac)</th>
                <th className="py-2.5 px-3 text-right">Sw (frac)</th>
                <th className="py-2.5 px-3 text-right">
                  {fluidType === 'OIL' ? 'RE-Oil (frac)' : 'RE-Gas (frac)'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {fluidType === 'OIL' ? 'FVF (Boi)' : 'GEF (scf/rcf)'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {fluidType === 'OIL' ? 'Second-RE (RE-SolGas)' : 'Second-RE (RE-Cond)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/30">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-table-hover transition-colors font-medium">
                  <td className="py-2 px-3 text-text-muted font-bold">{row.prob}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.Area.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.h.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.Phi.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.Sw.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td className="py-2 px-3 text-right font-mono">{row.RE.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td className="py-2 px-3 text-right font-mono">
                    {fluidType === 'OIL'
                      ? row.Boi.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                      : row.Boi.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{includeSecondary ? row.secRE.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reserve Data Table */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-card-border/50">
        <div className="flex items-center gap-2 pb-2 border-b border-card-border/60">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">
            Reserve Data Table
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-text-secondary border-collapse">
            <thead>
              <tr className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-card-border/80">
                <th className="py-2.5 px-3">Prob</th>
                <th className="py-2.5 px-3 text-right">
                  {fluidType === 'OIL' ? 'OOIP (MMbbl)' : 'OGIP (Bcf)'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {fluidType === 'OIL' ? 'Primary Liquid Yield (MMbbl)' : 'Primary Liquid Yield (Condensate, MMbbl)'}
                </th>
                <th className="py-2.5 px-3 text-right">
                  {fluidType === 'OIL' ? 'Secondary fluid yield (Gas, Bcf)' : 'Secondary fluid yield (Gas, Bcf)'}
                </th>
                <th className="py-2.5 px-3 text-right">Totalized MMBOE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/30">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-table-hover transition-colors font-medium">
                  <td className="py-2 px-3 text-text-muted font-bold">{row.prob}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-text-primary">
                    {formatVolume(row.primaryInPlace, 'primary')}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-500 dark:text-emerald-400">
                    {fluidType === 'OIL'
                      ? formatVolume(row.primaryLiquid, 'primary')
                      : (includeSecondary ? formatVolume(row.primaryLiquid, 'secondary') : '—')}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-purple-500 dark:text-purple-400">
                    {fluidType === 'OIL'
                      ? (includeSecondary ? formatVolume(row.secondaryFluid, 'secondary') : '—')
                      : formatVolume(row.secondaryFluid, 'primary')}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-pink-500 dark:text-pink-400">
                    {row.totalBOE.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
