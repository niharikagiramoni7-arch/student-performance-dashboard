import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2, Copy, X, GraduationCap, ShieldCheck } from 'lucide-react';

export const OtpNotificationBanner: React.FC = () => {
  const { otpNotification, dismissOtpNotification, verifyOTP } = useAuth();
  const [copied, setCopied] = useState(false);
  const [autoVerified, setAutoVerified] = useState(false);

  useEffect(() => {
    setCopied(false);
    setAutoVerified(false);
  }, [otpNotification]);

  if (!otpNotification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(otpNotification.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAutoVerify = () => {
    const res = verifyOTP(otpNotification.otp);
    if (res.success) {
      setAutoVerified(true);
    }
  };

  return (
    <div
      id="otp-notification-banner"
      className="fixed top-4 right-4 z-50 max-w-md w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-indigo-500/40 p-4 transition-all duration-300 animate-in slide-in-from-top-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="p-2.5 bg-indigo-600/30 text-indigo-400 rounded-xl shrink-0 mt-0.5 border border-indigo-500/30">
          <Mail className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
              SVKM's NMIMS Mail Gateway
            </span>
            <span className="text-xs text-slate-400">• Just now</span>
          </div>

          <h4 className="text-sm font-semibold text-slate-100 mt-1 truncate">
            {otpNotification.purpose}
          </h4>

          <p className="text-xs text-slate-300 mt-0.5">
            Delivered to <span className="font-semibold text-white">{otpNotification.email}</span>
          </p>

          <div className="mt-3 flex items-center gap-2 bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/80">
            <div className="flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Verification OTP Code
              </span>
              <span className="text-2xl font-black tracking-widest text-emerald-400 font-mono">
                {otpNotification.otp}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="copy-otp-button"
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                id="autoverify-otp-button"
                type="button"
                onClick={handleAutoVerify}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{autoVerified ? 'Verified' : '1-Click Fill'}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Valid for 5 minutes. Enter this code into your SVKM's NMIMS verification screen.
          </p>
        </div>

        <button
          id="dismiss-otp-banner"
          type="button"
          onClick={dismissOtpNotification}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
