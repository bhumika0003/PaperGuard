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
  ChevronDown 
} from 'lucide-react';
import { ForgotPasswordModal } from '../components/ui/ForgotPasswordModal';
import { EmailInput } from '../components/ui/EmailInput';
import { validateEmail } from '../utils/emailValidator';
import { AppLogo } from '../components/ui/AppLogo';

export const LoginPage = () => {
  const { user, login, register, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // If user is already logged in, do not show the login/signin page
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [emailOrUserId, setEmailOrUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Teacher (Upload & Request Access)');
  const [department, setDepartment] = useState('Computer Science');
  const [customUserId, setCustomUserId] = useState('');
  const [error, setError] = useState('');

  // Password Security Criteria Validation
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const getCleanRole = (selectedRole) => {
    if (selectedRole.includes('Teacher')) return 'Teacher';
    if (selectedRole.includes('HOD')) return 'HOD';
    if (selectedRole.includes('Principal')) return 'Principal';
    if (selectedRole.includes('Exam Controller')) return 'Exam Controller';
    return selectedRole;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanRole = getCleanRole(role);

    if (isRegisterMode) {
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

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isRegisterMode ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto font-medium">
              {isRegisterMode 
                ? 'Register for authorized access to the paper leak prevention portal.'
                : 'Enter your credentials to access the paper leak prevention portal.'
              }
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2.5 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (In Create Account Mode) */}
            {isRegisterMode && (
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
              label={isRegisterMode ? 'Institutional Email Address' : 'Institutional Email Address / Unique ID'}
              placeholder={isRegisterMode ? 'e.g. aturing@university.edu' : 'e.g. aturing@university.edu or TCH-101'}
              required={true}
              showValidationMessage={isRegisterMode || emailOrUserId.includes('@')}
            />

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRegisterMode ? 'Create Strong Password' : 'Password'}
                </label>
                {!isRegisterMode && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
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
                  placeholder={isRegisterMode ? 'Enter minimum 8 character password' : 'Enter your password'}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white focus:border-cyan-500 text-slate-800 dark:text-white text-xs sm:text-sm placeholder-slate-400 outline-none transition shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SECURITY POLICY CRITERIA Box */}
            {isRegisterMode && (
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

            {/* Select Authorized Role Dropdown */}
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
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Department (In Create Account Mode) */}
            {isRegisterMode && (
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
              ) : isRegisterMode ? (
                <>
                  <span>Create Verified Account</span>
                  <ArrowRight className="w-4 h-4" />
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
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isRegisterMode ? 'Already have an authorized account?' : 'Don\'t have an authorized account?'}
              <button
                type="button"
                onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}
                className="ml-2 font-bold text-cyan-600 dark:text-cyan-400 hover:underline px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/40 text-xs inline-block transition cursor-pointer"
              >
                {isRegisterMode ? 'Sign In' : 'Create Account'}
              </button>
            </p>

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

