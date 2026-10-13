import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  X,
  AlertCircle,
  KeyRound,
  Sparkles,
  Building2,
  Users,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'otp';
  initialRole?: 'student' | 'faculty' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', initialRole = 'student' }) => {
  const {
    currentUser,
    login,
    initiateLoginWithOTP,
    initiateRegistration,
    requestOTP,
    verifyOTP,
    otpSession,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(initialMode);
  const [loginRole, setLoginRole] = useState<'student' | 'faculty' | 'admin'>(initialRole);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('maya.lin@nmims.edu');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [isOtpLoginLoading, setIsOtpLoginLoading] = useState(false);

  // Register form state
  const [regRole, setRegRole] = useState<'student' | 'faculty'>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regDept, setRegDept] = useState('MPSTME - Computer Engineering');
  const [regYear, setRegYear] = useState<number>(3);
  const [regSection, setRegSection] = useState<string>('A');
  const [regSemester, setRegSemester] = useState<number>(5);
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // OTP inputs (6 individual digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMode(initialMode);
    setLoginRole(initialRole);
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialMode, isOpen]);

  // Handle countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'otp' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timerSeconds]);

  // Reset OTP digits when session changes
  useEffect(() => {
    if (otpSession) {
      setOtpDigits(['', '', '', '', '', '']);
      setTimerSeconds(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpSession]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(loginIdentifier, loginPassword, loginRole);
    if (res.success) {
      onClose();
    } else {
      if (res.requiresOtp) {
        setErrorMessage(res.message || 'OTP verification required before logging in.');
        setMode('otp');
      } else {
        setErrorMessage(res.message || 'Invalid credentials.');
      }
    }
  };

  const handleLoginWithOtpSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your SVKM\'s NMIMS Email or Student/Employee ID.');
      return;
    }
    setIsOtpLoginLoading(true);
    const res = initiateLoginWithOTP(loginIdentifier, loginRole);
    setIsOtpLoginLoading(false);
    if (res.success) {
      setSuccessMessage(res.message);
      setMode('otp');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const registrationEmail = regEmail.trim().toLowerCase();
    const rollTrim = regRoll.trim();
    const nameTrim = regName.trim();
    const phoneTrim = regPhone.trim();

    // FR1 Validations
    if (!nameTrim || nameTrim.length < 2) {
      setErrorMessage('Please enter your full official name (minimum 2 characters).');
      return;
    }

    if (!rollTrim || rollTrim.length < 3) {
      setErrorMessage(`Please enter a valid unique ${regRole === 'student' ? 'Student ID / Roll Number' : 'Employee ID'}.`);
      return;
    }

    if (!registrationEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationEmail)) {
      setErrorMessage('Please enter a valid email address to receive your 6-digit OTP.');
      return;
    }

    if (!phoneTrim || phoneTrim.length < 7) {
      setErrorMessage('Please enter a valid contact phone number.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    const res = await initiateRegistration({
      name: nameTrim,
      email: registrationEmail,
      role: regRole,
      rollNumber: rollTrim,
      department: regDept,
      year: regRole === 'student' ? Number(regYear) : undefined,
      section: regRole === 'student' ? regSection : undefined,
      semester: regRole === 'student' ? Number(regSemester) : undefined,
      phone: phoneTrim,
      password: regPassword,
    });

    if (res.success) {
      setSuccessMessage(`${res.message} Enter the 6-digit code to activate your account.`);
      setMode('otp');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    const res = verifyOTP(fullCode);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 400);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleResendOtp = async () => {
    if (timerSeconds > 0 || !otpSession) return;
    const res = await requestOTP(otpSession.email, otpSession.purpose, otpSession.tempUserData?.role, otpSession.tempUserData);
    if (res.success) {
      setTimerSeconds(60);
      setSuccessMessage('A fresh OTP has been sent to your email.');
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Header Brand */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <GraduationCap className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                SVKM's NMIMS University
              </span>
              <h2 className="text-xl font-black text-white">
                {mode === 'login' && 'Academic Portal Login'}
                {mode === 'register' && `${regRole === 'student' ? 'Student' : 'Faculty'} Registration`}
                {mode === 'otp' && 'Email OTP Security Verification'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-indigo-100/80 mt-2">
            Mukesh Patel School of Technology Management & Engineering (MPSTME)
          </p>
        </div>

        {/* Feedback message banners */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM 1: LOGIN (Password or OTP) */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {(['student', 'faculty', 'admin'] as const).map(role => (
                <button key={role} type="button" onClick={() => setLoginRole(role)} className={`py-2 text-xs font-bold rounded-lg capitalize transition-all ${loginRole === role ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                  {role === 'admin' ? 'Admin' : role}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">Sign in to the <span className="font-bold text-slate-800 capitalize">{loginRole}</span> portal.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NMIMS Email or Roll / Employee ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. maya.lin@nmims.edu or 70012023084"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                id="login-submit-btn"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Login with Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="login-otp-btn"
                onClick={handleLoginWithOtpSubmit}
                disabled={isOtpLoginLoading}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Login with Email OTP (Two-Factor Authentication)</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                New to SVKM's NMIMS Portal?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Register Student / Faculty Account
                </button>
              </p>
            </div>

          </form>
        )}

        {/* FORM 2: REGISTRATION (STUDENT & FACULTY WITH EMAIL OTP) */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
            {/* Role Switcher Pill */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registering As:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRegRole('student')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    regRole === 'student'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎓 Student Registration
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('faculty')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    regRole === 'faculty'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👨‍🏫 Faculty Registration
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder={regRole === 'student' ? 'e.g. Aarav Sharma' : 'e.g. Prof. Priya Deshmukh'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NMIMS Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="user@nmims.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {regRole === 'student' ? 'Roll / SAP ID *' : 'Faculty Employee ID *'}
                </label>
                <input
                  type="text"
                  required
                  value={regRoll}
                  onChange={e => setRegRoll(e.target.value)}
                  placeholder={regRole === 'student' ? 'e.g. 70012023089' : 'e.g. FAC-NMIMS-055'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+91 98201 00000"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / School *
                </label>
                <select
                  value={regDept}
                  onChange={e => setRegDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="MPSTME - Computer Engineering">MPSTME - Computer Engineering</option>
                  <option value="MPSTME - Information Technology">MPSTME - Information Technology</option>
                  <option value="MPSTME - Artificial Intelligence & Data Science">MPSTME - AI & Data Science</option>
                  <option value="MPSTME - Electronics & Telecommunication">MPSTME - Electronics & Telecom</option>
                  <option value="MPSTME - Mechanical Engineering">MPSTME - Mechanical Engineering</option>
                </select>
              </div>
            </div>

            {regRole === 'student' && (
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year *
                  </label>
                  <select
                    value={regYear}
                    onChange={e => setRegYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section *
                  </label>
                  <select
                    value={regSection}
                    onChange={e => setRegSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester *
                  </label>
                  <select
                    value={regSemester}
                    onChange={e => setRegSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="register-submit-btn"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Email OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already have an NMIMS account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Log In Here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* FORM 3: EMAIL OTP VERIFICATION SCREEN */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtpSubmit} className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enter 6-Digit Email Verification Code
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                A verification code was dispatched to{' '}
                <span className="font-bold text-indigo-700">
                  {otpSession?.email || 'your NMIMS email address'}
                </span>
                . Check your mailbox or simulator banner above.
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpDigitChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-11 h-13 text-center text-xl font-black rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50/50 font-mono"
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-400">Didn't receive the email?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timerSeconds > 0}
                className={`font-bold transition-colors ${
                  timerSeconds > 0
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:text-indigo-800 cursor-pointer'
                }`}
              >
                Resend Code {timerSeconds > 0 && `(${timerSeconds}s)`}
              </button>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                id="verify-otp-btn"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify OTP & Complete Authentication</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                &larr; Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
