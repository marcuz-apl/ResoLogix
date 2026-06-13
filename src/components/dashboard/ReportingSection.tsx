'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function ReportingSection() {
  const dashboardCtx = useDashboard();
  const { 
    activeName, fluidType, includeSecondary, tableData, riskFactors, calculatedPg, 
    primaryExceedanceRef, primaryPdfRef, secondaryExceedanceRef, secondaryPdfRef,
    country, geolBasin, playType, reservoirAge, lithology, depoEnv, expStage, terrain, laheeClass, typeWell
  } = dashboardCtx;

  const [destination, setDestination] = useState<'local' | 'cloud' | 'email'>('local');
  const [emailAddress, setEmailAddress] = useState('');
  const [cloudUrl, setCloudUrl] = useState('');

  const [isExpanded, setIsExpanded] = useState(true);

  // Formats
  const [formats, setFormats] = useState({
    excel: true,
    images: true,
    pptx: true,
    word: true,
    pdf: true,
  });

  // Content
  const [contents, setContents] = useState({
    profile: false,
    results: true,
    risk: true,
    plots: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [previewReady, setPreviewReady] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const resetTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCreateReports = async () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setIsGenerating(true);
    setPreviewReady(false);
    setDownloadReady(false);
    setLogs([]);
    setJobId(null);

    // 1. Gather Chart Images
    const images: any = {};
    if (contents.plots) {
      if (primaryExceedanceRef?.current) images.primaryCdf = primaryExceedanceRef.current.toBase64Image();
      if (primaryPdfRef?.current) images.primaryPdf = primaryPdfRef.current.toBase64Image();
      if (includeSecondary) {
        if (secondaryExceedanceRef?.current) images.secondaryCdf = secondaryExceedanceRef.current.toBase64Image();
        if (secondaryPdfRef?.current) images.secondaryPdf = secondaryPdfRef.current.toBase64Image();
      }
    }

    try {
        setLogs(prev => [...prev, '[Info] Beginning generation process...']);
        
        if (destination === 'email' && !emailAddress) {
          throw new Error("Please provide an email address.");
        }
        if (destination === 'cloud' && !cloudUrl) {
          throw new Error("Please provide a Cloud Drive URL/Folder ID.");
        }

        const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formats,
          contents,
          activeName,
          oldJobId: jobId, // Tell server to delete the previous one
          destination,
          destinationConfig: { email: emailAddress, cloud: cloudUrl },
          data: { 
            fluidType,
            tableData, 
            riskFactors, 
            calculatedPg,
            profileData: {
              country, geolBasin, playType, reservoirAge, lithology, depoEnv, expStage, terrain, laheeClass, typeWell
            }
          },
          images
        })
      });

      if (!response.body) throw new Error('ReadableStream not supported by browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE lines
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          
          if (chunk.startsWith('data: ')) {
            try {
              const data = JSON.parse(chunk.slice(6));
              if (data.message) {
                setLogs(prev => [...prev, data.message]);
              }
              if (data.complete) {
                setJobId(data.downloadId);
                setLogs(prev => [
                  ...prev,
                  'Reports are generated and ready to preview! Click Finalize & Download when done.'
                ]);
                setIsGenerating(false);
                setPreviewReady(true);
              }
              if (data.error) {
                setLogs(prev => [...prev, `[Error] ${data.error}`]);
                setIsGenerating(false);
              }
            } catch (err) {
              console.error('Failed to parse SSE data', chunk);
            }
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
    } catch (error: any) {
      setLogs(prev => [...prev, `[Error] Failed to communicate with server: ${error.message}`]);
      setIsGenerating(false);
    }
  };

  const handleDispatch = async () => {
    if (!jobId) return;
    setIsDispatching(true);
    setLogs(prev => [...prev, '[Info] Packaging and preparing for delivery...']);
    try {
      const response = await fetch('/api/reports/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          destination,
          destinationConfig: { email: emailAddress, cloud: cloudUrl },
          activeName
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setLogs(prev => [
        ...prev, 
        `[Success] ${data.message}`, 
        'The temporary files will be cleaned up in 10 minutes.',
        'The "Create Reports" button will be available again in 2 minutes.'
      ]);
      setDownloadReady(true);
      
      // Set up the 2 minute reset timer
      resetTimerRef.current = setTimeout(async () => {
        // Ping server to clean up the leftovers
        try {
          await fetch('/api/reports/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId })
          });
        } catch (e) {
          console.error('Failed to cleanup reports on server', e);
        }

        setPreviewReady(false);
        setJobId(null);
        setLogs(prev => [...prev, '[Info] You can now create new reports. The previous ones will be overwritten.']);
      }, 120000); // 2 minutes
      
      if (destination === 'local') {
        window.location.href = `/api/reports/download?jobId=${jobId}`;
      }
    } catch (error: any) {
      setLogs(prev => [...prev, `[Error] ${error.message}`]);
    }
    setIsDispatching(false);
  };

  const handleDownload = () => {
    if (jobId) {
      window.location.href = `/api/reports/download?jobId=${jobId}`;
    }
  };

  return (
    <section className="glass-panel p-6 rounded-2xl flex flex-col gap-6 mt-6 border border-card-border/50">
      <div 
        className="flex items-center justify-between pb-3 border-b border-card-border/60 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-primary">
            Evaluation Reporting
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted" />
        )}
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Destination Options */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Destination</h3>
          <div className="flex flex-col gap-2 mt-1">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
              <input type="radio" name="destination" checked={destination === 'local'} onChange={() => setDestination('local')} className="accent-cyan-500 w-4 h-4" />
              Save Locally (ZIP Download)
            </label>

            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
              <input type="radio" name="destination" checked={destination === 'email'} onChange={() => setDestination('email')} className="accent-cyan-500 w-4 h-4" />
              Send via Email
            </label>
            {destination === 'email' && (
              <input 
                type="email" 
                placeholder="recipient@example.com" 
                value={emailAddress}
                onChange={e => setEmailAddress(e.target.value)}
                className="ml-7 bg-background border border-card-border rounded-md px-2 py-1 text-xs text-text-primary focus:border-cyan-500 outline-none"
              />
            )}
          </div>
        </div>

        {/* Output Formats */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Output Formats</h3>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
              <input type="checkbox" checked={formats.excel} onChange={(e) => setFormats({...formats, excel: e.target.checked})} disabled={isGenerating || previewReady} className="accent-cyan-500 w-4 h-4 rounded" />
              Excel Data Tables
            </label>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
              <input type="checkbox" checked={formats.images} onChange={(e) => setFormats({ ...formats, images: e.target.checked })} disabled={isGenerating || previewReady} className="accent-cyan-500 w-4 h-4 rounded" />
              PNG Image Snapshots
            </label>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
              <input type="checkbox" checked={formats.pptx} onChange={(e) => setFormats({...formats, pptx: e.target.checked})} disabled={isGenerating || previewReady} className="accent-cyan-500 w-4 h-4 rounded" />
              PPTX Slides
            </label>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
              <input type="checkbox" checked={formats.word} onChange={(e) => setFormats({...formats, word: e.target.checked})} disabled={isGenerating || previewReady} className="accent-cyan-500 w-4 h-4 rounded" />
              Word Report
            </label>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
              <input type="checkbox" checked={formats.pdf} onChange={(e) => setFormats({...formats, pdf: e.target.checked})} disabled={isGenerating || previewReady} className="accent-cyan-500 w-4 h-4 rounded" />
              PDF Report
            </label>
            {previewReady && (
              <a href={`/api/reports/preview?jobId=${jobId}&format=pdf`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] bg-cyan-950/40 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 hover:bg-cyan-500/20 transition cursor-pointer">
                👁️ Preview
              </a>
            )}
          </div>
        </div>

        {/* Content Included */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Content Included</h3>
          <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
            <input type="checkbox" checked={contents.profile} onChange={(e) => setContents({ ...contents, profile: e.target.checked })} className="accent-cyan-500 w-4 h-4 rounded" />
            Resource Profile
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
            <input type="checkbox" checked={contents.results} onChange={(e) => setContents({ ...contents, results: e.target.checked })} className="accent-cyan-500 w-4 h-4 rounded" />
            Parameters & Results
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
            <input type="checkbox" checked={contents.risk} onChange={(e) => setContents({ ...contents, risk: e.target.checked })} className="accent-cyan-500 w-4 h-4 rounded" />
            Geological Risk
          </label>
          <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
            <input type="checkbox" checked={contents.plots} onChange={(e) => setContents({ ...contents, plots: e.target.checked })} className="accent-cyan-500 w-4 h-4 rounded" />
            Probability Distribution Plots
          </label>
        </div>
      </div>

      {/* Action Area & Logs */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4 pt-6 border-t border-card-border/40">
        <div className="flex-1 flex flex-col gap-3">
          <div className="bg-background/80 border border-card-border/50 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs flex flex-col gap-1">
            {logs.length === 0 ? (
              <span className="text-text-muted opacity-50 italic">Ready to generate reports. Waiting for input...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-cyan-500/50">&gt;</span>
                  <span className={log.includes('Completed') || log.includes('Stay alive') ? 'text-emerald-400 font-bold' : 'text-text-secondary'}>
                    {log}
                  </span>
                </div>
              ))
            )}
            {isGenerating && (
              <div className="flex gap-2 animate-pulse mt-1">
                <span className="text-cyan-500/50">&gt;</span>
                <span className="text-cyan-400">Processing...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-64 shrink-0">
          <button
            onClick={handleCreateReports}
            disabled={isGenerating || previewReady}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              isGenerating || previewReady
                ? 'bg-panel text-text-muted cursor-not-allowed border border-card-border'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/30 border border-cyan-500/50'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                Working...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Create Reports
              </>
            )}
          </button>

          <button
            onClick={downloadReady && destination === 'local' ? handleDownload : handleDispatch}
            disabled={!previewReady && !downloadReady && !isDispatching}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              (!previewReady && !downloadReady && !isDispatching)
                ? 'bg-panel text-text-muted cursor-not-allowed border border-card-border'
                : downloadReady
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 border border-emerald-500/50 animate-pulse-subtle'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 border border-blue-500/50 animate-pulse-subtle'
            }`}
          >
            {isDispatching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                Packaging...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {downloadReady ? 'Deliver Again' : 'Finalize & Deliver'}
              </>
            )}
          </button>
        </div>
      </div>
        </>
      )}
    </section>
  );
}
