'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, Trash2, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/dashboard/Header';
import { DashboardProvider } from '@/components/dashboard/DashboardContext';

interface User {
  id: string;
  email: string;
  is_admin: number;
  needs_password_change: number;
  created_at: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tempPasswordModal, setTempPasswordModal] = useState<{ email: string, password: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !(session.user as any).isAdmin) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdmin = async (id: string, currentStatus: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_admin' })
      });
      if (!res.ok) throw new Error('Failed to update role');
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
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!session || !(session.user as any).isAdmin) return null;

  return (
    <DashboardProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text-primary">Admin Control Panel</h1>
            <p className="text-sm font-bold text-text-secondary mt-1">Manage users and platform roles.</p>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 hover:bg-card-border/50 rounded-xl transition-colors text-text-secondary hover:text-text-primary text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to main App</span>
          </Link>
        </div>

        {error && <div className="p-4 mb-6 bg-rose-950/30 border border-rose-500/50 text-rose-400 rounded-xl font-bold">{error}</div>}

        <div className="bg-card border border-card-border rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border bg-background/50 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-table-hover/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-primary">{user.email}</span>
                        <span className="text-[10px] text-text-secondary font-mono">{user.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-text-secondary">
                      {new Date(user.created_at.replace(' ', 'T') + 'Z').toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        user.is_admin === 1 ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-background border border-card-border text-text-secondary'
                      }`}>
                        {user.is_admin === 1 ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {user.is_admin === 1 ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.needs_password_change === 1 ? (
                        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Pending Reset</span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Active</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            user.is_admin === 1 ? 'bg-purple-950/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' : 'bg-card border-card-border text-text-secondary hover:text-purple-400 hover:border-purple-500/40'
                          }`}
                          title={user.is_admin === 1 ? "Demote to User" : "Promote to Admin"}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => resetPassword(user.id, user.email)}
                          className="p-1.5 rounded-lg border bg-card border-card-border text-text-secondary hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                          title="Force Password Reset"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        {(session?.user as any).id !== user.id && (
                          <button 
                            onClick={() => deleteUser(user.id, user.email)}
                            className="p-1.5 rounded-lg border bg-card border-card-border text-text-secondary hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                            title="Delete User & Scenarios"
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
        </div>
      </main>

      {/* Temp Password Reveal Modal for Local Dev/Admin convenience */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-card border border-card-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-black text-amber-500 mb-2">Password Reset Successful</h3>
            <p className="text-sm font-bold text-text-secondary mb-4">
              A new temporary password has been generated for {tempPasswordModal.email}. 
              If email delivery is not configured, share this password with the user securely:
            </p>
            <div className="bg-background border border-card-border py-3 px-4 rounded-xl font-mono font-bold text-lg tracking-widest text-text-primary mb-6 select-all">
              {tempPasswordModal.password}
            </div>
            <button 
              onClick={() => setTempPasswordModal(null)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
    </DashboardProvider>
  );
}
