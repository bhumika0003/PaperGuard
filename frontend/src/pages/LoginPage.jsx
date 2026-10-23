import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  Laptop, 
  ArrowRight, 
  AlertTriangle, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  Cloud,
  ChevronDown,
  KeyRound,
  CheckCircle 
} from 'lucide-react';
import { ForgotPasswordModal } from '../components/ui/ForgotPasswordModal';
import { EmailInput } from '../components/ui/EmailInput';
import { validateEmail } from '../utils/emailValidator';
import { AppLogo } from '../components/ui/AppLogo';

export const LoginPage = () => {
  const { user, login, register, resetPassword, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // If user is already logged in, do not show the login/signin page
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const isRegisterMode = authMode === 'register';
  const isForgotMode = authMode === 'forgot';

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const [name, setName] = useState('');
  const [emailOrUserId, setEmailOrUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [role, setRole] = useState('Teacher (Upload & Request Access)');
  const [department, setDepartment] = useState('Computer Science');
  const [customUserId, setCustomUserId] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Security Criteria Validation
  const activePassword = isForgotMode ? resetNewPassword : password;
  const criteria = {
    length: activePassword.length >= 8,
    uppercase: /[A-Z]/.test(activePassword),
    lowercase: /[a-z]/.test(activePassword),
    number: /[0-9]/.test(activePassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(activePassword)
  };

  const getCleanRole = (selectedRole) => {
    if (selectedRole.includes('Teacher')) return 'Teacher';
    if (selectedRole.includes('HOD')) return 'HOD';
    if (selectedRole.includes('Principal')) return 'Principal';
    if (selectedRole.includes('Exam Controller')) return 'Exam Controller';
    if (selectedRole.includes('Admin')) return 'Admin';
    if (selectedRole.includes('Auditor')) return 'Auditor';
    return selectedRole;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanRole = getCleanRole(role);

    if (authMode === 'register') {
      if (!name || !emailOrUserId || !password) {
        setError('Please fill in all required fields.');
        return;
      }

      // Enforce Strict Email Validation
      const emailCheck = validateEmail(emailOrUserId);
      if (!emailCheck.isValid) {
        setError(emailCheck.error);
        return;
      }

      const result = await register(name, emailOrUserId, phone || '+91 98765 43210', password, cleanRole, department, customUserId);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } else if (authMode === 'forgot') {
      if (!emailOrUserId) {
        setError('Please enter your institutional email address or User ID.');
        return;
      }

      if (emailOrUserId.includes('@')) {
        const emailCheck = validateEmail(emailOrUserId);
        if (!emailCheck.isValid) {
          setError(emailCheck.error);
          return;
        }
      }

      if (!resetNewPassword || resetNewPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }

      if (resetNewPassword !== resetConfirmPassword) {
        setError('New password and confirm password do not match.');
        return;
      }

      const result = await resetPassword(emailOrUserId, resetNewPassword);
      if (result.success) {
        setSuccessMsg('Password reset successfully! Logging you in...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError(result.error);
      }
    } else {
      if (!emailOrUserId || !password) {
        setError('Please enter your email/ID and password.');
        return;
      }

      if (emailOrUserId.includes('@')) {
        const emailCheck = validateEmail(emailOrUserId);
        if (!emailCheck.isValid) {
          setError(emailCheck.error);
          return;
        }
      }

      const result = await login(emailOrUserId, password, cleanRole);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf4fb] via-[#edf6fc] to-[#f4f9fc] dark:from-[#080d1a] dark:via-[#0c1224] dark:to-[#0f172a] text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 font-sans">
      
      {/* Top Navigation Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        
        {/* Left: Brand Logo & Title */}
        <Link to="/" className="flex items-center space-x-3 group">
          <AppLogo className="w-10 h-10" iconSize="w-6 h-6" />
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xl font-extrabold tracking-tight">
                <span className="brand-secure">Secure</span>
                <span className="brand-stack">Stack</span>
              </span>
              <span className="w-2.5 h-2.5 rounded-full brand-dot inline-block shadow-sm"></span>
            </div>
            <span className="text-[10px] block brand-tagline font-mono tracking-widest font-bold uppercase mt-1">
              PAPER LEAK PREVENTION SYSTEM
            </span>
          </div>
        </Link>

        {/* Center: Security Matrix Badge Pill */}
        <div className="hidden md:inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-50/90 dark:bg-slate-900 border border-cyan-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Security Matrix: <strong className="text-slate-900 dark:text-white font-bold">ACTIVE</strong></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">SHA-256 Fingerprinting Enabled</span>
        </div>

        {/* Right: Theme Mode Switcher */}
        <button
          onClick={toggleTheme}
          type="button"
          className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 text-xs font-bold shadow-sm flex items-center space-x-2 transition cursor-pointer relative overflow-hidden"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
        >
          {theme === 'dark' ? (
            <>
              <div className="relative w-6 h-5 flex items-center justify-center overflow-hidden">
                <Sun className="w-4 h-4 text-amber-400 animate-celestial-float flex-shrink-0 z-10" />
                <Cloud className="w-3 h-3 text-amber-200/80 absolute right-0 top-0.5 animate-cloud-pass pointer-events-none" />
              </div>
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <div className="relative w-6 h-5 flex items-center justify-center overflow-hidden">
                <Moon className="w-4 h-4 text-cyan-500 animate-celestial-float flex-shrink-0 z-10" />
                <Cloud className="w-3 h-3 text-cyan-500/70 dark:text-cyan-300/70 absolute right-0 bottom-0 animate-cloud-pass pointer-events-none" />
                <Cloud className="w-2 h-2 text-slate-400/50 dark:text-slate-400/50 absolute right-2 -top-0.5 animate-cloud-drift pointer-events-none" />
              </div>
              <span>Night Mode</span>
            </>
          )}
        </button>

      </header>

      {/* Main Centered Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        
        {/* Central White / Dark Floating Card */}
        <div className="w-full max-w-lg bg-white dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(8,112,184,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] my-4 sm:my-8 transition-all duration-300">
          
          {/* Card Top Logo */}
          <div className="text-center mb-6">
            <AppLogo className="w-14 h-14 mx-auto mb-3" iconSize="w-8 h-8" />

            <div className="flex items-center justify-center gap-1.5 mb-1 leading-none">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="brand-secure">Secure</span>
                <span className="brand-stack">Stack</span>
              </h2>
              <span className="w-3 h-3 rounded-full brand-dot inline-block shadow-sm"></span>
            </div>

            <span className="text-[10px] font-mono font-bold brand-tagline tracking-widest block uppercase mb-4">
              PAPER LEAK PREVENTION SYSTEM
            </span>

            {/* Portal Badge Pill */}
            <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Role-Based Access Verification Portal</span>
            </div>

            {/* Mode Switcher Tabs: Sign In | Create Account | Forgot Password */}
            <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-5 border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'forgot'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Forgot Password
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {authMode === 'register' && 'Create Account'}
              {authMode === 'login' && 'Sign In'}
              {authMode === 'forgot' && 'Reset Account Password'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto font-medium">
              {authMode === 'register' && 'Register for authorized access to the paper leak prevention portal.'}
              {authMode === 'login' && 'Enter your credentials to access the paper leak prevention portal.'}
              {authMode === 'forgot' && 'Enter your institutional email/ID and set a new password on this page.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2.5 shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (In Create Account Mode) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prof. Alan Turing"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white focus:border-cyan-500 text-slate-800 dark:text-white text-xs sm:text-sm placeholder-slate-400 outline-none transition shadow-sm"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address Component with Real-Time Validation */}
            <EmailInput
              value={emailOrUserId}
              onChange={(e) => setEmailOrUserId(e.target.value)}
              label={authMode === 'register' ? 'Institutional Email Address' : 'Institutional Email Address / Unique ID'}
              placeholder={authMode === 'register' ? 'e.g. aturing@university.edu' : 'e.g. aturing@university.edu or TCH-101'}
              required={true}
              showValidationMessage={authMode === 'register' || emailOrUserId.includes('@')}
            />

            {/* Password (for Sign In or Register) */}
            {authMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {authMode === 'register' ? 'Create Strong Password' : 'Password'}
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMsg(''); }}
                      className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === 'register' ? 'Enter minimum 8 character password' : 'Enter your password'}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white focus:border-cyan-500 text-slate-800 dark:text-white text-xs sm:text-sm placeholder-slate-400 outline-none transition shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Mode: New Password & Confirm Password with Show/Hide Toggles */}
            {authMode === 'forgot' && (
              <>
                {/* New Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      New Password
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Min 6-8 chars</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showResetNewPassword ? 'text' : 'password'}
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter new secure password"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white focus:border-cyan-500 text-slate-800 dark:text-white text-xs sm:text-sm placeholder-slate-400 outline-none transition shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                      title={showResetNewPassword ? "Hide password" : "Show password"}
                    >
                      {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirm New Password
                    </label>
                    {resetConfirmPassword && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        resetNewPassword === resetConfirmPassword ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {resetNewPassword === resetConfirmPassword ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 stroke-[3]" />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password to confirm"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white focus:border-cyan-500 text-slate-800 dark:text-white text-xs sm:text-sm placeholder-slate-400 outline-none transition shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                      title={showResetConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* SECURITY POLICY CRITERIA Box */}
            {(authMode === 'register' || authMode === 'forgot') && (
              <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2.5 shadow-inner">
                <span className="block text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  SECURITY POLICY CRITERIA:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  
                  <div className="flex items-center space-x-1.5">
                    {criteria.length ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className={criteria.length ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                      At least 8 characters
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {criteria.uppercase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className={criteria.uppercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                      Uppercase (A-Z)
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {criteria.lowercase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className={criteria.lowercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                      Lowercase (a-z)
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {criteria.number ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className={criteria.number ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                      Number (0-9)
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 col-span-2">
                    {criteria.special ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className={criteria.special ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                      Special symbol (!@#$%^&*)
                    </span>
                  </div>

                </div>
              </div>
            )}

            {/* Select Authorized Role Dropdown (In Sign In & Register) */}
            {authMode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Authorized Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white focus:border-cyan-500 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold outline-none transition shadow-sm appearance-none cursor-pointer pr-10"
                  >
                    <option value="Teacher (Upload & Request Access)">Teacher (Upload & Request Access)</option>
                    <option value="HOD (Approve & Verification)">HOD (Approve & Verification)</option>
                    <option value="Principal (Final Authorization)">Principal (Final Authorization)</option>
                    <option value="Exam Controller (Master Access)">Exam Controller (Master Access)</option>
                    <option value="Admin (System Administrator)">Admin (System Administrator)</option>
                    <option value="Auditor (Compliance & Security)">Auditor (Compliance & Security)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Department (In Create Account Mode) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Laptop className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white focus:border-cyan-500 text-slate-800 dark:text-white text-xs sm:text-sm placeholder-slate-400 outline-none transition shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/35 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : authMode === 'register' ? (
                <>
                  <span>Create Verified Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : authMode === 'forgot' ? (
                <>
                  <span>Reset Password & Sign In</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Account Switcher Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center space-y-3">
            {authMode === 'forgot' ? (
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                  className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/40 text-xs inline-block transition cursor-pointer"
                >
                  ← Back to Sign In
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                  className="font-bold text-slate-600 dark:text-slate-300 hover:underline text-xs inline-block transition cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {authMode === 'register' ? 'Already have an authorized account?' : 'Don\'t have an authorized account?'}
                <button
                  type="button"
                  onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setError(''); setSuccessMsg(''); }}
                  className="ml-2 font-bold text-cyan-600 dark:text-cyan-400 hover:underline px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/40 text-xs inline-block transition cursor-pointer"
                >
                  {authMode === 'register' ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            )}

            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>256-Bit Encrypted • Role-Based Protected</span>
            </div>
          </div>

        </div>

      </main>

      {/* Page Footer Bar */}
      <footer className="bg-slate-800 dark:bg-slate-950 text-slate-400 py-3.5 px-6 border-t border-slate-700/60 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
        <div>
          © 2026 SecureStack. Paper Leak Prevention System.
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <span>•</span>
          <Link to="/security-info" className="hover:text-white transition">Security Architecture</Link>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

    </div>
  );
};

