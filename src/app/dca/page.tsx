'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw, Calculator } from 'lucide-react';
import { useSession } from 'next-auth/react';

import DataIngestion from '@/components/dca/DataIngestion';
import DcaChart from '@/components/dca/DcaChart';
import DcaSidebar from '@/components/dca/DcaSidebar';
import { Point, ArpsParams, fitDeclineCurve, arpsCumulative } from '@/lib/dca-engine';
import { DashboardProvider, useDashboard, DEFAULT_EMV, DEFAULT_ECON } from '@/components/dashboard/DashboardContext';
import Header from '@/components/dashboard/Header';
import EmvAnalysis from '@/components/dashboard/EmvAnalysis';

export default function DcaPage() {
  return (
    <DashboardProvider>
      <DcaPageContent />
    </DashboardProvider>
  );
}

function DcaPageContent() {
  const { 
    enableEconomics, setEnableEconomics,
    emvParams, setEmvParams,
    econParams, setEconParams,
    setSimResults, fluidType
  } = useDashboard();

  const { data: session } = useSession();
  const [data, setData] = useState<Point[]>([]);
  const [params, setParams] = useState<ArpsParams>({ qi: 1000, di: 0.1, b: 0.5 });
  const [forecastMonths, setForecastMonths] = useState<number>(120);
  const [qLimit, setQLimit] = useState<number>(50); // Economic limit rate
  
  // Scenario Management State
  const [scenarioName, setScenarioName] = useState<string>('New DCA Scenario');
  const [folder, setFolder] = useState<string>('Uncategorized');
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);

  // Sidebar resizer state
  const [sidebarWidth, setSidebarWidth] = useState('280px');
  const isResizing = useRef(false);

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

  const isFirstLoad = useRef(true);

  // Fetch scenarios
  const fetchScenarios = useCallback(async () => {
    try {
      setIsLoadingScenarios(true);
      const res = await fetch('/api/dca');
      if (!res.ok) throw new Error('Failed to load scenarios');
      const fetchedData = await res.json();
      setScenarios(fetchedData);

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        
        const lastId = localStorage.getItem('resologix-last-dca-scenario');
        let initialScenario = lastId ? fetchedData.find((s: any) => s.id === lastId) : null;
        
        if (!initialScenario) {
          const latestUserScenario = fetchedData.find((s: any) => s.is_example === 0 || s.is_example === false);
          initialScenario = latestUserScenario || fetchedData.find((s: any) => s.is_example);
        }

        if (initialScenario) {
          handleLoadScenario(initialScenario);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingScenarios(false);
    }
  }, [session]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  // Sidebar Resize Logic
  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(200, Math.min(e.clientX, 600));
    setSidebarWidth(`${newWidth}px`);
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

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

    // Feed EUR into DashboardContext simResults for EmvAnalysis
    setSimResults({
      recoverableStats: {
        p90: calculatedEur,
        p50: calculatedEur,
        p10: calculatedEur,
      }
    } as any);
  }, [params, qLimit, setSimResults]);

  const [showGuestDialog, setShowGuestDialog] = useState(false);

  const handleSaveScenario = async () => {
    if (!session) {
      setShowGuestDialog(true);
      return;
    }
    if (data.length === 0) {
      alert("No data to save!");
      return;
    }
    if (!scenarioName.trim()) {
      alert("Please enter a scenario name.");
      return;
    }

    try {
      const res = await fetch('/api/dca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeScenarioId,
          scenario_name: scenarioName,
          folder: folder,
          description: '',
          params,
          q_limit: qLimit,
          historical_data: data,
          enable_economics: enableEconomics,
          emv_params: emvParams,
          econ_params: econParams
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      
      setActiveScenarioId(resData.id);
      fetchScenarios();
      // alert("Scenario saved successfully!");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    }
  };

  const handleLoadScenario = (scenario: any) => {
    localStorage.setItem('resologix-last-dca-scenario', scenario.id);
    setActiveScenarioId(scenario.id);
    setScenarioName(scenario.scenario_name);
    setFolder(scenario.folder || 'Uncategorized');
    setParams({
      qi: scenario.qi,
      di: scenario.di,
      b: scenario.b
    });
    setQLimit(scenario.q_limit || 50);
    setData(scenario.historical_data || []);
    setEnableEconomics(scenario.enable_economics || false);
    setEmvParams(scenario.emv_params || DEFAULT_EMV);
    setEconParams(scenario.econ_params || DEFAULT_ECON);
  };

  const handleDeleteScenario = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scenario?")) return;
    try {
      const res = await fetch(`/api/dca?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      if (activeScenarioId === id) {
        handleNewScenario();
      }
      fetchScenarios();
    } catch (err) {
      console.error(err);
      alert("Error deleting scenario");
    }
  };

  const handleNewScenario = () => {
    setActiveScenarioId(null);
    setScenarioName('New DCA Scenario');
    setFolder('Uncategorized');
    setParams({ qi: 1000, di: 0.1, b: 0.5 });
    setQLimit(50);
    setData([]);
    setEnableEconomics(false);
    setEmvParams(DEFAULT_EMV);
    setEconParams(DEFAULT_ECON);
  };

  return (
    <div className="h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col overflow-hidden">
      
      {/* Header */}
      <Header activeEngine="dca" />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <DcaSidebar 
          scenarios={scenarios}
          activeId={activeScenarioId}
          isLoading={isLoadingScenarios}
          onLoad={handleLoadScenario}
          onDelete={handleDeleteScenario}
          onNew={handleNewScenario}
          sidebarWidth={sidebarWidth}
          onMouseDown={handleSidebarMouseDown}
          folder={folder}
          setFolder={setFolder}
          scenarioName={scenarioName}
          setScenarioName={setScenarioName}
          onSave={handleSaveScenario}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 flex flex-col xl:flex-row gap-6 overflow-y-auto">
          
          {/* Left Column: Input & Controls */}
          <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0">
            <DataIngestion onDataLoaded={(loaded) => { setData(loaded); }} />

            {/* Arps Parameters Panel */}
            <div className="bg-card/40 border border-card-border p-6 rounded-2xl shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-card-border/50 pb-3">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-orange-500" /> Arps Parameters
                </h2>
                <button 
                  onClick={handleAutoFit}
                  className="py-1 px-3 bg-card border border-card-border hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-500 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Auto-Fit
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Manual Fit Group */}
                <fieldset className="border border-card-border/80 rounded-xl p-4 flex flex-col gap-4">
                  <legend className="text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest px-2">Manual Fit Controls</legend>
                {/* qi */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-text-secondary items-center">
                    <span>Initial Rate (qi)</span>
                    <input 
                      type="number" 
                      value={params.qi} 
                      onChange={(e) => setParams({...params, qi: parseFloat(e.target.value) || 0})}
                      className="bg-background border border-card-border text-cyan-400 rounded px-2 py-0.5 w-24 text-right outline-none focus:border-cyan-500"
                    />
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
                  <div className="flex justify-between text-xs font-bold text-text-secondary items-center">
                    <span>Initial Decline (Di)</span>
                    <input 
                      type="number" step="0.001"
                      value={params.di} 
                      onChange={(e) => setParams({...params, di: parseFloat(e.target.value) || 0})}
                      className="bg-background border border-card-border text-cyan-400 rounded px-2 py-0.5 w-24 text-right outline-none focus:border-cyan-500"
                    />
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
                  <div className="flex justify-between text-xs font-bold text-text-secondary items-center">
                    <span>Decline Exponent (b)</span>
                    <input 
                      type="number" step="0.01"
                      value={params.b} 
                      onChange={(e) => setParams({...params, b: parseFloat(e.target.value) || 0})}
                      className="bg-background border border-card-border text-cyan-400 rounded px-2 py-0.5 w-24 text-right outline-none focus:border-cyan-500"
                    />
                  </div>
                  <input 
                    type="range" min="0" max="2" step="0.01" 
                    value={params.b} 
                    onChange={(e) => setParams({...params, b: parseFloat(e.target.value)})}
                    className="w-full accent-cyan-500"
                  />
                </div>
                </fieldset>
                
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
            <div className="eur-card border p-6 rounded-2xl shadow-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-1">Estimated Ultimate Recovery</span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                  {eur > 0 ? eur.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---'} <span className="text-lg text-text-muted font-bold">BOE</span>
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

            {/* Economics Toggle for DCA */}
            <div className="flex items-center justify-between bg-card/20 border border-card-border p-4 rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Economics & EMV Analysis</h3>
                <p className="text-xs text-text-muted mt-0.5">Toggle to evaluate the deterministic financial viability of this decline curve.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnableEconomics(!enableEconomics)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    enableEconomics ? 'bg-emerald-500' : 'bg-card border border-card-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableEconomics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold ${enableEconomics ? 'text-emerald-400' : 'text-text-muted'}`}>
                  {enableEconomics ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Economics Module */}
            <EmvAnalysis isDcaMode={true} />

          </div>

        </main>
      </div>

      {/* Guest Dialog */}
      {showGuestDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-card-border p-8 rounded-2xl shadow-2xl max-w-md w-full relative">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Guest Access Notice</h2>
            <p className="text-text-primary mb-4 leading-relaxed">
              As an unregistered guest, you cannot save your scenarios, but you are welcome to create new scenarios on the fly to conduct analysis and export the results.
            </p>
            <p className="text-text-muted italic mb-8">
              ResoLogix Resource Evaluation suite v3.1.0
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowGuestDialog(false)}
                className="px-6 py-2.5 bg-card-border hover:bg-card-border/80 text-text-primary rounded-xl font-semibold transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

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
