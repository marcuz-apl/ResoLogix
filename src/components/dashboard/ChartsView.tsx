'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useDashboard } from './DashboardContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartsView() {
  const {
    includeSecondary,
    chartTarget,
    setChartTarget,
    fluidType,
    activeTab,
    setActiveTab,
    simResults,
    exceedanceChartScatterData,
    exceedanceChartOptions,
    pdfChartData,
    pdfChartOptions,

    // Hidden chart configurations
    primaryExceedanceRef,
    primaryPdfRef,
    secondaryExceedanceRef,
    secondaryPdfRef,
    primaryExceedanceData,
    secondaryExceedanceData,
    primaryPdfData,
    secondaryPdfData,
    primaryExceedanceOptions,
    secondaryExceedanceOptions,
    primaryPdfOptions,
    secondaryPdfOptions
  } = useDashboard();

  return (
    <section className="flex-1 glass-panel p-6 rounded-2xl flex flex-col gap-4 min-h-[450px] min-w-0">
      <div className="flex items-center justify-between pb-3 border-b border-card-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">Probability Distributions</h2>
        </div>
        
        {/* Visual Tab and Product Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Chart Target Selector */}
          {includeSecondary && (
            <div className="flex bg-card border border-card-border rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setChartTarget('primary')}
                className={`py-1 px-3 rounded-lg transition-all ${
                  chartTarget === 'primary'
                    ? 'bg-cyan-900/35 border border-cyan-800/40 text-cyan-400 font-bold shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {fluidType === 'OIL' ? 'Primary (Oil)' : 'Primary (Gas)'}
              </button>
              <button
                onClick={() => setChartTarget('secondary')}
                className={`py-1 px-3 rounded-lg transition-all ${
                  chartTarget === 'secondary'
                    ? 'bg-purple-900/35 border border-purple-800/40 text-purple-400 font-bold shadow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {fluidType === 'OIL' ? 'Secondary (Solution Gas)' : 'Secondary (Condensate)'}
              </button>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex bg-card border border-card-border rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('exceedance')}
              className={`py-1 px-3 rounded-lg transition-all ${
                activeTab === 'exceedance'
                  ? 'bg-sidebar border border-card-border text-cyan-500 font-bold shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Exceedance (CDF)
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`py-1 px-3 rounded-lg transition-all ${
                activeTab === 'pdf'
                  ? 'bg-sidebar border border-card-border text-cyan-500 font-bold shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Relative Density (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Chart Rendering Container */}
      <div className="flex-1 relative min-h-[350px]">
        {simResults ? (
          activeTab === 'exceedance' ? (
            <Line data={exceedanceChartScatterData} options={exceedanceChartOptions as any} />
          ) : (
            <Bar data={pdfChartData} options={pdfChartOptions as any} />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted text-xs font-semibold">
            No simulation data available. Run simulation to render chart.
          </div>
        )}
      </div>

      {/* Off-screen hidden canvases for generating exportable chart images */}
      {simResults && (
        <div 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            top: '-9999px', 
            width: '800px', 
            height: '400px', 
            pointerEvents: 'none' 
          }}
        >
          <div style={{ width: '800px', height: '400px' }}>
            <Line 
              ref={primaryExceedanceRef} 
              data={primaryExceedanceData} 
              options={primaryExceedanceOptions} 
            />
          </div>
          <div style={{ width: '800px', height: '400px' }}>
            <Bar 
              ref={primaryPdfRef} 
              data={primaryPdfData} 
              options={primaryPdfOptions} 
            />
          </div>
          {includeSecondary && (
            <>
              <div style={{ width: '800px', height: '400px' }}>
                <Line 
                  ref={secondaryExceedanceRef} 
                  data={secondaryExceedanceData} 
                  options={secondaryExceedanceOptions} 
                />
              </div>
              <div style={{ width: '800px', height: '400px' }}>
                <Bar 
                  ref={secondaryPdfRef} 
                  data={secondaryPdfData} 
                  options={secondaryPdfOptions} 
                />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
