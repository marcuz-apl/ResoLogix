'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Chart as ReactChart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);

export default function EmvAnalysis() {
  const { 
    emvParams, handleEmvChange, 
    econParams, handleEconChange, 
    calculatedPg, simResults, fluidType 
  } = useDashboard();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [p50Profile, setP50Profile] = useState<{ labels: string[], production: number[], cashFlow: number[] } | null>(null);

  // Auto-calculate NPVs based on Simulation Results and Economics Params
  useEffect(() => {
    if (!simResults) return;

    // Extract primary recoverable volumes (in raw units: STB for OIL, SCF for GAS)
    const { p90, p50, p10 } = simResults.recoverableStats;

    const calculateNpv = (rawYield: number): number => {
      if (rawYield <= 0) return 0;

      const d = econParams.declineRate / 100;
      const r = econParams.discountRate / 100;
      const N = econParams.projectLife;
      
      // We want to work in Millions.
      // If OIL, yield in MMbbl. If GAS, yield in MMcf (divide SCF by 1e6).
      const yieldMM = fluidType === 'OIL' ? (rawYield / 1e6) : (rawYield / 1e6);
      
      // Calculate Year 1 production such that sum over N years equals total yieldMM
      // qt = q1 * (1-d)^(t-1)
      // Sum qt = q1 * [1 - (1-d)^N] / d
      const denominator = 1 - Math.pow(1 - d, N);
      if (denominator <= 0 || d <= 0) return 0;
      
      const q1 = (yieldMM * d) / denominator;
      
      let npv = -emvParams.dryHoleCost; // Initial CapEx
      let qt = q1;
      
      const price = fluidType === 'OIL' ? econParams.oilPrice : econParams.gasPrice;
      
      const labels: string[] = ['Year 0'];
      const productionProfile: number[] = [0];
      const cashFlowProfile: number[] = [-emvParams.dryHoleCost];

      for (let t = 1; t <= N; t++) {
        // qt is in MM units.
        // For OIL: qt is MMbbl. Price is $/bbl. Revenue in $MM = qt * Price.
        // For GAS: qt is MMcf. Price is $/Mcf. 
        // 1 MMcf = 1000 Mcf. Revenue in $MM = (qt * 1000) * Price / 1e6 = qt * Price / 1000.
        const revenueMM = fluidType === 'OIL' 
          ? qt * price 
          : qt * price * 1000 / 1e6; // actually qt(MMcf) * price($/Mcf) = $Thousands. So /1000 for $MM
          
        // OPEX is usually per BOE.
        // 1 BOE = 1 bbl oil or 6000 scf gas.
        // For OIL: qt MMbbl = qt MMBOE. OPEX cost in $MM = qt * OPEX.
        // For GAS: qt MMcf = (qt * 1e6 / 6000) BOE.
        let opexMM = 0;
        if (fluidType === 'OIL') {
          opexMM = qt * econParams.opex;
        } else {
          const boeMM = qt / 6; // 6 Mcf = 1 BOE roughly
          opexMM = boeMM * econParams.opex;
        }
        
        const cashFlow = revenueMM - opexMM;
        npv += cashFlow / Math.pow(1 + r, t);
        
        if (rawYield === p50) {
          labels.push(`Year ${t}`);
          productionProfile.push(qt);
          cashFlowProfile.push(cashFlow);
        }

        // Decline for next year
        qt = qt * (1 - d);
      }

      if (rawYield === p50) {
        setP50Profile({ labels, production: productionProfile, cashFlow: cashFlowProfile });
      }
      
      return Math.max(0, npv); // Floor at 0 for worst-case if uneconomic? Or allow negative?
      // Actually, if it's deeply uneconomic, NPV is negative, meaning we shouldn't develop it.
      // We will allow negative NPV, but usually if NPV is negative, PV success is considered 0 because we wouldn't develop.
    };

    const newNpv90 = calculateNpv(p90);
    const newNpv50 = calculateNpv(p50);
    const newNpv10 = calculateNpv(p10);

    // Only update if changed significantly to avoid infinite loops
    if (
      Math.abs(emvParams.npv90 - newNpv90) > 0.1 ||
      Math.abs(emvParams.npv50 - newNpv50) > 0.1 ||
      Math.abs(emvParams.npv10 - newNpv10) > 0.1
    ) {
      handleEmvChange('npv90', newNpv90);
      handleEmvChange('npv50', newNpv50);
      handleEmvChange('npv10', newNpv10);
    }
    
  }, [simResults, econParams, fluidType, emvParams.dryHoleCost, emvParams.npv90, emvParams.npv50, emvParams.npv10, handleEmvChange]);


  // Calculate PV Success
  const pvSuccess = 
    (0.3 * emvParams.npv90) + 
    (0.4 * emvParams.npv50) + 
    (0.3 * emvParams.npv10);

  // Calculate EMV
  const emv = (pvSuccess * calculatedPg) - (emvParams.dryHoleCost * (1 - calculatedPg));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 1,
    }).format(val);
  };

  return (
    <section className="glass-panel p-6 rounded-2xl flex flex-col gap-6 mt-6 border border-card-border/50">
      <div 
        className="flex items-center justify-between pb-3 border-b border-card-border/60 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">
              Economics & EMV Analysis
            </h2>
            <p className="text-[10px] text-text-muted mt-0.5">
              Automated Petroleum Economics engine based on recoverable yields
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted" />
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Inputs */}
          <div className="flex flex-col gap-4">
            
            {/* Economic Assumptions */}
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-card-border/50 pb-2 flex justify-between">
                <span>Economic Assumptions</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">{fluidType === 'OIL' ? 'Oil Price ($/bbl)' : 'Gas Price ($/Mcf)'}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                    <input 
                      type="number"
                      value={fluidType === 'OIL' ? econParams.oilPrice : econParams.gasPrice}
                      onChange={(e) => handleEconChange(fluidType === 'OIL' ? 'oilPrice' : 'gasPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-background border border-card-border rounded-lg pl-6 pr-3 py-1.5 text-xs text-text-primary focus:border-green-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">OPEX ($/boe)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                    <input 
                      type="number"
                      value={econParams.opex}
                      onChange={(e) => handleEconChange('opex', parseFloat(e.target.value) || 0)}
                      className="w-full bg-background border border-card-border rounded-lg pl-6 pr-3 py-1.5 text-xs text-text-primary focus:border-green-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">Initial CapEx ($MM)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                    <input 
                      type="number"
                      value={emvParams.dryHoleCost}
                      onChange={(e) => handleEmvChange('dryHoleCost', parseFloat(e.target.value) || 0)}
                      className="w-full bg-background border border-card-border rounded-lg pl-6 pr-3 py-1.5 text-xs text-text-primary focus:border-green-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">Discount Rate (%)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={econParams.discountRate}
                      onChange={(e) => handleEconChange('discountRate', parseFloat(e.target.value) || 0)}
                      className="w-full bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-green-500 outline-none transition-colors"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">Project Life (Years)</label>
                  <input 
                    type="number"
                    value={econParams.projectLife}
                    onChange={(e) => handleEconChange('projectLife', parseFloat(e.target.value) || 0)}
                    className="w-full bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-green-500 outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">Annual Decline (%)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={econParams.declineRate}
                      onChange={(e) => handleEconChange('declineRate', parseFloat(e.target.value) || 0)}
                      className="w-full bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-green-500 outline-none transition-colors"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">%</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs text-text-secondary flex items-center">
                  <span>Calculated NPV ($MM)</span>
                  {simResults && <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded ml-2">Auto-linked</span>}
                </h4>
                <button 
                  onClick={() => setShowChart(!showChart)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border bg-background hover:bg-card-border/30 text-[10px] font-bold text-text-primary transition-all"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                  {showChart ? 'Hide P50 Cash Flow Chart' : 'Show P50 Cash Flow Chart'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">P90 (Low Case)</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                    <input 
                      type="number"
                      readOnly
                      value={emvParams.npv90.toFixed(1)}
                      className="w-full bg-background/50 border border-card-border rounded-md pl-5 pr-2 py-1.5 text-xs text-text-muted outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">P50 (Best Case)</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                    <input 
                      type="number"
                      readOnly
                      value={emvParams.npv50.toFixed(1)}
                      className="w-full bg-background/50 border border-card-border rounded-md pl-5 pr-2 py-1.5 text-xs text-text-muted outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted">P10 (High Case)</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-xs">$</span>
                    <input 
                      type="number"
                      readOnly
                      value={emvParams.npv10.toFixed(1)}
                      className="w-full bg-background/50 border border-card-border rounded-md pl-5 pr-2 py-1.5 text-xs text-text-muted outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 border-b border-card-border/50 pb-2">
              Results Summary
            </h3>
            
            <div className="flex flex-col gap-4 bg-background/50 rounded-xl p-4 border border-card-border/50">
              
              <div className="flex justify-between items-center pb-3 border-b border-card-border/40">
                <div>
                  <span className="text-sm text-text-secondary">Geological Chance of Success (Pg)</span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">{(calculatedPg * 100).toFixed(1)}%</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-card-border/40">
                <div>
                  <span className="text-sm text-text-secondary">Mean PV of Success</span>
                  <p className="text-[10px] text-text-muted mt-0.5">Weighted avg of P90, P50, P10 NPVs</p>
                </div>
                <span className="font-mono text-text-primary font-bold">{formatCurrency(pvSuccess)}M</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-base font-extrabold text-text-primary">Expected Monetary Value</span>
                  <p className="text-xs text-text-muted mt-0.5">Risk-adjusted project value</p>
                </div>
                <span className={`text-xl font-mono font-black ${emv >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(emv)}M
                </span>
              </div>
            </div>

            {/* Decision Rule Banner */}
            <div className={`mt-2 p-3 rounded-lg border text-xs flex items-center gap-2 ${
              emv > 0 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : emv < 0
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${emv > 0 ? 'bg-emerald-400' : emv < 0 ? 'bg-red-400' : 'bg-orange-400'} animate-pulse-subtle shrink-0`} />
              <span>
                {emv > 0 
                  ? "Economically viable drilling candidate. The risk-adjusted value is positive."
                  : emv < 0
                    ? "Economically unviable. The cost of failure outweighs the risk-adjusted reward."
                    : "Marginal prospect. The EMV is exactly breakeven."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* P50 Cash Flow Chart */}
      {isExpanded && showChart && p50Profile && (
        <div className="mt-6 border-t border-card-border/50 pt-6">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
            P50 (Best Case) Cash Flow & Production Profile
          </h3>
          <div className="h-64">
            <ReactChart 
              type="bar"
              data={{
                labels: p50Profile.labels,
                datasets: [
                  {
                    type: 'line' as const,
                    label: `Production (${fluidType === 'OIL' ? 'MMbbl' : 'MMcf'})`,
                    data: p50Profile.production,
                    borderColor: '#3b82f6',
                    backgroundColor: '#3b82f6',
                    yAxisID: 'y1',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0
                  },
                  {
                    type: 'bar' as const,
                    label: 'Net Cash Flow ($MM)',
                    data: p50Profile.cashFlow,
                    backgroundColor: p50Profile.cashFlow.map(val => val < 0 ? '#ef4444' : '#10b981'),
                    yAxisID: 'y',
                    borderRadius: 2
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  },
                  y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    title: { display: true, text: 'Cash Flow ($MM)', color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  },
                  y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    title: { display: true, text: `Production`, color: '#9ca3af' },
                    grid: { drawOnChartArea: false }
                  }
                },
                plugins: {
                  legend: { position: 'top', labels: { color: '#e5e7eb' } }
                }
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
