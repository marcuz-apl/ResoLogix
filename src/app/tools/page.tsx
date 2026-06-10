'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench, Calculator, ArrowRightLeft } from 'lucide-react';

export default function ToolsPage() {
  const [ffExpanded, setFfExpanded] = useState(false);
  const [ucExpanded, setUcExpanded] = useState(false);

  // Formation Factor Determinator State
  const [a, setA] = useState<number | ''>(1.0);
  const [phi, setPhi] = useState<number | ''>(0.2);
  const [m, setM] = useState<number | ''>(2.0);

  const calculateF = () => {
    if (a === '' || phi === '' || m === '') return '--';
    if (phi <= 0) return 'Error (φ > 0)';
    const result = a / Math.pow(phi, m);
    return result.toFixed(4);
  };

  // Unit Converter State
  const [ucValue, setUcValue] = useState<number | ''>(1);
  const [ucType, setUcType] = useState('m_to_ft');

  const calculateConversion = () => {
    if (ucValue === '') return '--';
    switch(ucType) {
      case 'm_to_ft': return (ucValue * 3.28084).toFixed(4) + ' ft';
      case 'ft_to_m': return (ucValue / 3.28084).toFixed(4) + ' m';
      case 'bbl_to_m3': return (ucValue * 0.158987).toFixed(4) + ' m³';
      case 'm3_to_bbl': return (ucValue / 0.158987).toFixed(4) + ' bbl';
      case 'psi_to_kpa': return (ucValue * 6.89476).toFixed(4) + ' kPa';
      case 'kpa_to_psi': return (ucValue / 6.89476).toFixed(4) + ' psi';
      default: return '--';
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 animate-fade-in w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Wrench className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Tools & Calculators</h1>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Tool 1: Formation Factor Determinator */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-card-border">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-card-border/10 transition-colors"
            onClick={() => setFfExpanded(!ffExpanded)}
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Formation Factor Determinator</h2>
            </div>
            {ffExpanded ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
          </div>

          {ffExpanded && (
            <div className="px-6 pb-6 pt-2 border-t border-card-border/50 bg-background/30 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <p className="text-xs text-text-secondary mb-2">Calculates Formation Factor (F) using Archie's equation: F = a / Φ^m</p>
                <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">
                  Tortuosity factor (a):
                  <input type="number" step="0.1" value={a} onChange={e => setA(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">
                  Porosity (Φ as fraction):
                  <input type="number" step="0.01" value={phi} onChange={e => setPhi(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">
                  Cementation exponent (m):
                  <input type="number" step="0.1" value={m} onChange={e => setM(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" />
                </label>
              </div>
              <div className="flex flex-col items-center justify-center bg-card rounded-lg border border-card-border p-6 shadow-inner">
                <span className="text-sm text-text-secondary font-semibold uppercase mb-2">Formation Factor (F)</span>
                <span className="text-4xl font-extrabold text-cyan-400 font-mono tracking-tight">{calculateF()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tool 2: Unit Converter */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-card-border">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-card-border/10 transition-colors"
            onClick={() => setUcExpanded(!ucExpanded)}
          >
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-5 h-5 text-green-400" />
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Unit Converter</h2>
            </div>
            {ucExpanded ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
          </div>

          {ucExpanded && (
            <div className="px-6 pb-6 pt-2 border-t border-card-border/50 bg-background/30 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <p className="text-xs text-text-secondary mb-2">Standard Oil & Gas unit conversions</p>
                <div className="flex gap-4">
                  <label className="flex-1 flex flex-col gap-1 text-xs font-semibold text-text-primary">
                    Value:
                    <input type="number" value={ucValue} onChange={e => setUcValue(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" />
                  </label>
                  <label className="flex-1 flex flex-col gap-1 text-xs font-semibold text-text-primary">
                    Conversion:
                    <select value={ucType} onChange={e => setUcType(e.target.value)} className="bg-input-bg border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none">
                      <option value="m_to_ft">Meters &rarr; Feet</option>
                      <option value="ft_to_m">Feet &rarr; Meters</option>
                      <option value="bbl_to_m3">Barrels &rarr; Cubic Meters</option>
                      <option value="m3_to_bbl">Cubic Meters &rarr; Barrels</option>
                      <option value="psi_to_kpa">PSI &rarr; kPa</option>
                      <option value="kpa_to_psi">kPa &rarr; PSI</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-card rounded-lg border border-card-border p-6 shadow-inner">
                <span className="text-sm text-text-secondary font-semibold uppercase mb-2">Result</span>
                <span className="text-3xl font-extrabold text-green-400 font-mono tracking-tight">{calculateConversion()}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
