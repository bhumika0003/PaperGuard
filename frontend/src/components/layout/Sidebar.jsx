import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../ui/UserProfileModal';
import {
  LayoutDashboard,
  FileText,
  ShieldAlert,
  History,
  FileCheck,
  Users,
  Shield,
  Eye,
  MessageSquare,
  CheckCircle,
  Activity
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!user) return null;

  const role = user.role;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Teacher', 'HOD', 'Principal', 'Admin', 'Exam Controller', 'Auditor']
    },
    {
      name: 'Campus Live Chat',
      path: '/chat',
      icon: MessageSquare,
      roles: ['Teacher', 'HOD', 'Principal', 'Admin', 'Exam Controller', 'Auditor']
    },
    {
      name: 'Question Papers',
      path: '/papers',
      icon: FileText,
      roles: ['Teacher', 'HOD', 'Principal', 'Admin', 'Exam Controller', 'Auditor']
    },
    {
      name: 'Download Requests',
      path: '/requests',
      icon: FileCheck,
      roles: ['Teacher', 'HOD', 'Principal', 'Exam Controller', 'Auditor']
    },
    {
      name: 'History & Audit Logs',
      path: '/audit',
      icon: History,
      roles: ['HOD', 'Principal', 'Admin', 'Exam Controller', 'Auditor']
    },
    {
      name: 'Security Alerts',
      path: '/alerts',
      icon: ShieldAlert,
      roles: ['Admin', 'Auditor', 'Principal']
    },
    {
      name: 'Role Activities Monitor',
      path: '/admin/activities',
      icon: Activity,
      roles: ['Admin']
    },
    {
      name: 'User Management',
      path: '/users',
      icon: Users,
      roles: ['Admin']
    },
    {
      name: 'Security System',
      path: '/security-info',
      icon: Shield,
      roles: ['Teacher', 'HOD', 'Principal', 'Admin', 'Exam Controller', 'Auditor']
    }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      <aside className="w-64 bg-white/90 dark:bg-[#151B2E]/90 border-r border-slate-200 dark:border-[#33435C] hidden md:flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-4rem)] transition-colors duration-300">
        <div className="space-y-6">
          {/* Clickable User Profile Card */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `w-full text-left p-3 rounded-2xl bg-slate-100 dark:bg-[#182232] border transition flex items-center space-x-3 shadow-sm group cursor-pointer ${isActive
                ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                : 'border-slate-200 dark:border-[#33435C] hover:border-cyan-400'
              }`
            }
            title="Click to view and edit profile page"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40 group-hover:scale-105 transition flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 font-bold text-sm group-hover:scale-105 transition flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden text-xs flex-1">
              <div className="font-extrabold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">{user.name}</div>
              <div className="text-slate-500 dark:text-[#CBD5E1] font-mono text-[11px] truncate">{user.department}</div>
            </div>
          </NavLink>

          {/* Navigation Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Main Navigation</div>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition duration-200 ${isActive
                      ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 font-extrabold active-nav-link shadow-sm'
                      : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#222D42] hover-nav-link'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Role Security Clearance Card */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#182232] border border-slate-200 dark:border-[#33435C] text-[11px] space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-[#CBD5E1] font-medium">
            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Security Clearance Level</span>
          </div>
          <div className="font-mono text-cyan-700 dark:text-[#3B82F6] font-extrabold uppercase">{user.role} PERMIT</div>
        </div>
      </aside>

      {/* User Profile Modal */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
