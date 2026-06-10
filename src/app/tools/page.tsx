'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench, Calculator, ArrowRightLeft, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ToolsPage() {
  const [ffExpanded, setFfExpanded] = useState(false);
  const [ucExpanded, setUcExpanded] = useState(false);

  // Formation Volume Factor Determinator State
  const [fvfType, setFvfType] = useState<'oil' | 'gas' | 'water'>('oil');

  // Gas FVF State
  const [pressure, setPressure] = useState<number | ''>(3000);
  const [temperature, setTemperature] = useState<number | ''>(600); // Rankine
  const [zFactor, setZFactor] = useState<number | ''>(0.85);

  // Oil FVF State (Standing's)
  const [rs, setRs] = useState<number | ''>(500); // scf/stb
  const [gammaG, setGammaG] = useState<number | ''>(0.7);
  const [gammaO, setGammaO] = useState<number | ''>(0.85);
  const [tempOil, setTempOil] = useState<number | ''>(150); // Fahrenheit

  // Water FVF State
  const [tempWater, setTempWater] = useState<number | ''>(150); // Fahrenheit
  const [pressureWater, setPressureWater] = useState<number | ''>(3000); // psia

  const calculateGasFVF = () => {
    if (pressure === '' || temperature === '' || zFactor === '') return '--';
    if (pressure <= 0) return 'Error (P > 0)';
    const bg = 0.02827 * zFactor * temperature / pressure;
    return (bg * 1000).toFixed(4) + ' rb/Mscf';
  };

  const calculateOilFVF = () => {
    if (rs === '' || gammaG === '' || gammaO === '' || tempOil === '') return '--';
    if (gammaO <= 0) return 'Error';
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

  const CONVERSIONS: Record<string, {id: string, label: string, convert: (v:number)=>number, unit: string}[]> = {
    Length: [
      { id: 'm_to_ft', label: 'Meters to Feet', convert: v => v * 3.28084, unit: 'ft' },
      { id: 'ft_to_m', label: 'Feet to Meters', convert: v => v / 3.28084, unit: 'm' },
      { id: 'ft_to_in', label: 'Feet to Inches', convert: v => v * 12, unit: 'in' },
      { id: 'in_to_ft', label: 'Inches to Feet', convert: v => v / 12, unit: 'ft' },
      { id: 'km_to_mi', label: 'Kilometers to Miles', convert: v => v * 0.621371, unit: 'mi' },
      { id: 'mi_to_km', label: 'Miles to Kilometers', convert: v => v / 0.621371, unit: 'km' },
    ],
    Temperature: [
      { id: 'c_to_f', label: 'Celsius to Fahrenheit', convert: v => (v * 9/5) + 32, unit: '°F' },
      { id: 'f_to_c', label: 'Fahrenheit to Celsius', convert: v => (v - 32) * 5/9, unit: '°C' },
      { id: 'c_to_k', label: 'Celsius to Kelvin', convert: v => v + 273.15, unit: 'K' },
      { id: 'f_to_r', label: 'Fahrenheit to Rankine', convert: v => v + 459.67, unit: '°R' },
    ],
    Area: [
      { id: 'sqm_to_sqft', label: 'Sq Meters to Sq Feet', convert: v => v * 10.7639, unit: 'sq ft' },
      { id: 'sqft_to_sqm', label: 'Sq Feet to Sq Meters', convert: v => v / 10.7639, unit: 'sq m' },
      { id: 'acres_to_sqft', label: 'Acres to Sq Feet', convert: v => v * 43560, unit: 'sq ft' },
      { id: 'sqft_to_acres', label: 'Sq Feet to Acres', convert: v => v / 43560, unit: 'acres' },
    ],
    Volume: [
      { id: 'bbl_to_m3', label: 'Barrels to Cubic Meters', convert: v => v * 0.158987, unit: 'm³' },
      { id: 'm3_to_bbl', label: 'Cubic Meters to Barrels', convert: v => v / 0.158987, unit: 'bbl' },
      { id: 'gal_to_L', label: 'Gallons (US) to Liters', convert: v => v * 3.78541, unit: 'L' },
      { id: 'L_to_gal', label: 'Liters to Gallons (US)', convert: v => v / 3.78541, unit: 'gal' },
      { id: 'cuft_to_bbl', label: 'Cubic Feet to Barrels', convert: v => v / 5.61458, unit: 'bbl' },
      { id: 'bbl_to_cuft', label: 'Barrels to Cubic Feet', convert: v => v * 5.61458, unit: 'cu ft' },
    ],
    Mass: [
      { id: 'kg_to_lb', label: 'Kilograms to Pounds', convert: v => v * 2.20462, unit: 'lb' },
      { id: 'lb_to_kg', label: 'Pounds to Kilograms', convert: v => v / 2.20462, unit: 'kg' },
      { id: 'ton_to_kg', label: 'Metric Tons to Kilograms', convert: v => v * 1000, unit: 'kg' },
    ],
    Pressure: [
      { id: 'psi_to_kpa', label: 'PSI to kPa', convert: v => v * 6.89476, unit: 'kPa' },
      { id: 'kpa_to_psi', label: 'kPa to PSI', convert: v => v / 6.89476, unit: 'psi' },
      { id: 'psi_to_bar', label: 'PSI to Bar', convert: v => v * 0.0689476, unit: 'bar' },
      { id: 'bar_to_psi', label: 'Bar to PSI', convert: v => v / 0.0689476, unit: 'psi' },
      { id: 'atm_to_psi', label: 'Atmospheres to PSI', convert: v => v * 14.6959, unit: 'psi' },
    ],
    Density: [
      { id: 'gcc_to_lbgal', label: 'g/cm³ to lb/gal (ppg)', convert: v => v * 8.3454, unit: 'ppg' },
      { id: 'lbgal_to_gcc', label: 'lb/gal (ppg) to g/cm³', convert: v => v / 8.3454, unit: 'g/cm³' },
      { id: 'gcc_to_lbcuft', label: 'g/cm³ to lb/ft³', convert: v => v * 62.42796, unit: 'lb/ft³' },
      { id: 'lbcuft_to_gcc', label: 'lb/ft³ to g/cm³', convert: v => v / 62.42796, unit: 'g/cm³' },
    ],
    Time: [
      { id: 'hr_to_min', label: 'Hours to Minutes', convert: v => v * 60, unit: 'min' },
      { id: 'min_to_hr', label: 'Minutes to Hours', convert: v => v / 60, unit: 'hr' },
      { id: 'day_to_hr', label: 'Days to Hours', convert: v => v * 24, unit: 'hr' },
    ],
    Speed: [
      { id: 'ms_to_kmh', label: 'm/s to km/h', convert: v => v * 3.6, unit: 'km/h' },
      { id: 'kmh_to_ms', label: 'km/h to m/s', convert: v => v / 3.6, unit: 'm/s' },
      { id: 'mph_to_kmh', label: 'mph to km/h', convert: v => v * 1.60934, unit: 'km/h' },
      { id: 'kmh_to_mph', label: 'km/h to mph', convert: v => v / 1.60934, unit: 'mph' },
      { id: 'knots_to_mph', label: 'Knots to mph', convert: v => v * 1.15078, unit: 'mph' },
    ],
    Torque: [
      { id: 'nm_to_lbft', label: 'N·m to lb·ft', convert: v => v * 0.737562, unit: 'lb·ft' },
      { id: 'lbft_to_nm', label: 'lb·ft to N·m', convert: v => v / 0.737562, unit: 'N·m' },
    ]
  };

  // Unit Converter State
  const [ucValue, setUcValue] = useState<number | ''>(1);
  const [ucCategory, setUcCategory] = useState('Length');
  const [ucType, setUcType] = useState(CONVERSIONS['Length'][0].id);

  const handleCategoryChange = (cat: string) => {
    setUcCategory(cat);
    setUcType(CONVERSIONS[cat][0].id);
  };

  const calculateConversion = () => {
    if (ucValue === '') return '--';
    const convList = CONVERSIONS[ucCategory];
    if (!convList) return '--';
    const conv = convList.find(c => c.id === ucType);
    if (!conv) return '--';
    return conv.convert(ucValue).toFixed(4) + ' ' + conv.unit;
  };

  return (
    <div className="flex-1 p-6 lg:p-8 animate-fade-in w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Tools & Calculators</h1>
        </div>
        <Link 
          href="/"
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-card border border-card-border text-text-secondary hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all duration-200 text-sm font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to main App
        </Link>
      </div>

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
                      <p className="text-xs text-text-secondary mb-2">Calculates Gas FVF (Bg) using Real Gas Law</p>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Pressure (psia):<input type="number" step="10" value={pressure} onChange={e => setPressure(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Temperature (°R):<input type="number" step="10" value={temperature} onChange={e => setTemperature(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Z-Factor (dimensionless):<input type="number" step="0.01" value={zFactor} onChange={e => setZFactor(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                    </>
                  )}
                  {fvfType === 'oil' && (
                    <>
                      <p className="text-xs text-text-secondary mb-2">Calculates Oil FVF (Bo) using Standing's Correlation</p>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Solution GOR - Rs (scf/STB):<input type="number" step="10" value={rs} onChange={e => setRs(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Gas Specific Gravity (γg):<input type="number" step="0.01" value={gammaG} onChange={e => setGammaG(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">Oil Specific Gravity (γo):<input type="number" step="0.01" value={gammaO} onChange={e => setGammaO(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" /></label>
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
            <div className="px-6 pb-6 pt-2 border-t border-card-border/50 bg-background/30 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <p className="text-xs text-text-secondary mb-2">Standard Oil & Gas unit conversions</p>
                <div className="flex flex-col gap-4">
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-1 p-1 bg-input-bg rounded-lg border border-input-border">
                    {Object.keys(CONVERSIONS).map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => handleCategoryChange(cat)} 
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${ucCategory === cat ? 'bg-cyan-950/50 text-white shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-card-border/30'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">
                    Conversion:
                    <select value={ucType} onChange={e => setUcType(e.target.value)} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none">
                      {CONVERSIONS[ucCategory].map(conv => (
                        <option key={conv.id} value={conv.id} className="bg-card text-text-primary">{conv.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold text-text-primary">
                    Value:
                    <input type="number" value={ucValue} onChange={e => setUcValue(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-input-bg text-text-primary border border-input-border rounded-md px-3 py-1.5 focus:border-cyan-500 outline-none" />
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
