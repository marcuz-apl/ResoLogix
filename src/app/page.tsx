'use client';

import React from 'react';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import ReserveProfile from '@/components/dashboard/ReserveProfile';
import QuickMetrics from '@/components/dashboard/QuickMetrics';
import VolumetricParameters from '@/components/dashboard/VolumetricParameters';
import GeologicalRisk from '@/components/dashboard/GeologicalRisk';
import ChartsView from '@/components/dashboard/ChartsView';
import SummaryStatsTable from '@/components/dashboard/SummaryStatsTable';
import ParameterDataTable from '@/components/dashboard/ParameterDataTable';
import ReportingSection from '@/components/dashboard/ReportingSection';

function DashboardContent() {
  const { handleRightPaneMouseDown } = useDashboard();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden">
      
      {/* Top Header Single Row */}
      <Header />

      {/* Main Container below the header row */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 w-full overflow-hidden">
        
        {/* Sidebar - Scenario Manager */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background p-4 md:p-6 w-full">
          
          {/* Scenario Details & Reserve Profile sub-panel */}
          <ReserveProfile />

          {/* Quick Metrics Banner */}
          <QuickMetrics />

          {/* Premium Gradient Separator Bar */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-card-border/60 to-transparent my-3 shrink-0" />

          {/* Config Panels with Dynamic Flex Resizing */}
          <div className="flex flex-col lg:flex-row gap-0 items-stretch">
            <VolumetricParameters />
            
            {/* Vertical Resizer Handle */}
            <div 
              className="hidden lg:block w-[4px] hover:w-[7px] cursor-col-resize bg-card-border/20 hover:bg-cyan-500/40 hover:border-cyan-500/20 hover:border-l hover:border-r transition-all shrink-0 mx-2.5 select-none z-20 rounded"
              onMouseDown={handleRightPaneMouseDown}
              title="Drag to resize panel width"
            />

            <GeologicalRisk />
          </div>

          {/* Results Panels with Dynamic Flex Resizing */}
          <div className="flex flex-col lg:flex-row gap-0 items-stretch mt-6">
            <ChartsView />

            {/* Vertical Resizer Handle */}
            <div 
              className="hidden lg:block w-[4px] hover:w-[7px] cursor-col-resize bg-card-border/20 hover:bg-cyan-500/40 hover:border-cyan-500/20 hover:border-l hover:border-r transition-all shrink-0 mx-2.5 select-none z-20 rounded"
              onMouseDown={handleRightPaneMouseDown}
              title="Drag to resize panel width"
            />

            <SummaryStatsTable />
          </div>

          {/* Percentile Parameters and Reserves Data tables */}
          <ParameterDataTable />
          <ReportingSection />


        </main>
      </div>
    </div>
  );
}

export default function ResoLogixDashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
