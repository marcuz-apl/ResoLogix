'use client';

import React from 'react';
import { FileDown, Camera, Presentation, FileText, Folder, Cloud, Mail, Activity } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function ReportGenerator() {
  const {
    simResults,
    reportFormat,
    setReportFormat,
    reportReserveProfile,
    setReportReserveProfile,
    reportParamsResults,
    setReportParamsResults,
    reportGeologicalRisk,
    setReportGeologicalRisk,
    reportPlots,
    setReportPlots,
    includeSecondary,
    reportDestination,
    setReportDestination,
    localFolderPath,
    setLocalFolderPath,
    cloudDrivePath,
    setCloudDrivePath,
    emailRecipient,
    setEmailRecipient,
    isGeneratingReport,
    generationStep,
    generationLogs,
    generationComplete,
    generatedFileDetails,
    handleImplementTask,
    calculatedPg
  } = useDashboard();

  if (!simResults) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 border border-card-border/50 bg-card/40 relative overflow-hidden mt-6">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/0 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 pb-3 border-b border-card-border/60">
        <FileDown className="w-5 h-5 text-purple-400" />
        <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">
          Evaluation Reporting Suite
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Form: Format & Checkboxes (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Format Selector Radio Cards */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              Select Report Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Option 1: Snapshot */}
              <div
                onClick={() => setReportFormat('snapshot')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                  reportFormat === 'snapshot'
                    ? 'bg-purple-950/20 border-purple-500 text-purple-400 shadow shadow-purple-950/25'
                    : 'bg-panel/40 border-card-border/60 text-text-secondary hover:border-purple-500/30 hover:bg-panel/60'
                }`}
              >
                <Camera className="w-4 h-4 mb-2 shrink-0" />
                <span className="text-xs font-bold leading-tight">Take Image Snapshots</span>
              </div>

              {/* Option 2: PDF */}
              <div
                onClick={() => setReportFormat('pdf')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                  reportFormat === 'pdf'
                    ? 'bg-purple-950/20 border-purple-500 text-purple-400 shadow shadow-purple-950/25'
                    : 'bg-panel/40 border-card-border/60 text-text-secondary hover:border-purple-500/30 hover:bg-panel/60'
                }`}
              >
                <FileDown className="w-4 h-4 mb-2 shrink-0" />
                <span className="text-xs font-bold leading-tight">Generate PDF Reports</span>
              </div>

              {/* Option 3: PPTX */}
              <div
                onClick={() => setReportFormat('pptx')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                  reportFormat === 'pptx'
                    ? 'bg-purple-950/20 border-purple-500 text-purple-400 shadow shadow-purple-950/25'
                    : 'bg-panel/40 border-card-border/60 text-text-secondary hover:border-purple-500/30 hover:bg-panel/60'
                }`}
              >
                <Presentation className="w-4 h-4 mb-2 shrink-0" />
                <span className="text-xs font-bold leading-tight">Create PPTX Slides</span>
              </div>

              {/* Option 4: Word */}
              <div
                onClick={() => setReportFormat('word')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition-all duration-300 ${
                  reportFormat === 'word'
                    ? 'bg-purple-950/20 border-purple-500 text-purple-400 shadow shadow-purple-950/25'
                    : 'bg-panel/40 border-card-border/60 text-text-secondary hover:border-purple-500/30 hover:bg-panel/60'
                }`}
              >
                <FileText className="w-4 h-4 mb-2 shrink-0" />
                <span className="text-xs font-bold leading-tight">Draft Word Reports</span>
              </div>

            </div>
          </div>

          {/* Content Section Checkboxes */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              Select Content Sections
            </label>
            
            <div className="flex flex-col gap-2.5 bg-panel/30 border border-card-border/40 p-3 rounded-xl">
              
              {/* Checkbox 1: Reserve Profile */}
              <label className="flex items-start gap-3 cursor-pointer group text-xs text-text-secondary hover:text-text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={reportReserveProfile}
                  onChange={(e) => setReportReserveProfile(e.target.checked)}
                  className="mt-0.5 rounded border-card-border bg-background text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Reserve Profile</span>
                  <span className="text-[10px] text-text-muted">Normally ignored (defaults to inactive)</span>
                </div>
              </label>

              {/* Checkbox 2: Parameters & Results */}
              <label className="flex items-start gap-3 cursor-pointer group text-xs text-text-secondary hover:text-text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={reportParamsResults}
                  onChange={(e) => setReportParamsResults(e.target.checked)}
                  className="mt-0.5 rounded border-card-border bg-background text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Reserve Parameters and Evaluation Results</span>
                  <span className="text-[10px] text-text-muted">
                    P10, MEAN, P50, and P90 volumetric values.
                    {reportFormat === 'pptx' ? (
                      <span className="text-purple-400 font-semibold block mt-0.5">
                        ★ PPTX Format: Transposed with Percentiles as Rows for landscape slides.
                      </span>
                    ) : (
                      <span className="text-cyan-400 font-semibold block mt-0.5">
                        ★ PDF/Word Format: Rendered with Percentiles as Columns for portrait pages.
                      </span>
                    )}
                  </span>
                </div>
              </label>

              {/* Checkbox 3: Geological Risk */}
              <label className="flex items-start gap-3 cursor-pointer group text-xs text-text-secondary hover:text-text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={reportGeologicalRisk}
                  onChange={(e) => setReportGeologicalRisk(e.target.checked)}
                  className="mt-0.5 rounded border-card-border bg-background text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Geological Risk Inputs and Results</span>
                  <span className="text-[10px] text-text-muted">Includes individual 5 factor percentages and calculated final Pg ({ (calculatedPg * 100).toFixed(1) }%)</span>
                </div>
              </label>

              {/* Checkbox 4: Plots */}
              <label className="flex items-start gap-3 cursor-pointer group text-xs text-text-secondary hover:text-text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={reportPlots}
                  onChange={(e) => setReportPlots(e.target.checked)}
                  className="mt-0.5 rounded border-card-border bg-background text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Probability Distributions plots</span>
                  <span className="text-[10px] text-text-muted font-medium">
                    Includes CDF Exceedance and PDF Frequency plots.
                    <span className="text-text-secondary font-bold block mt-0.5">
                      {includeSecondary ? '4 charts: Primary & Secondary Products (Solution Gas/Condensate)' : '2 charts: Primary Product Only (Secondary Disabled)'}
                    </span>
                  </span>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Right Form: Destinations & Implement Button (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5 bg-panel/15 border border-card-border/40 p-4 rounded-xl relative">
          
          <div className="flex flex-col gap-4">
            {/* Destination Tab Switcher */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                Report Save Destination
              </label>
              <div className="flex bg-background border border-card-border/80 rounded-xl p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setReportDestination('local')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reportDestination === 'local'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Local</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportDestination('cloud')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reportDestination === 'cloud'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloud</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportDestination('email')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    reportDestination === 'email'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Destination Specific Inputs */}
            <div className="flex flex-col gap-2 bg-background/50 border border-card-border/40 p-3 rounded-lg min-h-[90px] justify-center">
              {reportDestination === 'local' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Local folder path</label>
                  <input
                    type="text"
                    value={localFolderPath}
                    onChange={(e) => setLocalFolderPath(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 font-semibold"
                  />
                  <span className="text-[9px] text-text-muted">Target directory on your local workspace system.</span>
                </div>
              )}
              {reportDestination === 'cloud' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Cloud storage folder</label>
                  <input
                    type="text"
                    value={cloudDrivePath}
                    onChange={(e) => setCloudDrivePath(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 font-semibold"
                  />
                  <span className="text-[9px] text-text-muted">Saves to Google Drive, Dropbox, or OneDrive folders.</span>
                </div>
              )}
              {reportDestination === 'email' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Recipient Email Address</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    className="w-full bg-background border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-purple-500 font-semibold"
                  />
                  <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                    ✓ Size limit under 8 MB: Attachment sent as a compressed ZIP.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Implement Task Button */}
          <button
            type="button"
            onClick={handleImplementTask}
            disabled={isGeneratingReport}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-950/20 hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 cursor-pointer text-center flex items-center justify-center gap-2"
          >
            <FileDown className={`w-4 h-4 shrink-0 ${isGeneratingReport ? 'animate-bounce' : ''}`} />
            <span>{isGeneratingReport ? 'Executing Report Build...' : 'Implement the Task'}</span>
          </button>

        </div>

      </div>

      {/* Progress Stepper & logs */}
      {(isGeneratingReport || generationComplete) && (
        <div className="mt-3 bg-panel/30 border border-card-border/50 rounded-xl p-4 flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Activity className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingReport ? 'animate-spin' : ''}`} />
              <span>Task Progress: {generationComplete ? 'Completed successfully!' : `Step ${generationStep} of 5`}</span>
            </span>
            {generationComplete && generatedFileDetails && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/25 border border-emerald-800/30 px-2.5 py-0.5 rounded-md">
                ZIP Bundle Generated ({generatedFileDetails.size})
              </span>
            )}
          </div>

          {/* Visual Progress Bar */}
          <div className="h-1.5 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${generationComplete ? 100 : (generationStep / 5) * 100}%` }}
            />
          </div>

          {/* Logs console */}
          <div className="h-28 overflow-y-auto bg-black/40 border border-card-border/30 rounded-lg p-2.5 font-mono text-[10px] text-text-muted flex flex-col gap-1">
            {generationLogs.map((log, i) => (
              <div key={i} className={log.includes('successfully') || log.includes('ZIP') ? 'text-emerald-400' : log.includes('Warning') ? 'text-amber-400 font-bold' : ''}>
                {log}
              </div>
            ))}
          </div>

          {/* Success Box */}
          {generationComplete && generatedFileDetails && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 text-xs text-text-secondary animate-fade-in">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-text-primary">Package Ready: {generatedFileDetails.name}</span>
                <span className="text-[10px] text-text-muted">
                  Saved destination: <span className="font-mono text-purple-400">{generatedFileDetails.path}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleImplementTask();
                }}
                className="shrink-0 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/25 transition-all text-[11px] font-bold cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Archive</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
