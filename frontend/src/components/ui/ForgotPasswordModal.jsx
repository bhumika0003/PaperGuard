import React, { useState } from 'react';
import { KeyRound, Lock, User, AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';
import api from '../../services/api';
import { validateEmail } from '../../utils/emailValidator';

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [emailOrUserId, setEmailOrUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!emailOrUserId) {
      setError('Please enter your email address or User ID.');
      return;
    }

    if (emailOrUserId.includes('@')) {
      const emailCheck = validateEmail(emailOrUserId);
      if (!emailCheck.isValid) {
        setError(emailCheck.error);
        return;
      }
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        emailOrUserId,
        newPassword
      });

      if (res.data.success) {
        setSuccessMsg('Password reset successfully! Logging you in...');
        
        // Save token and user details
        localStorage.setItem('sp_token', res.data.token);
        localStorage.setItem('sp_user', JSON.stringify(res.data.user));

        setTimeout(() => {
          onClose();
          window.location.href = '/dashboard';
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-cyber-card border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-extrabold text-sm">
            <KeyRound className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>Account Password Reset</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Heading advisory */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black text-white">
            Reset Your Account Password
          </h2>
          <p className="text-xs text-slate-300">
            Enter your Email Address or User ID along with your new password
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          {/* Email / Teacher ID Input */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
              Email Address / Teacher ID
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={emailOrUserId}
                onChange={(e) => setEmailOrUserId(e.target.value)}
                placeholder="e.g. teacher@gmail.com or TCH-101"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white outline-none transition"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white outline-none transition"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1 text-[10px]">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-white outline-none transition"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold border border-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {loading ? (
                <span className="animate-pulse">Resetting...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Reset & Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
