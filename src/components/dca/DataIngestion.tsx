import React, { useState, useRef } from 'react';
import { Upload, ClipboardPaste, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Point } from '@/lib/dca-engine';

interface DataIngestionProps {
  onDataLoaded: (data: Point[]) => void;
}

export default function DataIngestion({ onDataLoaded }: DataIngestionProps) {
  const [pasteData, setPasteData] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseData = (rawText: string) => {
    try {
      const lines = rawText.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error('Not enough rows. Please include a header and at least one data row.');

      const parsed: Point[] = [];
      // Assuming columns are Time (days or months) and Rate
      // We will try to parse line by line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/[\t,;]+/); // Handles CSV and TSV (Excel copy-paste)
        if (parts.length >= 2) {
          const t = parseFloat(parts[0]);
          const q = parseFloat(parts[1]);
          if (!isNaN(t) && !isNaN(q)) {
            parsed.push({ t, q });
          }
        }
      }

      if (parsed.length === 0) throw new Error('No valid numeric data found.');
      
      // Sort by time just in case
      parsed.sort((a, b) => a.t - b.t);
      onDataLoaded(parsed);
      setError('');
      setPasteData('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasteSubmit = () => {
    parseData(pasteData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        parseData(event.target.result);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-card/40 border border-card-border p-6 rounded-2xl shadow-xl flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <FileSpreadsheet className="w-5 h-5 text-cyan-500" />
        <h2 className="text-lg font-bold text-text-primary">Historical Data Ingestion</h2>
      </div>

      {error && <div className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-500/20">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paste Area */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <ClipboardPaste className="w-4 h-4" /> Paste from Excel
          </label>
          <textarea 
            className="w-full h-32 bg-background border border-card-border rounded-xl p-3 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none text-text-primary resize-none placeholder-text-muted/50"
            placeholder={"Time\tRate\n1\t500\n2\t480\n..."}
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
          />
          <button 
            onClick={handlePasteSubmit}
            disabled={!pasteData.trim()}
            className="py-2 px-4 bg-card border border-card-border hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-500 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load Pasted Data
          </button>
        </div>

        {/* Upload Area */}
        <div className="flex flex-col gap-3 justify-start">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload CSV File
          </label>
          <div className="border-2 border-dashed border-card-border hover:border-cyan-500/50 rounded-xl h-32 flex flex-col items-center justify-center gap-2 transition-colors relative cursor-pointer overflow-hidden bg-background/50 group">
            <input 
              type="file" 
              accept=".csv,.txt"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />
            <Upload className="w-6 h-6 text-text-muted group-hover:text-cyan-400 transition-colors" />
            <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">Drag & Drop or Click to Browse</span>
            <span className="text-xs text-text-muted text-center px-4">CSV format: Time (col 1), Rate (col 2)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
