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
    </div>
  );
}
