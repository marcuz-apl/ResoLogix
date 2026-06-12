'use client';

import React, { useState } from 'react';
import { Plus, Check, Save, FolderOpen, Trash2, Sliders, RefreshCw, Copy, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Sidebar() {
  const {
    sidebarWidth,
    handleSidebarMouseDown,
    handleNewScenario,
    handleCopyScenario,
    handleSaveScenario,
    setShowAuthModal,
    isSaving,
    saveStatus,
    evaluations,
    isLoadingScenarios,
    activeId,
    loadScenario,
    handleDeleteScenario,
    iterations,
    setIterations,
    setSimResults,
    handleRunSimulation,
    isSimulating
  } = useDashboard();

  const { data: session } = useSession();

  const handleSaveClick = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    handleSaveScenario();
  };

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [showExamples, setShowExamples] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('resologix-show-examples');
    if (saved !== null) {
      setShowExamples(saved === 'true');
    }
  }, []);

  const toggleShowExamples = () => {
    const nextState = !showExamples;
    setShowExamples(nextState);
    localStorage.setItem('resologix-show-examples', String(nextState));
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const groupedEvaluations = evaluations.reduce((acc, ev) => {
    if ((ev as any).is_example && !showExamples) return acc;
    
    // Group examples in their own folder
    const folder = (ev as any).is_example ? 'Example Scenarios' : (ev.folder || 'Uncategorized');
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(ev);
    return acc;
  }, {} as Record<string, typeof evaluations>);
  
  const folders = Object.keys(groupedEvaluations).sort((a, b) => {
    if (a === 'Example Scenarios') return -1; // Examples always top
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      {/* Sidebar - Scenario Manager */}
      <aside 
        className="shrink-0 border-r border-card-border bg-sidebar p-5 flex flex-col gap-6"
        style={{ width: sidebarWidth }}
      >
        {/* MC Runs Dropdown and Run Sim Button */}
        <div className="flex flex-col gap-2.5 bg-card/45 border border-card-border/70 p-3.5 rounded-xl shrink-0">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>MC Runs:</span>
            </span>
            <select
              value={iterations}
              onChange={(e) => {
                setIterations(Number(e.target.value));
                setSimResults(null);
              }}
              className="bg-background border border-card-border rounded px-2 py-1 text-text-secondary font-semibold focus:outline-none focus:border-cyan-500 text-xs cursor-pointer"
            >
              <option value="5000">5,000</option>
              <option value="10000">10,000</option>
              <option value="20000">20,000</option>
              <option value="50000">50,000</option>
            </select>
          </div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>

        {/* New / Copy / Save Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={handleNewScenario}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs border border-dashed border-card-border text-text-secondary hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all duration-300 truncate cursor-pointer"
            title="New Evaluation Scenario"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">New</span>
          </button>

          <button
            onClick={handleCopyScenario}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs bg-card border border-card-border text-text-secondary hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-950/10 transition-all duration-200 truncate cursor-pointer"
            title="Copy Active Scenario"
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Copy</span>
          </button>
          
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer truncate ${
              saveStatus === 'success'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                : saveStatus === 'error'
                ? 'bg-rose-950 border-rose-500 text-rose-400'
                : 'bg-card border-card-border text-text-secondary hover:border-card-border hover:text-text-primary'
            }`}
            title="Save Scenario"
          >
            {saveStatus === 'success' ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isSaving ? 'Saving...' : 'Save'}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
            <span className="flex items-center gap-1.5 min-w-0">
              <FolderOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Saved Evaluations</span>
            </span>
            <div className="flex items-center gap-2">
              {session && (
                <button 
                  onClick={toggleShowExamples}
                  className="hover:text-cyan-400 transition-colors p-1"
                  title={showExamples ? "Hide Examples" : "Show Examples"}
                >
                  {showExamples ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              )}
              <span className="shrink-0">({evaluations.filter(e => showExamples || !(e as any).is_example).length})</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {isLoadingScenarios ? (
              <div className="text-text-muted text-xs text-center py-8">Loading scenarios...</div>
            ) : evaluations.length === 0 ? (
              <div className="text-text-muted text-xs text-center py-8">No saved scenarios. Create and save one!</div>
            ) : (
              folders.map((folder) => {
                const isExpanded = expandedFolders[folder] !== false; // Default expanded
                const folderEvals = groupedEvaluations[folder];
                return (
                  <div key={folder} className="flex flex-col gap-1 mb-2">
                    <div 
                      className="flex items-center gap-2 cursor-pointer text-text-primary hover:text-cyan-400 font-bold text-xs p-1"
                      onClick={() => toggleFolder(folder)}
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <span className="truncate">{folder}</span>
                      <span className="text-text-muted font-normal">({folderEvals.length})</span>
                    </div>
                    
                    {isExpanded && (
                      <div className="flex flex-col gap-2 pl-3 border-l-2 border-card-border/50 ml-1.5 mt-1">
                        {folderEvals.map((ev) => {
                          const isActive = ev.id === activeId;
                          return (
                            <div
                              key={ev.id}
                              onClick={() => loadScenario(ev)}
                              className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                                isActive
                                  ? 'bg-card border-cyan-500 shadow-md shadow-cyan-950/20'
                                  : 'bg-card/30 border-card-border hover:border-cyan-500/40 hover:bg-card/55'
                              }`}
                            >
                              <div className="font-semibold text-sm pr-6 text-text-primary group-hover:text-cyan-400 transition-colors duration-200 truncate">
                                {ev.name}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                {(ev as any).is_example && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/50">
                                    EXAMPLE
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                  ev.fluid_type === 'OIL' ? 'bg-green-50 dark:bg-green-950/30 text-green-500' : 'bg-red-50 dark:bg-red-950/30 text-red-500'
                                }`}>
                                  {ev.fluid_type}
                                </span>
                                <span className="text-[10px] text-text-muted truncate">
                                  {ev.updated_at ? (() => {
                                    // Append 'Z' and replace space with 'T' to ensure it's parsed as UTC, converting to local time
                                    const d = new Date(ev.updated_at.replace(' ', 'T') + 'Z');
                                    const pad = (n: number) => n.toString().padStart(2, '0');
                                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
                                  })() : ''}
                                </span>
                              </div>
                              {(!(ev as any).is_example || (session?.user as any)?.isSuperAdmin) && (
                                <button
                                  onClick={(e) => handleDeleteScenario(ev.id, e)}
                                  className="absolute top-3 right-3 text-text-muted hover:text-rose-400 p-1 rounded hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                  title="Delete Scenario"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar Resizer Handle Line */}
      <div 
        className="w-[3px] hover:w-[6px] cursor-col-resize bg-card-border/30 hover:bg-cyan-500/70 transition-all shrink-0 select-none z-20"
        onMouseDown={handleSidebarMouseDown}
      />
    </>
  );
}
