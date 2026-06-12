'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Dices, Save, RefreshCw, Calculator, Database } from 'lucide-react';
import { useSession } from 'next-auth/react';

import DataIngestion from '@/components/dca/DataIngestion';
import DcaChart from '@/components/dca/DcaChart';
import { Point, ArpsParams, fitDeclineCurve, arpsCumulative } from '@/lib/dca-engine';

export default function DcaPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<Point[]>([]);
  const [params, setParams] = useState<ArpsParams>({ qi: 1000, di: 0.1, b: 0.5 });
  const [forecastMonths, setForecastMonths] = useState<number>(120);
  const [qLimit, setQLimit] = useState<number>(50); // Economic limit rate
  
  // EUR Calculation
  const [eur, setEur] = useState<number>(0);

  // Auto-fit function
  const handleAutoFit = () => {
    if (data.length < 3) {
      alert("Need at least 3 data points to fit the curve.");
      return;
    }
    try {
      const bestFit = fitDeclineCurve(data);
      setParams(bestFit);
    } catch (err: any) {
      alert("Failed to auto-fit: " + err.message);
    }
  };

  // Update EUR whenever params, qLimit, or data changes
  useEffect(() => {
    if (params.qi <= 0 || params.di <= 0) {
      setEur(0);
      return;
    }
    
    // Find time tLimit where q(tLimit) = qLimit
    let tLimit = 0;
    const { qi, di, b } = params;
    
    if (qi <= qLimit) {
      setEur(0);
      return;
    }

    if (b === 0) {
      tLimit = Math.log(qi / qLimit) / di;
    } else {
      tLimit = (Math.pow(qi / qLimit, b) - 1) / (b * di);
    }

    const calculatedEur = arpsCumulative(tLimit, params);
    setEur(calculatedEur);
  }, [params, qLimit]);

  const handleSaveScenario = async () => {
    if (data.length === 0) {
      alert("No data to save!");
      return;
    }
    const name = prompt("Enter a name for this DCA Scenario:");
    if (!name) return;

    try {
      const res = await fetch('/api/dca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_name: name,
          description: '',
          params,
          q_limit: qLimit,
          historical_data: data
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      alert("Scenario saved successfully! ID: " + resData.id);
    } catch (err: any) {
      alert("Save failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-[#f8fafc] font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-card-border/50">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-card-border/50 rounded-lg transition-colors cursor-pointer group">
              <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-cyan-400" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-lg">
                <TrendingDownIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-wide text-text-primary">DCA <span className="text-text-muted font-normal">| ResoLogix</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="py-2 px-4 rounded-xl font-bold border border-card-border bg-card/50 hover:bg-card-border transition-colors flex items-center gap-2 text-sm text-text-secondary">
              <Database className="w-4 h-4" /> Load Scenario
            </button>
            <button 
              onClick={handleSaveScenario}
              className="py-2 px-4 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center gap-2 text-sm border border-orange-500/50"
            >
              <Save className="w-4 h-4" /> Save Scenario
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Input & Controls */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
          <DataIngestion onDataLoaded={(loaded) => { setData(loaded); }} />

          {/* Arps Parameters Panel */}
          <div className="bg-card/40 border border-card-border p-6 rounded-2xl shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-3">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Calculator className="w-5 h-5 text-orange-400" /> Arps Parameters
              </h2>
              <button 
                onClick={handleAutoFit}
                className="py-1 px-3 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-400 border border-cyan-800/50 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Auto-Fit
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* qi */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>Initial Rate (qi)</span>
                  <span className="text-cyan-400">{params.qi.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="10000" step="10" 
                  value={params.qi} 
                  onChange={(e) => setParams({...params, qi: parseFloat(e.target.value)})}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* di */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>Initial Decline (Di)</span>
                  <span className="text-cyan-400">{params.di.toFixed(4)}</span>
                </div>
                <input 
                  type="range" min="0.001" max="1" step="0.001" 
                  value={params.di} 
                  onChange={(e) => setParams({...params, di: parseFloat(e.target.value)})}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* b */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>Decline Exponent (b)</span>
                  <span className="text-cyan-400">{params.b.toFixed(3)}</span>
                </div>
                <input 
                  type="range" min="0" max="2" step="0.01" 
                  value={params.b} 
                  onChange={(e) => setParams({...params, b: parseFloat(e.target.value)})}
                  className="w-full accent-cyan-500"
                />
              </div>
              
              <hr className="border-card-border my-2" />

              {/* Forecast Controls */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>Forecast Horizon (Time Units)</span>
                  <span className="text-orange-400">{forecastMonths}</span>
                </div>
                <input 
                  type="range" min="12" max="600" step="12" 
                  value={forecastMonths} 
                  onChange={(e) => setForecastMonths(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>Economic Limit Rate (q_limit)</span>
                  <span className="text-orange-400">{qLimit}</span>
                </div>
                <input 
                  type="range" min="1" max="500" step="1" 
                  value={qLimit} 
                  onChange={(e) => setQLimit(parseFloat(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Chart & Results */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* EUR Summary Card */}
          <div className="bg-gradient-to-br from-cyan-950/40 to-blue-900/20 border border-cyan-800/50 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/80 mb-1">Estimated Ultimate Recovery</span>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                {eur > 0 ? eur.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---'} <span className="text-lg text-text-muted font-bold">Units</span>
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="text-sm font-semibold text-text-secondary">Data Points: <span className="text-text-primary">{data.length}</span></div>
              <div className="text-sm font-semibold text-text-secondary">Curve Type: <span className="text-text-primary">{params.b === 0 ? 'Exponential' : Math.abs(params.b - 1) < 1e-5 ? 'Harmonic' : 'Hyperbolic'}</span></div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-card/40 border border-card-border p-6 rounded-2xl shadow-xl flex-1 min-h-[500px]">
             <DcaChart data={data} params={params} forecastMonths={forecastMonths} />
          </div>

        </div>

      </main>
    </div>
  );
}

// Inline Icon to avoid adding to lucide imports if not present
function TrendingDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}
