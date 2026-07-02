import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
  ScatterController,
  LineController
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Point, MethodParams, DcaMethod, calculateDcaRate } from '@/lib/dca-engine';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  LineController
);

interface DcaChartProps {
  data: Point[];
  params: MethodParams;
  method: DcaMethod;
  forecastMonths: number;
}

export default function DcaChart({ data, params, method, forecastMonths }: DcaChartProps) {
  
  const chartData = useMemo(() => {
    // Generate Forecast Curve
    const maxT = data.length > 0 ? Math.max(...data.map(d => d.t)) : 0;
    const forecastT = maxT + forecastMonths; // Usually data is in months
    
    const curvePoints = [];
    const step = Math.max(1, forecastT / 100);
    for (let t = 0; t <= forecastT; t += step) {
      const q = calculateDcaRate(t, method, params);
      // Don't plot tiny values to prevent log scale errors
      if (q > 0.1) {
        curvePoints.push({ x: t, y: q });
      }
    }

    // Convert historical data, filter out tiny/zero values for log scale
    const scatterPoints = data.filter(d => d.q > 0.1).map(d => ({ x: d.t, y: d.q }));

    return {
      datasets: [
        {
          type: 'scatter' as const,
          label: 'Historical Data',
          data: scatterPoints,
          backgroundColor: 'rgba(6, 182, 212, 0.5)',
          borderColor: 'rgba(6, 182, 212, 1)',
          pointRadius: 3,
        },
        {
          type: 'line' as const,
          label: `${method} Forecast`,
          data: curvePoints,
          borderColor: 'rgba(249, 115, 22, 1)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderWidth: 3,
          pointRadius: 0, // hide points on line
          fill: false,
          tension: 0.2, // Smooth curve
        }
      ]
    };
  }, [data, params, method, forecastMonths]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Time (e.g. Months)',
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: { color: '#94a3b8' }
      },
      y: {
        type: 'logarithmic' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Production Rate (Log Scale)',
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: { 
          color: '#94a3b8',
          callback: function(value: any, index: any, values: any) {
             return Number(value.toString()); // Convert to number
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#f8fafc', font: { family: 'inherit', weight: 600 } }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    }
  };

  return (
    <div className="w-full h-[500px]">
      <Chart type="scatter" data={chartData as any} options={options} />
    </div>
  );
}
