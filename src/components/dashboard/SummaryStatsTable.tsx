'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function SummaryStatsTable() {
  const {
    rightPaneWidth,
    simResults,
    fluidType,
    formatVolume,
    includeSecondary
  } = useDashboard();

  return (
    <section 
      className="shrink-0 glass-panel p-6 rounded-2xl flex flex-col gap-4"
      style={{ width: rightPaneWidth }}
    >
      <div className="pb-3 border-b border-card-border flex items-center gap-2">
        <Activity className="w-5 h-5 text-yellow-500" />
        <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary truncate">Summary Stats</h2>
      </div>

      {simResults ? (
        <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
          
          {/* Section A: Primary Product stats */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-black text-cyan-500 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Primary: {fluidType === 'OIL' ? 'Oil' : 'Gas'} ({fluidType === 'OIL' ? 'MMSTB' : 'BCF'})
            </h3>
            <table className="w-full text-[11px] text-left text-text-secondary">
              <thead>
                <tr className="text-[9px] text-text-muted border-b border-card-border">
                  <th className="py-1">Percentile</th>
                  <th className="py-1 text-right">{fluidType === 'OIL' ? 'OOIP' : 'OGIP'}</th>
                  <th className="py-1 text-right">Recoverable</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border/40 hover:bg-table-hover">
                  <td className="py-1 text-text-muted font-bold">P90</td>
                  <td className="py-1 text-right">{formatVolume(simResults.inPlaceStats.p90)}</td>
                  <td className="py-1 text-right font-black text-text-primary">{formatVolume(simResults.recoverableStats.p90)}</td>
                </tr>
                <tr className="border-b border-card-border/40 hover:bg-table-hover">
                  <td className="py-1 text-text-muted font-bold">P50</td>
                  <td className="py-1 text-right">{formatVolume(simResults.inPlaceStats.p50)}</td>
                  <td className="py-1 text-right font-black text-cyan-500">{formatVolume(simResults.recoverableStats.p50)}</td>
                </tr>
                <tr className="border-b border-card-border/40 hover:bg-table-hover">
                  <td className="py-1 text-text-muted font-bold">P10</td>
                  <td className="py-1 text-right">{formatVolume(simResults.inPlaceStats.p10)}</td>
                  <td className="py-1 text-right font-black text-text-primary">{formatVolume(simResults.recoverableStats.p10)}</td>
                </tr>
                <tr className="hover:bg-table-hover font-bold text-text-primary">
                  <td className="py-1.5">Mean Success</td>
                  <td className="py-1.5 text-right font-normal text-text-secondary">{formatVolume(simResults.inPlaceStats.mean)}</td>
                  <td className="py-1.5 text-right">{formatVolume(simResults.recoverableStats.mean)}</td>
                </tr>
                <tr className="hover:bg-table-hover font-bold text-purple-600 dark:text-purple-400 border-t border-dashed border-card-border/40">
                  <td className="py-1.5">Mean EV</td>
                  <td className="py-1.5 text-right font-normal text-text-secondary">{formatVolume(simResults.riskedInPlaceStats.mean)}</td>
                  <td className="py-1.5 text-right">{formatVolume(simResults.riskedRecoverableStats.mean)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section B: Secondary Associated Product stats */}
          <div className="flex flex-col gap-2 pt-3 border-t border-card-border">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Secondary: {fluidType === 'OIL' ? 'Solution Gas' : 'Condensate'} ({fluidType === 'OIL' ? 'BCF' : 'MMSTB'})
            </h3>
            {!includeSecondary ? (
              <div className="text-center py-6 text-text-muted text-[11px] bg-panel/30 rounded-xl border border-dashed border-card-border/60 font-semibold uppercase tracking-wider my-2">
                Secondary Product Disabled
              </div>
            ) : (
              <table className="w-full text-[11px] text-left text-text-secondary">
                <thead>
                  <tr className="text-[9px] text-text-muted border-b border-card-border">
                    <th className="py-1">Percentile</th>
                    <th className="py-1 text-right">In-Place</th>
                    <th className="py-1 text-right">Recoverable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-card-border/40 hover:bg-table-hover">
                    <td className="py-1 text-text-muted font-bold">P90</td>
                    <td className="py-1 text-right">{formatVolume(simResults.secInPlaceStats?.p90 || 0, 'secondary')}</td>
                    <td className="py-1 text-right font-black text-text-primary">{formatVolume(simResults.secRecoverableStats?.p90 || 0, 'secondary')}</td>
                  </tr>
                  <tr className="border-b border-card-border/40 hover:bg-table-hover">
                    <td className="py-1 text-text-muted font-bold">P50</td>
                    <td className="py-1 text-right">{formatVolume(simResults.secInPlaceStats?.p50 || 0, 'secondary')}</td>
                    <td className="py-1 text-right font-black text-purple-400">{formatVolume(simResults.secRecoverableStats?.p50 || 0, 'secondary')}</td>
                  </tr>
                  <tr className="border-b border-card-border/40 hover:bg-table-hover">
                    <td className="py-1 text-text-muted font-bold">P10</td>
                    <td className="py-1 text-right">{formatVolume(simResults.secInPlaceStats?.p10 || 0, 'secondary')}</td>
                    <td className="py-1 text-right font-black text-text-primary">{formatVolume(simResults.secRecoverableStats?.p10 || 0, 'secondary')}</td>
                  </tr>
                  <tr className="hover:bg-table-hover font-bold text-text-primary">
                    <td className="py-1.5">Mean Success</td>
                    <td className="py-1.5 text-right font-normal text-text-secondary">{formatVolume(simResults.secInPlaceStats?.mean || 0, 'secondary')}</td>
                    <td className="py-1.5 text-right">{formatVolume(simResults.secRecoverableStats?.mean || 0, 'secondary')}</td>
                  </tr>
                  <tr className="hover:bg-table-hover font-bold text-pink-600 dark:text-pink-400 border-t border-dashed border-card-border/40">
                    <td className="py-1.5">Mean EV</td>
                    <td className="py-1.5 text-right font-normal text-text-secondary">{formatVolume(simResults.secRiskedInPlaceStats?.mean || 0, 'secondary')}</td>
                    <td className="py-1.5 text-right">{formatVolume(simResults.secRiskedRecoverableStats?.mean || 0, 'secondary')}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-muted text-xs font-semibold">
          No simulation run.
        </div>
      )}
    </section>
  );
}
