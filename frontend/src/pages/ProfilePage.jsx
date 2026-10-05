import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import {
  User,
  Mail,
  Building,
  Key,
  CheckCircle,
  ShieldCheck,
  Shield,
  Edit2,
  Save,
  AlertTriangle,
  Check,
  ArrowLeft,
  Activity,
  History,
  Lock,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const res = await updateUserProfile(name, user.avatar || '');
    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
    setSaving(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSaving(true);
      setErrorMsg('');
      const res = await updateUserProfile(name || user.name, base64Image);
      if (res.success) {
        setSuccessMsg('Profile picture updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(res.error || 'Failed to update profile picture.');
      }
      setSaving(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setSaving(true);
    setErrorMsg('');
    const res = await updateUserProfile(name || user.name, '');
    if (res.success) {
      setSuccessMsg('Profile picture removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to remove profile picture.');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>User Profile & Security Account</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40">
                    {user.role}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-[#CBD5E1] font-medium mt-0.5">
                  Manage your profile photo, personal details, and institutional clearance credentials.
                </p>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Feedback Messages */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2 shadow-sm">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center space-x-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Profile Overview Card & Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Card: User Identity & Avatar Upload */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg flex flex-col items-center text-center space-y-4">
              
              {/* Profile Picture Box with Camera Overlay & File Input */}
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-cyan-500/20 border-2 border-cyan-400/40 flex-shrink-0 overflow-hidden relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  
                  {/* Camera Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="w-6 h-6 text-cyan-300" />
                    <span className="text-[10px] font-bold mt-1">Change Photo</span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Verified Authentication Badge */}
                <div
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 shadow-sm border-2 border-white dark:border-[#151B2E] flex items-center justify-center"
                  title="Authenticated Clearance Verified"
                >
                  <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Photo Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-xs font-bold hover:bg-cyan-100 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
                {user.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1.5 shadow-sm"
                    title="Remove profile picture"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="space-y-1 w-full pt-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">{user.name}</h2>
                <p className="text-xs text-cyan-700 dark:text-cyan-400 font-mono font-bold truncate">
                  {user.email || `${user.role.toLowerCase()}@securestack.edu`}
                </p>
              </div>

              <div className="w-full pt-2 border-t border-slate-200 dark:border-[#33435C] space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Session Status</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    ACTIVE MATRIX
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Security Node</span>
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono">NODE-2026-SSL</span>
                </div>
              </div>
            </div>

            {/* Right Card: Account Details & Edit Form */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#33435C] pb-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Institutional Clearance Credentials</span>
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 px-3 rounded-xl bg-slate-100 dark:bg-[#222D42] hover:bg-slate-200 dark:hover:bg-[#182232] text-cyan-700 dark:text-[#3B82F6] text-xs font-bold flex items-center gap-1.5 transition border border-slate-200 dark:border-[#33435C]"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile Details
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-[#CBD5E1] font-bold uppercase tracking-wider mb-1.5 text-[10px]">
                    Full Faculty Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#182232] border border-cyan-400 dark:border-cyan-500/50 text-slate-900 dark:text-[#F8FAFC] font-semibold outline-none focus:border-cyan-500 transition text-sm"
                      required
                    />
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-slate-900 dark:text-[#F8FAFC] font-extrabold text-sm">
                      {user.name}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-medium">
                      <Key className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Unique Institutional ID</span>
                    </div>
                    <div className="font-mono text-cyan-700 dark:text-[#3B82F6] font-extrabold text-sm">
                      {user.userId}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-medium">
                      <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Assigned System Role</span>
                    </div>
                    <div className="font-mono text-slate-900 dark:text-white font-extrabold text-sm">
                      {user.role}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-medium">
                      <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Department / Division</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {user.department || 'Computer Science & Engineering'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] space-y-1">
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-medium">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Clearance Level</span>
                    </div>
                    <div className="font-mono text-amber-700 dark:text-[#F59E0B] font-extrabold text-sm">
                      LEVEL 4 - AUTHORIZED PERMIT
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-3 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setName(user.name); }}
                      className="px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
