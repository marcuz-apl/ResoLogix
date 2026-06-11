import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, User, KeyRound, Loader2, CheckCircle } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { data: session, update } = useSession();
  const [name, setName] = useState((session?.user as any)?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = { name };
      if (newPassword) {
        if (!currentPassword) {
          throw new Error('Please enter your current password to set a new one.');
        }
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('Profile updated successfully!');
      
      // Update session locally to reflect name change immediately
      await update({ name });

      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl shadow-cyan-900/20 border border-card-border overflow-hidden">
        <div className="p-6 border-b border-card-border flex justify-between items-center bg-background/50">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            User Profile
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && <div className="p-3 rounded bg-red-900/30 border border-red-800/50 text-red-200 text-sm">{error}</div>}
          {success && <div className="p-3 rounded bg-emerald-900/30 border border-emerald-800/50 text-emerald-200 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4"/>{success}</div>}

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Your Name"
              required
            />
          </div>

          <div className="border-t border-card-border pt-5">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Change Password (Optional)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter new password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
