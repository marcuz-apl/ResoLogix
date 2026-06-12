'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, Save, FolderOpen, Trash2, ChevronDown, ChevronRight, Calculator, Eye, EyeOff } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface DcaSidebarProps {
  scenarios: any[];
  activeId: string | null;
  isLoading: boolean;
  onLoad: (scenario: any) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onNew: () => void;
  sidebarWidth: string;
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function DcaSidebar({
  scenarios,
  activeId,
  isLoading,
  onLoad,
  onDelete,
  onNew,
  sidebarWidth,
  onMouseDown
}: DcaSidebarProps) {
  const { data: session } = useSession();
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

  const groupedScenarios = scenarios.reduce((acc, s) => {
    if (s.is_example && !showExamples) return acc;
    
    // Group examples in their own folder
    const folder = s.is_example ? 'Example Scenarios' : (s.folder || 'Uncategorized');
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(s);
    return acc;
  }, {} as Record<string, typeof scenarios>);
  
  const folders = Object.keys(groupedScenarios).sort((a, b) => {
    if (a === 'Example Scenarios') return -1;
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      <aside 
        className="shrink-0 border-r border-card-border bg-[#070a13] p-5 flex flex-col gap-6"
        style={{ width: sidebarWidth }}
      >
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs border-2 border-dashed border-cyan-800/50 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500 hover:bg-cyan-950/30 transition-all duration-300 truncate cursor-pointer"
            title="New DCA Scenario"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">New DCA Scenario</span>
          </button>
        </div>

        {/* Scenario List */}
        <div className="flex flex-col gap-3 flex-1 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
            <span className="flex items-center gap-1.5 min-w-0">
              <FolderOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Saved Scenarios</span>
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
              <span className="shrink-0">({scenarios.filter(s => showExamples || !s.is_example).length})</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {isLoading ? (
              <div className="text-text-muted text-xs text-center py-8">Loading scenarios...</div>
            ) : scenarios.length === 0 ? (
              <div className="text-text-muted text-xs text-center py-8">No saved scenarios. Create and save one!</div>
            ) : (
              folders.map((folder) => {
                const isExpanded = expandedFolders[folder] !== false; // Default expanded
                const folderScenarios = groupedScenarios[folder];
                return (
                  <div key={folder} className="flex flex-col gap-1 mb-2">
                    <div 
                      className="flex items-center gap-2 cursor-pointer text-text-primary hover:text-cyan-400 font-bold text-xs p-1"
                      onClick={() => toggleFolder(folder)}
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <span className="truncate">{folder}</span>
                      <span className="text-text-muted font-normal">({folderScenarios.length})</span>
                    </div>
                    
                    {isExpanded && (
                      <div className="flex flex-col gap-2 pl-3 border-l-2 border-card-border/50 ml-1.5 mt-1">
                        {folderScenarios.map((scenario: any) => {
                          const isActive = scenario.id === activeId;
                          return (
                            <div
                              key={scenario.id}
                              onClick={() => onLoad(scenario)}
                              className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                                isActive
                                  ? 'bg-card border-cyan-500 shadow-md shadow-cyan-950/20'
                                  : 'bg-card/30 border-card-border hover:border-cyan-500/40 hover:bg-card/55'
                              }`}
                            >
                              <div className="font-semibold text-sm pr-6 text-text-primary group-hover:text-cyan-400 transition-colors duration-200 truncate">
                                {scenario.scenario_name}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                {scenario.is_example && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/50">
                                    EXAMPLE
                                  </span>
                                )}
                                <span className="text-[10px] text-text-muted truncate">
                                  {scenario.updated_at ? (() => {
                                    const d = new Date(scenario.updated_at.replace(' ', 'T') + 'Z');
                                    const pad = (n: number) => n.toString().padStart(2, '0');
                                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                                  })() : ''}
                                </span>
                              </div>
                              {(!scenario.is_example || (session?.user as any)?.isSuperAdmin) && (
                                <button
                                  onClick={(e) => onDelete(scenario.id, e)}
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
        onMouseDown={onMouseDown}
      />
    </>
  );
}
