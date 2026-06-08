'use client';

import React from 'react';
import { Sliders, RefreshCw, Activity, Sun, Moon } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function Header() {
  const {
    iterations,
    setIterations,
    setSimResults,
    handleRunSimulation,
    isSimulating,
    fluidType,
    setFluidType,
    setParameters,
    toggleTheme,
    theme
  } = useDashboard();

  return (
    <header className="h-16 shrink-0 border-b border-card-border bg-card px-6 flex items-center justify-between z-30">
      
      {/* Left Side: MC Runs dropdown & Run Simulation Button */}
      <div className="flex items-center gap-4">
        {/* MC Runs Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary shrink-0">
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          <span className="font-bold">MC Runs:</span>
          <select
            value={iterations}
            onChange={(e) => {
              setIterations(Number(e.target.value));
              setSimResults(null);
            }}
            className="bg-background border border-card-border rounded px-2.5 py-1 text-text-secondary font-semibold focus:outline-none focus:border-cyan-500 text-xs cursor-pointer"
          >
            <option value="5000">5,000</option>
            <option value="10000">10,000</option>
            <option value="20000">20,000</option>
          </select>
        </div>

        {/* Run Simulation Button */}
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
        </button>
      </div>

      {/* Center Side: Logo, App Name (Stacked) and Version Badge */}
      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow shadow-cyan-500/20">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col justify-center select-none text-left">
            <span className="font-extrabold text-base leading-none tracking-wide text-text-primary">
              ResoLogix
            </span>
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
              Reserve Evaluation
            </span>
          </div>
        </div>
        <span className="text-[10px] bg-card-border/50 text-text-muted px-2.5 py-1 rounded-md font-mono shrink-0 select-none">
          v1.0.1 Build 2026-06-06
        </span>
      </div>

      {/* Right Side: Fluid Type Selector & Theme Toggle */}
      <div className="flex items-center gap-4">
        {/* Fluid Type Selector (Primary Product Option) */}
        <div className="flex bg-background border border-card-border rounded-xl p-0.5 text-xs font-semibold shrink-0">
          <button
            onClick={() => {
              setFluidType('OIL');
              setParameters(prev => {
                const u = { ...prev };
                u.Boi = { p90: 1.1, p10: 1.3, distribution: 'LOGNORMAL' };
                return u;
              });
              setSimResults(null);
            }}
            className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
              fluidType === 'OIL'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Oil Reservoir
          </button>
          <button
            onClick={() => {
              setFluidType('GAS');
              setParameters(prev => {
                const u = { ...prev };
                u.Boi = { p90: 100, p10: 200, distribution: 'LOGNORMAL' };
                return u;
              });
              setSimResults(null);
            }}
            className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${
              fluidType === 'GAS'
                ? 'bg-orange-500 text-white font-bold shadow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Gas Reservoir
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-background border border-card-border text-text-secondary hover:text-text-primary hover:border-card-border/80 transition-all duration-200 cursor-pointer shrink-0"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-yellow-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
}
