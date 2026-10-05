import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, User, Mail, Building, Key, CheckCircle, X, Shield, Clock, Edit2, Save, Sparkles, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from './AppLogo';

export const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const res = await updateUserProfile(name, '');
    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
    setSaving(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-slate-900/50 dark:bg-black/75 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[86vh] flex flex-col bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] rounded-3xl p-5 shadow-2xl space-y-3.5 my-auto overflow-hidden cursor-default"
      >
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

        {/* Modal Header (Pinned Top) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#33435C] pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
            <AppLogo className="w-6 h-6" iconSize="w-4 h-4" />
            <span>Authenticated User Profile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Professional Identity Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-3">
            <div className="flex items-center space-x-3.5">
              
              {/* Initial / User Badge Circle */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-cyan-500/20 border border-cyan-400/30 overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC] truncate">{user.name}</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 px-2 rounded-lg bg-slate-200 dark:bg-[#222D42] hover:bg-slate-300 dark:hover:bg-[#182232] text-cyan-700 dark:text-[#3B82F6] text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono font-semibold mt-0.5 truncate">
                  {user.email || `${user.role.toLowerCase()}@securestack.edu`}
                </p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" /> ACTIVE SESSION
                </span>
              </div>

            </div>
          </div>

          {/* Profile Details & Form */}
          <form onSubmit={handleSave} className="space-y-2.5 text-xs">
            
            {/* Full Name Input */}
            <div>
              <label className="block text-slate-500 dark:text-[#CBD5E1] font-bold uppercase tracking-wider mb-1 text-[10px]">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#182232] border border-cyan-400 dark:border-cyan-500/50 text-slate-900 dark:text-[#F8FAFC] font-semibold outline-none focus:border-cyan-500 transition text-xs"
                  required
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-slate-900 dark:text-[#F8FAFC] font-extrabold text-xs">
                  {user.name}
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-[#CBD5E1]">
                <Key className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Unique Institutional ID</span>
              </div>
              <span className="font-extrabold text-cyan-800 dark:text-[#3B82F6] font-mono bg-cyan-100 dark:bg-[#0B1020] px-2 py-0.5 rounded border border-cyan-300 dark:border-[#33435C] text-[11px]">
                {user.userId}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-[#CBD5E1]">
                <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>System Role</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-[#F8FAFC] font-mono bg-slate-200 dark:bg-[#222D42] px-2 py-0.5 rounded border border-slate-300 dark:border-[#33435C] text-[11px]">
                {user.role}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-[#CBD5E1]">
                <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Department</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">{user.department || 'Computer Science'}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-[#CBD5E1]">
                <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Clearance Permit</span>
              </div>
              <span className="font-bold text-amber-700 dark:text-[#F59E0B] font-mono text-[11px]">LEVEL 4 - AUTHORIZED</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-1.5 flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setName(user.name); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:opacity-95 transition"
                >
                  Close Profile Window
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>,
    document.body
  );
};
