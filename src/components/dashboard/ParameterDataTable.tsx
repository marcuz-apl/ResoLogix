'use client';

import React from 'react';
import { Database } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function ParameterDataTable() {
  const { simResults, tableData, fluidType, includeSecondary, formatVolume } = useDashboard();

  if (!simResults || !tableData) return null;

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Merged Reserve Evaluation Results Table */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 border border-card-border/50 bg-card/45">
        <div className="flex items-center gap-2 pb-2 border-b border-card-border/60">
          <Database className="w-5 h-5 text-purple-400" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">
            Resource Evaluation Results
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-text-secondary border-collapse min-w-[1000px]">
            <thead>
              <tr className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-card-border/80">
                {/* Parameter Columns */}
                <th className="py-2.5 px-3 bg-panel/15">Prob</th>
                <th className="py-2.5 px-3 text-right bg-panel/15">Area (acres)</th>
                <th className="py-2.5 px-3 text-right bg-panel/15">h (ft)</th>
                <th className="py-2.5 px-3 text-right bg-panel/15">Phi (frac)</th>
                <th className="py-2.5 px-3 text-right bg-panel/15">Sw (frac)</th>
                <th className="py-2.5 px-3 text-right bg-panel/15">
                  {fluidType === 'OIL' ? 'RE-Oil (frac)' : 'RE-Gas (frac)'}
                </th>
                <th className="py-2.5 px-3 text-right bg-panel/15">
                  {fluidType === 'OIL' ? 'FVF (Boi)' : 'GEF (scf/rcf)'}
                </th>
                <th className="py-2.5 px-3 text-right bg-panel/15">
                  {fluidType === 'OIL' ? 'Second-RE (RE-SolGas)' : 'Second-RE (RE-Cond)'}
                </th>
                
                {/* Reserve Columns */}
                <th className="py-2.5 px-3 text-right bg-cyan-950/10 text-cyan-400 border-l border-card-border/40">
                  {fluidType === 'OIL' ? 'OOIP (MMbbl)' : 'OGIP (Bcf)'}
                </th>
                <th className="py-2.5 px-3 text-right bg-emerald-950/10 text-emerald-400">
                  {fluidType === 'OIL' ? 'Primary Yield (MMbbl)' : 'Primary Yield (Bcf)'}
                </th>
                <th className="py-2.5 px-3 text-right bg-purple-950/10 text-purple-400">
                  {fluidType === 'OIL' ? 'Secondary Yield (Gas, Bcf)' : 'Secondary Yield (Cond, MMbbl)'}
                </th>
                <th className="py-2.5 px-3 text-right bg-pink-950/10 text-pink-400">
                  Totalized MMBOE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/30">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-table-hover transition-colors font-medium">
                  {/* Parameter Values */}
                  <td className="py-2.5 px-3 text-text-primary font-extrabold bg-panel/5">{row.prob}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-secondary">{row.Area.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-secondary">{row.h.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-secondary">{row.Phi.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-secondary">{row.Sw.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-secondary">{row.RE.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-secondary">
                    {fluidType === 'OIL'
                      ? row.Boi.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                      : row.Boi.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-secondary">
                    {includeSecondary ? row.secRE.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '—'}
                  </td>
                  
                  {/* Reserve Values */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-text-primary bg-cyan-950/5 border-l border-card-border/40">
                    {formatVolume(row.primaryInPlace, 'primary')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-950/5">
                    {fluidType === 'OIL'
                      ? formatVolume(row.primaryLiquid, 'primary')
                      : formatVolume(row.secondaryFluid, 'primary')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-500 dark:text-purple-400 bg-purple-950/5">
                    {fluidType === 'OIL'
                      ? (includeSecondary ? formatVolume(row.secondaryFluid, 'secondary') : '—')
                      : (includeSecondary ? formatVolume(row.primaryLiquid, 'secondary') : '—')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-pink-500 dark:text-pink-400 bg-pink-950/5">
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
