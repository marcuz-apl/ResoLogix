'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench, Calculator, ArrowRightLeft, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../components/layout/PageHeader';
import Header from '@/components/dashboard/Header';
import { DashboardProvider } from '@/components/dashboard/DashboardContext';

export default function ToolsPage() {
  return (
    <DashboardProvider>
      <ToolsPageContent />
    </DashboardProvider>
  );
}

function ToolsPageContent() {
  const [ffExpanded, setFfExpanded] = useState(true);
  const [ucExpanded, setUcExpanded] = useState(false);

  // Formation Volume Factor Determinator State
  const [fvfType, setFvfType] = useState<'oil' | 'gas' | 'water'>('oil');

  // Gas FVF State
  const [pressure, setPressure] = useState<number | ''>(3000);
  const [temperature, setTemperature] = useState<number | ''>(150); // Fahrenheit
  const [gammaG_gas, setGammaG_gas] = useState<number | ''>(0.7);
  const [h2s, setH2s] = useState<number | ''>(0); // mole %
  const [co2, setCo2] = useState<number | ''>(0); // mole %
  const [n2, setN2] = useState<number | ''>(0); // mole %

  // Oil FVF State (Standing's)
  const [rs, setRs] = useState<number | ''>(500); // scf/stb
  const [gammaG, setGammaG] = useState<number | ''>(0.7);
  const [apiOil, setApiOil] = useState<number | ''>(35); // °API
  const [tempOil, setTempOil] = useState<number | ''>(150); // Fahrenheit

  // Water FVF State
  const [tempWater, setTempWater] = useState<number | ''>(150); // Fahrenheit
  const [pressureWater, setPressureWater] = useState<number | ''>(3000); // psia

  const calculateGasFVF = () => {
    if (pressure === '' || temperature === '' || gammaG_gas === '' || h2s === '' || co2 === '' || n2 === '') return '--';
    if (pressure <= 0 || gammaG_gas < 0.55) return 'Error';

    const GG = gammaG_gas;
    const Y_H2S = h2s / 100;
    const Y_CO2 = co2 / 100;
    const Y_N2 = n2 / 100;
    const T = temperature;
    const P = pressure;

    const Y_HC = 1 - (Y_H2S + Y_CO2 + Y_N2);
    if (Y_HC <= 0) return 'Error';

    const GG_HC = (GG - (34.08 * Y_H2S + 44.01 * Y_CO2 + 28.01 * Y_N2) / 28.9647) / Y_HC;
    
    // Sutton (1985) for Pseudo-Critical Properties
    const P_pcHC = 756.8 - 131.0 * GG_HC - 3.6 * Math.pow(GG_HC, 2);
    const T_pcHC = 169.2 + 349.5 * GG_HC - 74.0 * Math.pow(GG_HC, 2);

    const P_pc_1 = Y_HC * P_pcHC + Y_H2S * 1300 + Y_CO2 * 1071 + Y_N2 * 493.1;
    const T_pc_1 = Y_HC * T_pcHC + Y_H2S * 672.45 + Y_CO2 * 547.91 + Y_N2 * 227.49;

    // Wichert-Aziz (1972) correction
    const EPSI = 107.6 * (Y_H2S + Y_CO2 - Math.pow(Y_H2S + Y_CO2, 2.2)) + 5.9 * (Math.pow(Y_H2S, 0.06) - Math.pow(Y_H2S, 0.68));

    const T_pc = T_pc_1 - EPSI;
    const P_pc = (P_pc_1 * (T_pc_1 - EPSI)) / (T_pc_1 + Y_H2S * (1 - Y_H2S) * EPSI);

    const T_pr = (T + 459.67) / T_pc;
    const P_pr = P / P_pc;

    // Dranchuk-Abou-Kassem (1975) Constants
    const A_1 = 0.3265, A_2 = -1.07, A_3 = -0.5339, A_4 = 0.01569, A_5 = -0.05165;
    const A_6 = 0.5475, A_7 = -0.7361, A_8 = 0.1844, A_9 = 0.1056, A_10 = 0.6134, A_11 = 0.721;

    let Z_Trial = 1;
    let dZ = 1;
    let i = 0;

    while (i < 10000 && Math.abs(dZ) > 1e-13) {
      const Den_r = (0.27 * P_pr) / (Z_Trial * T_pr);
      const C1 = A_1 + A_2 / T_pr + A_3 / Math.pow(T_pr, 3) + A_4 / Math.pow(T_pr, 4) + A_5 / Math.pow(T_pr, 5);
      const C2 = A_6 + A_7 / T_pr + A_8 / Math.pow(T_pr, 2);
      const C3 = A_9 * (A_7 / T_pr + A_8 / Math.pow(T_pr, 2));
      const C4 = (A_10 * (1 + A_11 * Math.pow(Den_r, 2))) / Math.pow(T_pr, 3);
      
      const Z_Calc = 1 + C1 * Den_r + C2 * Math.pow(Den_r, 2) - C3 * Math.pow(Den_r, 5) + C4 * Math.pow(Den_r, 2) * Math.exp(-1 * A_11 * Math.pow(Den_r, 2));
      
      dZ = Z_Calc - Z_Trial;
      if (P_pr <= 2) Z_Trial += dZ;
      else if (P_pr <= 3) Z_Trial += dZ / 2;
      else if (P_pr <= 6) Z_Trial += dZ / 3;
      else Z_Trial += dZ / 5;
      
      i++;
    }

    const bg_rcf_scf = 0.02827 * Z_Trial * (T + 459.67) / P;
    const bg_rb_scf = bg_rcf_scf / 5.61458;
    return bg_rb_scf.toFixed(5) + ' rb/scf';
  };

  const calculateOilFVF = () => {
    if (rs === '' || gammaG === '' || apiOil === '' || tempOil === '') return '--';
    if (apiOil <= 0) return 'Error';
    const gammaO = 141.5 / (131.5 + apiOil);
    const bo = 0.9759 + 0.000120 * Math.pow(rs * Math.pow(gammaG / gammaO, 0.5) + 1.25 * tempOil, 1.2);
    return bo.toFixed(4) + ' rb/STB';
  };

  const calculateWaterFVF = () => {
    if (tempWater === '' || pressureWater === '') return '--';
    const deltaT = tempWater - 60;
    const deltaP = pressureWater - 14.7;
    const bw = 1.0 + 0.00012 * deltaT - 0.000003 * deltaP;
    return bw.toFixed(4) + ' rb/STB';
  };

  const renderFVFResult = () => {
    if (fvfType === 'gas') return calculateGasFVF();
    if (fvfType === 'oil') return calculateOilFVF();
    return calculateWaterFVF();
  };

  interface Unit {
    name: string;
    toBase: (v: number) => number;
    fromBase: (v: number) => number;
  }

  const UNITS: Record<string, Unit[]> = {
    Length: [
      { name: 'Meters', toBase: v => v, fromBase: v => v },
      { name: 'Feet', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { name: 'Inches', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { name: 'Kilometers', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { name: 'Miles', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    ],
    Temperature: [
      { name: 'Celsius', toBase: v => v, fromBase: v => v },
      { name: 'Fahrenheit', toBase: v => (v - 32) * 5/9, fromBase: v => (v * 9/5) + 32 },
      { name: 'Kelvin', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
      { name: 'Rankine', toBase: v => (v - 491.67) * 5/9, fromBase: v => (v * 9/5) + 491.67 },
    ],
    Area: [
      { name: 'Sq Meters', toBase: v => v, fromBase: v => v },
      { name: 'Sq Feet', toBase: v => v * 0.09290304, fromBase: v => v / 0.09290304 },
      { name: 'Acres', toBase: v => v * 4046.85642, fromBase: v => v / 4046.85642 },
    ],
    Volume: [
      { name: 'Barrels', toBase: v => v, fromBase: v => v },
      { name: 'Cubic Meters', toBase: v => v * 0.1589873, fromBase: v => v / 0.1589873 },
      { name: 'Gallons (US)', toBase: v => v * 0.00378541, fromBase: v => v / 0.00378541 },
      { name: 'Liters', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      { name: 'Cubic Feet', toBase: v => v * 0.02831685, fromBase: v => v / 0.02831685 },
    ],
    Mass: [
      { name: 'Kilograms', toBase: v => v, fromBase: v => v },
      { name: 'Pounds', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
      { name: 'Metric Tons', toBase: v => v * 1000, fromBase: v => v / 1000 },
    ],
    Pressure: [
      { name: 'PSI', toBase: v => v, fromBase: v => v },
      { name: 'kPa', toBase: v => v * 0.14503774, fromBase: v => v / 0.14503774 },
      { name: 'Bar', toBase: v => v * 14.503774, fromBase: v => v / 14.503774 },
      { name: 'Atmospheres', toBase: v => v * 14.695949, fromBase: v => v / 14.695949 },
    ],
    Density: [
      { name: 'g/cm³', toBase: v => v, fromBase: v => v },
      { name: 'lb/gal (ppg)', toBase: v => v * 0.11982643, fromBase: v => v / 0.11982643 },
      { name: 'lb/ft³', toBase: v => v * 0.01601846, fromBase: v => v / 0.01601846 },
    ],
    Time: [
      { name: 'Hours', toBase: v => v, fromBase: v => v },
      { name: 'Minutes', toBase: v => v / 60, fromBase: v => v * 60 },
      { name: 'Days', toBase: v => v * 24, fromBase: v => v / 24 },
    ],
    Speed: [
      { name: 'm/s', toBase: v => v, fromBase: v => v },
      { name: 'km/h', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
      { name: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { name: 'Knots', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    ],
    Torque: [
      { name: 'N·m', toBase: v => v, fromBase: v => v },
      { name: 'lb·ft', toBase: v => v * 1.355818, fromBase: v => v / 1.355818 },
    ]
  };

  // Unit Converter State
  const [ucCategory, setUcCategory] = useState('Length');
  const [ucFromUnit, setUcFromUnit] = useState('Meters');
  const [ucToUnit, setUcToUnit] = useState('Feet');
  const [ucFromValue, setUcFromValue] = useState<number | ''>(1);
  const [ucToValue, setUcToValue] = useState<number | ''>(3.28084);

  const performConversion = (val: number | '', from: string, to: string, direction: 'from' | 'to', targetCategory = ucCategory) => {
    if (val === '') {
      if (direction === 'from') setUcToValue('');
      else setUcFromValue('');
      return;
    }
    
    const catUnits = UNITS[targetCategory];
    const fromUnit = catUnits.find(u => u.name === from);
    const toUnit = catUnits.find(u => u.name === to);
    if (!fromUnit || !toUnit) return;

    if (direction === 'from') {
      const baseVal = fromUnit.toBase(val);
      const converted = toUnit.fromBase(baseVal);
      setUcToValue(parseFloat(converted.toFixed(6)));
    } else {
      const baseVal = toUnit.toBase(val);
      const converted = fromUnit.fromBase(baseVal);
      setUcFromValue(parseFloat(converted.toFixed(6)));
    }
  };

  const handleCategoryChange = (cat: string) => {
    setUcCategory(cat);
    const defaultFrom = UNITS[cat][0].name;
    const defaultTo = UNITS[cat][1]?.name || UNITS[cat][0].name;
    setUcFromUnit(defaultFrom);
    setUcToUnit(defaultTo);
    
    setUcFromValue(1);
    performConversion(1, defaultFrom, defaultTo, 'from', cat);
  };

  const handleFromValueChange = (valStr: string) => {
    const val = valStr === '' ? '' : parseFloat(valStr);
    setUcFromValue(val);
    performConversion(val, ucFromUnit, ucToUnit, 'from');
  };

  const handleToValueChange = (valStr: string) => {
    const val = valStr === '' ? '' : parseFloat(valStr);
    setUcToValue(val);
    performConversion(val, ucFromUnit, ucToUnit, 'to');
  };

  const handleFromUnitChange = (newUnit: string) => {
    setUcFromUnit(newUnit);
    performConversion(ucFromValue, newUnit, ucToUnit, 'from');
  };

  const handleToUnitChange = (newUnit: string) => {
    setUcToUnit(newUnit);
    performConversion(ucFromValue, ucFromUnit, newUnit, 'from');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      <Header />
      <div className="flex-1 p-6 lg:p-8 animate-fade-in w-full max-w-6xl mx-auto">
        <PageHeader 
        title="Tools & Calculators"
        subtitle="Engineering utilities & unit conversions"
      />

      <div className="flex flex-col gap-6">
        
        {/* Tool 1: Formation Volume Factor Determinator */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-card-border">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-card-border/10 transition-colors"
            onClick={() => setFfExpanded(!ffExpanded)}
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Formation Volume Factor Determinator</h2>
            </div>
            {ffExpanded ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
          </div>

          {ffExpanded && (
            <div className="px-6 pb-6 pt-2 border-t border-card-border/50 bg-background/30 flex flex-col gap-6">
              
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-input-bg rounded-lg border border-input-border max-w-sm">
                <button onClick={() => setFvfType('oil')} className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${fvfType === 'oil' ? 'bg-cyan-950/50 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Oil (Bo)</button>
                <button onClick={() => setFvfType('gas')} className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${fvfType === 'gas' ? 'bg-cyan-950/50 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Gas (Bg)</button>
                <button onClick={() => setFvfType('water')} className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${fvfType === 'water' ? 'bg-cyan-950/50 text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>Water (Bw)</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  {fvfType === 'gas' && (
                    <>
                      <p className="text-xs text-text-secondary mb-2">Calculates Gas FVF (Bg) using Dranchuk-Abou-Kassem (1975)</p>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Gas Specific Gravity (γg):<input type="number" step="0.01" value={gammaG_gas} onChange={e => setGammaG_gas(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">H2S Content (mole %):<input type="number" step="0.1" value={h2s} onChange={e => setH2s(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">CO2 Content (mole %):<input type="number" step="0.1" value={co2} onChange={e => setCo2(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">N2 Content (mole %):<input type="number" step="0.1" value={n2} onChange={e => setN2(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Temperature (°F):<input type="number" step="5" value={temperature} onChange={e => setTemperature(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Pressure (psia):<input type="number" step="10" value={pressure} onChange={e => setPressure(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                    </>
                  )}
                  {fvfType === 'oil' && (
                    <>
                      <p className="text-xs text-text-secondary mb-2">Calculates Oil FVF (Bo) using Standing's Correlation</p>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Solution GOR - Rs (scf/STB):<input type="number" step="10" value={rs} onChange={e => setRs(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Gas Specific Gravity (γg):<input type="number" step="0.01" value={gammaG} onChange={e => setGammaG(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Oil Gravity (°API):<input type="number" step="0.1" value={apiOil} onChange={e => setApiOil(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Temperature (°F):<input type="number" step="5" value={tempOil} onChange={e => setTempOil(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                    </>
                  )}
                  {fvfType === 'water' && (
                    <>
                      <p className="text-xs text-text-secondary mb-2">Calculates Water FVF (Bw) using basic linear approximation</p>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Temperature (°F):<input type="number" step="5" value={tempWater} onChange={e => setTempWater(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Pressure (psia):<input type="number" step="10" value={pressureWater} onChange={e => setPressureWater(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center bg-card rounded-lg border border-card-border p-6 shadow-inner min-h-[200px]">
                  <span className="text-sm text-text-secondary font-semibold uppercase mb-2">Calculated Result</span>
                  <span className="text-4xl font-extrabold text-cyan-400 font-mono tracking-tight text-center">{renderFVFResult()}</span>
                </div>
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
            <div className="px-6 pb-8 pt-4 border-t border-card-border/50 bg-background/30 flex flex-col gap-6">
              
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1 p-1 bg-input-bg rounded-lg border border-input-border self-start">
                {Object.keys(UNITS).map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => handleCategoryChange(cat)} 
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${ucCategory === cat ? 'bg-cyan-950/50 text-white shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-card-border/30'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Conversion Sentence */}
              <div className="flex flex-col items-center justify-center py-8 bg-card/30 rounded-xl border border-card-border/60 shadow-inner px-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-base md:text-lg font-bold text-text-primary w-full max-w-3xl">
                  
                  {/* From Value Input */}
                  <input 
                    type="number" 
                    value={ucFromValue} 
                    onChange={e => handleFromValueChange(e.target.value)} 
                    placeholder="0"
                    className="w-full md:w-36 bg-input-bg text-text-primary border border-input-border rounded-xl px-4 py-3 text-center focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none font-mono text-xl shadow-sm transition-all"
                  />

                  {/* From Unit Selection */}
                  <select 
                    value={ucFromUnit} 
                    onChange={e => handleFromUnitChange(e.target.value)} 
                    className="w-full md:w-auto bg-input-bg hover:bg-input-bg/85 border border-input-border rounded-xl px-4 py-3 text-center text-cyan-400 focus:outline-none cursor-pointer text-lg font-bold transition-colors"
                  >
                    {UNITS[ucCategory].map(u => (
                      <option key={u.name} value={u.name} className="bg-card text-text-primary text-left">
                        {u.name.toLowerCase()}
                      </option>
                    ))}
                  </select>

                  <span className="text-text-muted font-medium text-xs md:text-sm uppercase tracking-wider px-2 py-1 select-none">equals to</span>

                  {/* To Value Input */}
                  <input 
                    type="number" 
                    value={ucToValue} 
                    onChange={e => handleToValueChange(e.target.value)} 
                    placeholder="0"
                    className="w-full md:w-36 bg-input-bg text-text-primary border border-input-border rounded-xl px-4 py-3 text-center focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none font-mono text-xl shadow-sm transition-all"
                  />

                  {/* To Unit Selection */}
                  <select 
                    value={ucToUnit} 
                    onChange={e => handleToUnitChange(e.target.value)} 
                    className="w-full md:w-auto bg-input-bg hover:bg-input-bg/85 border border-input-border rounded-xl px-4 py-3 text-center text-cyan-400 focus:outline-none cursor-pointer text-lg font-bold transition-colors"
                  >
                    {UNITS[ucCategory].map(u => (
                      <option key={u.name} value={u.name} className="bg-card text-text-primary text-left">
                        {u.name.toLowerCase()}
                      </option>
                    ))}
                  </select>

                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
    </div>
  );
}
