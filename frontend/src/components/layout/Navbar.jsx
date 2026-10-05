import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserProfileModal } from '../ui/UserProfileModal';
import { LogoutConfirmModal } from '../ui/LogoutConfirmModal';
import { ShieldCheck, LogOut, Sun, Moon, Cloud, CheckCircle, MessageSquare, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { AppLogo } from '../ui/AppLogo';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Principal': return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/50';
      case 'HOD': return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/50';
      case 'Teacher': return 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/50';
      case 'Admin': return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/50';
      case 'Exam Controller': return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/50';
      case 'Auditor': return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50';
      default: return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#151B2E]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#33435C] transition-colors duration-300 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <AppLogo className="w-9 h-9" />
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xl font-extrabold tracking-tight">
                <span className="brand-secure">Secure</span>
                <span className="brand-stack">Stack</span>
              </span>
              <span className="w-2.5 h-2.5 rounded-full brand-dot inline-block shadow-sm"></span>
            </div>
            <span className="text-[10px] block brand-tagline font-mono tracking-widest font-bold uppercase mt-1">PAPER LEAK PREVENTION SYSTEM</span>
          </div>
        </Link>

        {/* Center System Status */}
        <div className="hidden md:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-xs shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping"></span>
          <span className="text-slate-700 dark:text-[#CBD5E1] font-bold">Security Matrix: ACTIVE</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-cyan-700 dark:text-cyan-400 font-mono text-[11px] font-semibold">SHA-256 Fingerprinting Enabled</span>
        </div>

        {/* Right Section: Theme Toggle + Quick Role Switcher + Logout */}
        <div className="flex items-center space-x-3">
          
          {/* Light / Night Mode Theme Toggle Button with Drifting Clouds */}
          <button
            onClick={toggleTheme}
            className="p-2 px-2.5 rounded-xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-400 transition flex items-center space-x-2 text-xs font-bold shadow-sm relative overflow-hidden group cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
          >
            {theme === 'dark' ? (
              <>
                <div className="relative w-6 h-5 flex items-center justify-center overflow-hidden">
                  <Sun className="w-4 h-4 text-amber-400 animate-celestial-float flex-shrink-0 z-10" />
                  <Cloud className="w-3 h-3 text-amber-200/80 absolute right-0 top-0.5 animate-cloud-pass pointer-events-none" />
                </div>
                <span className="hidden sm:inline text-amber-300 font-extrabold">Light Mode</span>
              </>
            ) : (
              <>
                <div className="relative w-6 h-5 flex items-center justify-center overflow-hidden">
                  <Moon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-celestial-float flex-shrink-0 z-10" />
                  <Cloud className="w-3 h-3 text-cyan-500/70 dark:text-cyan-300/70 absolute right-0 bottom-0 animate-cloud-pass pointer-events-none" />
                  <Cloud className="w-2 h-2 text-slate-400/50 dark:text-slate-400/50 absolute right-2 -top-0.5 animate-cloud-drift pointer-events-none" />
                </div>
                <span className="hidden sm:inline text-cyan-700 dark:text-cyan-300 font-extrabold">Night Mode</span>
              </>
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-3 relative">
              
              {/* Live Chat Shortcut */}
              <Link
                to="/chat"
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-400 transition flex items-center space-x-1.5 text-xs font-bold shadow-sm"
                title="Open Campus Live Chat"
              >
                <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden lg:inline text-cyan-800 dark:text-cyan-300">Live Chat</span>
              </Link>
              
              {/* Clickable Role Badge with Avatar */}
              <Link
                to="/profile"
                className="hidden sm:flex items-center space-x-2.5 p-1 px-2 rounded-xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] hover:border-cyan-400 transition cursor-pointer text-left shadow-sm group"
                title="Click to view and edit your profile page"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 font-extrabold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col items-start pr-1">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">{user.name}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="p-2 px-3 rounded-xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500/40 transition flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer"
                title="Logout session"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition active:scale-95"
            >
              Access Portal
            </Link>
          )}

        </div>

      </div>

      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleConfirmLogout} 
      />
    </header>
  );
};
