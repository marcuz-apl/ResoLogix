'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  useDashboard,
  COUNTRIES_LIST,
  GEOL_BASINS,
  PLAY_TYPES,
  RESERVOIR_AGES,
  LITHOLOGIES,
  DEPO_ENVS,
  EXP_STAGES,
  TERRAINS,
  LAHEE_CLASSES
} from './DashboardContext';

export default function ReserveProfile() {
  const {
    activeName,
    setActiveName,
    activeDescription,
    setActiveDescription,
    isProfileExpanded,
    setIsProfileExpanded,
    country,
    setCountry,
    geolBasin,
    setGeolBasin,
    playType,
    setPlayType,
    reservoirAge,
    setReservoirAge,
    lithology,
    setLithology,
    depoEnv,
    setDepoEnv,
    expStage,
    setExpStage,
    terrain,
    setTerrain,
    laheeClass,
    setLaheeClass,
    typeWell,
    setTypeWell,
    fluidType,
    setFluidType,
    setParameters,
    setSimResults
  } = useDashboard();

  return (
    <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4 mb-6 border border-card-border/50">
      {/* Name, Description, and Reservoir Type Selector Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 flex-[2] min-w-0">
          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Scenario Name</label>
          <input
            type="text"
            value={activeName}
            onChange={(e) => setActiveName(e.target.value)}
            className="bg-transparent text-sm font-bold text-text-primary focus:outline-none border-b border-transparent focus:border-card-border hover:border-card-border/60 px-1 py-0.5 rounded transition-all duration-200 w-full truncate"
            placeholder="Scenario Name"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-[3] min-w-0">
          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Description</label>
          <input
            type="text"
            value={activeDescription}
            onChange={(e) => setActiveDescription(e.target.value)}
            className="bg-transparent text-xs text-text-secondary focus:outline-none border-b border-transparent focus:border-card-border/60 px-1 py-1 rounded transition-all duration-200 w-full truncate"
            placeholder="Add description..."
          />
        </div>

        {/* Reservoir Fluid Type Switcher */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Reservoir Type</label>
          <div className="flex bg-background border border-card-border rounded-xl p-0.5 text-xs font-semibold">
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
              className={`py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
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
              className={`py-1.5 px-3.5 rounded-lg transition-all cursor-pointer ${
                fluidType === 'GAS'
                  ? 'bg-orange-500 text-white font-bold shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Gas Reservoir
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Reserve Profile Section */}
      <div className="border-t border-card-border/40 pt-3">
        <button
          type="button"
          onClick={() => setIsProfileExpanded(!isProfileExpanded)}
          className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors duration-200 uppercase tracking-wider focus:outline-none cursor-pointer"
        >
          {isProfileExpanded ? (
            <ChevronDown className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
          <span>Reserve Profile</span>
          <span className="text-[9px] text-text-muted font-normal lowercase italic normal-case">
            ({isProfileExpanded ? 'click to collapse' : 'click to expand - defaults to undefined'})
          </span>
        </button>

        {isProfileExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 pt-2 border-t border-card-border/20 animate-fade-in">
            
            {/* Country Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {COUNTRIES_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Geological Basin Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Geol-Basin</label>
              <select
                value={geolBasin}
                onChange={(e) => setGeolBasin(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {GEOL_BASINS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Play Type Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Play-Type</label>
              <select
                value={playType}
                onChange={(e) => setPlayType(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {PLAY_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Reservoir Age Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Reservoir-Age</label>
              <select
                value={reservoirAge}
                onChange={(e) => setReservoirAge(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {RESERVOIR_AGES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Lithology Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Lithology</label>
              <select
                value={lithology}
                onChange={(e) => setLithology(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {LITHOLOGIES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Depositional Environment Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Depo-Env</label>
              <select
                value={depoEnv}
                onChange={(e) => setDepoEnv(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {DEPO_ENVS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Exploration Stage Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Exp-Stage</label>
              <select
                value={expStage}
                onChange={(e) => setExpStage(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {EXP_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Terrain Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Terrain</label>
              <select
                value={terrain}
                onChange={(e) => setTerrain(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {TERRAINS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Lahee Class Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Lahee-Class</label>
              <select
                value={laheeClass}
                onChange={(e) => setLaheeClass(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
              >
                <option value="undefined">undefined</option>
                {LAHEE_CLASSES.map((lc) => (
                  <option key={lc} value={lc}>{lc}</option>
                ))}
              </select>
            </div>

            {/* Type Well Field */}
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 block">Type-Well</label>
              <input
                type="text"
                value={typeWell}
                onChange={(e) => setTypeWell(e.target.value)}
                className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-cyan-500 font-semibold transition-colors duration-200"
                placeholder="None"
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
