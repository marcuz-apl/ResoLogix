'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ShieldAlert, Trash2, KeyRound, Loader2, Users, Database, Activity, Play, Table as TableIcon, Edit, Check, X, ArrowLeft } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import { DashboardProvider } from '@/components/dashboard/DashboardContext';

interface User {
  id: string;
  email: string;
  name?: string;
  last_login?: string;
  is_admin: number;
  is_superadmin: number;
  needs_password_change: number;
  created_at: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'users' | 'database' | 'system'>('users');

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [tempPasswordModal, setTempPasswordModal] = useState<{ email: string, password: string } | null>(null);

  // Database State
  const [tables, setTables] = useState<string[]>([]);
  const [dbMode, setDbMode] = useState<'viewer' | 'sql'>('viewer');
  
  // -- Raw SQL State
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState('');
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  // -- Viewer State
  const [selectedTable, setSelectedTable] = useState('');
  const [viewerRows, setViewerRows] = useState<any[]>([]);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState('');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<any>(null);

  // System State
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !(session.user as any).isAdmin) {
      router.push('/');
      return;
    }

    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'database') fetchTables();
    if (activeTab === 'system') fetchSystemInfo();

  }, [session, status, router, activeTab]);

  // --- Users Logic ---
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const toggleRole = async (id: string, action: 'toggle_admin' | 'toggle_superadmin') => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetPassword = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to reset the password for ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setTempPasswordModal({ email, password: data.tempPassword });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteUser = async (id: string, email: string) => {
    if ((session?.user as any).id === id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!confirm(`WARNING: Deleting ${email} will also permanently delete all their scenarios. Are you completely sure?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Database Logic ---
  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/database');
      const data = await res.json();
      if (data.tables) {
        const tNames = data.tables.map((t: any) => t.name).filter((name: string) => !name.startsWith('sqlite_'));
        setTables(tNames);
        if (tNames.length > 0 && !selectedTable) setSelectedTable(tNames[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Raw SQL Console
  const executeQuery = async (queryToRun: string = sqlQuery) => {
    if (!queryToRun.trim()) return;
    setIsExecutingSql(true);
    setSqlError('');
    setSqlResult(null);
    try {
      const res = await fetch('/api/admin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToRun })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      setSqlResult(data);
    } catch (err: any) {
      setSqlError(err.message);
    } finally {
      setIsExecutingSql(false);
    }
  };

  // Form Based Viewer
  const fetchViewerRows = async (table: string) => {
    if (!table) return;
    setSelectedTable(table);
    setViewerLoading(true);
    setViewerError('');
    setEditingRowIndex(null);
    try {
      const res = await fetch('/api/admin/database/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SELECT', table })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setViewerRows(data.rows || []);
    } catch (err: any) {
      setViewerError(err.message);
      setViewerRows([]);
    } finally {
      setViewerLoading(false);
    }
  };

  const getPrimaryKeyName = (table: string) => table === 'risk_factors' ? 'evaluation_id' : 'id';

  const saveRow = async (index: number) => {
    setViewerLoading(true);
    try {
      const pk = getPrimaryKeyName(selectedTable);
      const rowId = viewerRows[index][pk];
      const res = await fetch('/api/admin/database/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE', table: selectedTable, id: rowId, data: editingRowData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditingRowIndex(null);
      fetchViewerRows(selectedTable);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setViewerLoading(false);
    }
  };

  const deleteRow = async (index: number) => {
    if (!confirm('Are you sure you want to delete this row? This cannot be undone.')) return;
    setViewerLoading(true);
    try {
      const pk = getPrimaryKeyName(selectedTable);
      const rowId = viewerRows[index][pk];
      const res = await fetch('/api/admin/database/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', table: selectedTable, id: rowId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchViewerRows(selectedTable);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setViewerLoading(false);
    }
  };

  // --- System Logic ---
  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/admin/system');
      const data = await res.json();
      setSystemInfo(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#070a13] flex items-center justify-center text-cyan-400"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isSuperAdmin = (session?.user as any)?.isSuperAdmin;

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#070a13] text-[#f8fafc] font-sans flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex gap-8">
          
          {/* Sidebar */}
          <aside className="w-64 shrink-0 flex flex-col gap-2">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-3">Admin Panel</h2>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'users' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/50' : 'text-text-secondary hover:bg-card-border/30 hover:text-text-primary'}`}
            >
              <Users className="w-5 h-5" /> Users & Roles
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'database' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/50' : 'text-text-secondary hover:bg-card-border/30 hover:text-text-primary'}`}
            >
              <Database className="w-5 h-5" /> Database
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'system' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/50' : 'text-text-secondary hover:bg-card-border/30 hover:text-text-primary'}`}
            >
              <Activity className="w-5 h-5" /> System Perf
            </button>

            <div className="h-px bg-card-border my-2 mx-3"></div>
            
            <Link 
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm text-text-muted hover:bg-card-border/30 hover:text-cyan-400"
            >
              <ArrowLeft className="w-5 h-5" /> Return to main App
            </Link>
          </aside>

          {/* Content Area */}
          <div className="flex-1 glass-panel p-6 rounded-2xl border border-card-border flex flex-col gap-6 overflow-hidden">
            
            {/* USERS TAB */}
            {activeTab === 'users' && (
              <>
                <div className="flex justify-between items-center border-b border-card-border pb-4">
                  <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-purple-400" /> User Management
                  </h1>
                </div>

                {error && <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-card-border text-xs text-text-muted uppercase tracking-wider">
                        <th className="pb-3 pr-4 font-semibold">User / Email</th>
                        <th className="pb-3 px-4 font-semibold">Role</th>
                        <th className="pb-3 px-4 font-semibold">Status</th>
                        <th className="pb-3 px-4 font-semibold">Last Login</th>
                        <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-card-border/50 hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-4">
                            <div className="font-bold text-text-primary">{u.name || u.email.split('@')[0]}</div>
                            <div className="text-xs text-text-muted">{u.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            {u.is_superadmin === 1 ? (
                               <span className="bg-fuchsia-900/30 text-fuchsia-400 border border-fuchsia-500/30 px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5"><Shield className="w-3 h-3" /> SuperAdmin</span>
                            ) : u.is_admin === 1 ? (
                              <span className="bg-purple-900/30 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5"><Shield className="w-3 h-3" /> Admin</span>
                            ) : (
                              <span className="bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-md text-xs font-bold">User</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {u.needs_password_change === 1 ? (
                              <span className="text-amber-400 text-xs font-semibold">Needs Password Reset</span>
                            ) : (
                              <span className="text-emerald-400 text-xs font-semibold">Active</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-text-muted text-xs whitespace-nowrap">
                            {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {/* Only SuperAdmins can promote/demote SuperAdmins */}
                              {isSuperAdmin && u.email !== session?.user?.email && (
                                <button
                                  onClick={() => toggleRole(u.id, 'toggle_superadmin')}
                                  className="text-[10px] px-2 py-1 rounded bg-background border border-card-border text-text-secondary hover:text-fuchsia-400 hover:border-fuchsia-500/50 transition-colors font-semibold"
                                >
                                  {u.is_superadmin ? '- SuperAdmin' : '+ SuperAdmin'}
                                </button>
                              )}
                              
                              {/* SuperAdmins can promote/demote anyone to Admin. Regular Admins can only promote Users, cannot modify Admins */}
                              {u.email !== session?.user?.email && !u.is_superadmin && (isSuperAdmin || !u.is_admin) && (
                                <button
                                  onClick={() => toggleRole(u.id, 'toggle_admin')}
                                  className="text-[10px] px-2 py-1 rounded bg-background border border-card-border text-text-secondary hover:text-purple-400 hover:border-purple-500/50 transition-colors font-semibold"
                                >
                                  {u.is_admin ? '- Admin' : '+ Admin'}
                                </button>
                              )}
                              
                              {/* Regular Admins cannot reset passwords for other Admins */}
                              {(isSuperAdmin || (!u.is_admin && !u.is_superadmin) || u.email === session?.user?.email) && (
                                <button
                                  onClick={() => resetPassword(u.id, u.email)}
                                  title="Reset Password"
                                  className="p-1.5 rounded bg-background border border-card-border text-text-secondary hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>
                              )}
                              
                              {/* Only SuperAdmins can delete users entirely */}
                              {isSuperAdmin && u.email !== session?.user?.email && (
                                <button
                                  onClick={() => deleteUser(u.id, u.email)}
                                  title="Delete User"
                                  className="p-1.5 rounded bg-background border border-card-border text-text-secondary hover:text-rose-400 hover:border-rose-500/50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Temp Password Modal */}
                {tempPasswordModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl shadow-cyan-900/20 border border-card-border p-6 flex flex-col gap-4">
                      <h2 className="text-xl font-bold text-text-primary">Password Reset Successful</h2>
                      <p className="text-sm text-text-secondary">
                        The password for <strong>{tempPasswordModal.email}</strong> has been reset. Please provide them with this temporary password:
                      </p>
                      <div className="bg-background border border-cyan-800 p-4 rounded-xl text-center">
                        <span className="font-mono text-2xl tracking-widest text-cyan-400 font-bold select-all">
                          {tempPasswordModal.password}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted text-center">They will be forced to change this upon next login.</p>
                      <button
                        onClick={() => setTempPasswordModal(null)}
                        className="mt-2 bg-card-border hover:bg-card-border/80 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* DATABASE TAB */}
            {activeTab === 'database' && (
              <>
                <div className="flex justify-between items-center border-b border-card-border pb-4">
                  <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Database className="w-6 h-6 text-cyan-400" /> Database Management
                  </h1>
                  
                  {isSuperAdmin && (
                    <div className="flex bg-background border border-card-border p-1 rounded-lg">
                      <button
                        onClick={() => setDbMode('viewer')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md ${dbMode === 'viewer' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-800/50' : 'text-text-muted hover:text-text-primary'}`}
                      >
                        Form Viewer
                      </button>
                      <button
                        onClick={() => setDbMode('sql')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md ${dbMode === 'sql' ? 'bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-800/50' : 'text-text-muted hover:text-text-primary'}`}
                      >
                        Raw SQL
                      </button>
                    </div>
                  )}
                </div>

                {dbMode === 'sql' && isSuperAdmin ? (
                  /* RAW SQL CONSOLE */
                  <>
                    <div className="flex gap-4 mb-2 flex-wrap">
                      {tables.map(t => (
                        <button key={t} onClick={() => {
                          setSqlQuery(`SELECT * FROM ${t} LIMIT 10`);
                        }} className="text-xs bg-background border border-card-border px-2 py-1 rounded text-cyan-400 hover:bg-cyan-900/20 transition-colors">
                          <TableIcon className="w-3 h-3 inline mr-1"/>{t}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="w-full h-32 bg-[#0d1117] border border-card-border rounded-xl p-4 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                        placeholder="Enter raw SQL query (e.g., SELECT * FROM users)"
                      />
                      <button
                        onClick={() => executeQuery()}
                        disabled={!sqlQuery.trim() || isExecutingSql}
                        className="absolute bottom-4 right-4 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg"
                      >
                        {isExecutingSql ? <Loader2 className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4"/>} Execute
                      </button>
                    </div>

                    {sqlError && (
                      <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-mono whitespace-pre-wrap">
                        {sqlError}
                      </div>
                    )}

                    {sqlResult && (
                      <div className="bg-[#0d1117] border border-card-border rounded-xl overflow-auto max-h-[500px]">
                        {sqlResult.isSelect ? (
                          sqlResult.result.length > 0 ? (
                            <table className="w-full text-left text-xs whitespace-nowrap">
                              <thead className="sticky top-0 bg-[#0d1117] border-b border-card-border shadow">
                                <tr>
                                  {Object.keys(sqlResult.result[0]).map((key) => (
                                    <th key={key} className="px-4 py-2 font-bold text-cyan-400 uppercase tracking-wider">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sqlResult.result.map((row: any, i: number) => (
                                  <tr key={i} className="border-b border-card-border/30 hover:bg-white/[0.02]">
                                    {Object.values(row).map((val: any, j: number) => (
                                      <td key={j} className="px-4 py-2 text-text-secondary">{String(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="p-4 text-sm text-text-muted">Query returned 0 rows.</div>
                          )
                        ) : (
                          <div className="p-4 font-mono text-sm text-emerald-400">
                            Query executed successfully. Changes: {sqlResult.result.changes}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* FORM BASED VIEWER */
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto pb-4 shrink-0 border-b border-card-border/50 mb-4">
                      {tables.map(t => (
                        <button 
                          key={t} 
                          onClick={() => fetchViewerRows(t)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors ${selectedTable === t ? 'bg-cyan-900/40 border-cyan-500/50 text-cyan-400' : 'bg-background border-card-border text-text-secondary hover:text-cyan-400'}`}
                        >
                          <TableIcon className="w-3.5 h-3.5 inline mr-1.5"/>{t}
                        </button>
                      ))}
                    </div>

                    {viewerError && <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">{viewerError}</div>}

                    <div className="flex-1 overflow-auto bg-[#0d1117]/50 border border-card-border rounded-xl">
                      {viewerLoading ? (
                        <div className="p-10 flex justify-center text-cyan-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
                      ) : viewerRows.length > 0 ? (
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="sticky top-0 bg-[#0d1117] border-b border-card-border shadow z-10">
                            <tr>
                              <th className="px-4 py-3 font-bold text-cyan-400 uppercase tracking-wider w-24">Actions</th>
                              {Object.keys(viewerRows[0]).map((key) => (
                                <th key={key} className="px-4 py-3 font-bold text-cyan-400 uppercase tracking-wider">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {viewerRows.map((row, i) => (
                              <tr key={i} className="border-b border-card-border/30 hover:bg-white/[0.02]">
                                <td className="px-4 py-2">
                                  {editingRowIndex === i ? (
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => saveRow(i)} className="text-emerald-400 hover:text-emerald-300 p-1 bg-emerald-900/20 rounded"><Check className="w-4 h-4"/></button>
                                      <button onClick={() => setEditingRowIndex(null)} className="text-rose-400 hover:text-rose-300 p-1 bg-rose-900/20 rounded"><X className="w-4 h-4"/></button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => { setEditingRowIndex(i); setEditingRowData({ ...row }); }} className="text-cyan-400 hover:text-cyan-300 p-1"><Edit className="w-3.5 h-3.5"/></button>
                                      <button onClick={() => deleteRow(i)} className="text-rose-400 hover:text-rose-300 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                                    </div>
                                  )}
                                </td>
                                {Object.keys(row).map((key) => {
                                  const isPk = key === getPrimaryKeyName(selectedTable);
                                  return (
                                    <td key={key} className="px-4 py-2">
                                      {editingRowIndex === i && !isPk ? (
                                        <input
                                          type="text"
                                          value={editingRowData[key] === null ? '' : editingRowData[key]}
                                          onChange={(e) => setEditingRowData({...editingRowData, [key]: e.target.value})}
                                          className="bg-background border border-cyan-800 rounded px-2 py-1 text-xs text-white w-full min-w-[100px]"
                                        />
                                      ) : (
                                        <span className="text-text-secondary truncate max-w-[200px] block" title={String(row[key])}>
                                          {row[key] === null ? <em className="text-text-muted">null</em> : String(row[key])}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-10 text-center text-text-muted text-sm">No data found in {selectedTable} or table not selected.</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SYSTEM TAB */}
            {activeTab === 'system' && (
              <>
                <div className="flex justify-between items-center border-b border-card-border pb-4">
                  <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Activity className="w-6 h-6 text-emerald-400" /> System Performance
                  </h1>
                  <button onClick={fetchSystemInfo} className="text-xs bg-card-border/50 hover:bg-card-border px-3 py-1.5 rounded-lg font-bold transition-colors">
                    Refresh
                  </button>
                </div>

                {!systemInfo ? (
                  <div className="flex items-center gap-2 text-text-muted text-sm"><Loader2 className="w-4 h-4 animate-spin"/> Loading metrics...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div className="bg-background/50 border border-card-border rounded-xl p-5 flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Platform</span>
                      <span className="text-lg font-mono text-cyan-400">{systemInfo.platform} {systemInfo.release}</span>
                    </div>
                    <div className="bg-background/50 border border-card-border rounded-xl p-5 flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">CPU Cores</span>
                      <span className="text-lg font-mono text-emerald-400">{systemInfo.cpus} Cores</span>
                    </div>
                    <div className="bg-background/50 border border-card-border rounded-xl p-5 flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">System Uptime</span>
                      <span className="text-lg font-mono text-purple-400">{(systemInfo.uptime / 3600).toFixed(2)} Hours</span>
                    </div>
                    <div className="bg-background/50 border border-card-border rounded-xl p-5 flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Memory Usage</span>
                      <span className="text-lg font-mono text-amber-400">{formatBytes(systemInfo.totalMem - systemInfo.freeMem)} / {formatBytes(systemInfo.totalMem)}</span>
                      <div className="w-full bg-card-border rounded-full h-1.5 mt-2">
                        <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${((systemInfo.totalMem - systemInfo.freeMem) / systemInfo.totalMem) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-background/50 border border-card-border rounded-xl p-5 flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Node Process Uptime</span>
                      <span className="text-lg font-mono text-pink-400">{(systemInfo.processUptime / 60).toFixed(2)} Mins</span>
                    </div>
                    <div className="bg-background/50 border border-card-border rounded-xl p-5 flex flex-col gap-1">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Node Memory (RSS)</span>
                      <span className="text-lg font-mono text-blue-400">{formatBytes(systemInfo.processMemory.rss)}</span>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
