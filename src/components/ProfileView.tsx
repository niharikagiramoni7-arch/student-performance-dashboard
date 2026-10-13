import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Calendar,
  Lock,
  ShieldCheck,
  Bell,
  Save,
  CheckCircle2,
  Camera,
  GraduationCap,
  KeyRound,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, openVerifiedDetailsModal, verifiedSessionDetails } = useAuth();
  const { calculateCgpa, getOverallAttendancePercentage } = useAcademic();

  if (!currentUser) return null;

  // Form states
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 234-8901');
  const [bio, setBio] = useState(currentUser.bio || 'Computer Science undergraduate passionate about distributed systems and algorithmic analysis.');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');

  // Password change simulation states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notification toggles
  const [notifGrades, setNotifGrades] = useState(true);
  const [notifAttendance, setNotifAttendance] = useState(true);
  const [notifAnnouncements, setNotifAnnouncements] = useState(true);

  // Success indicator
  const [profileSuccess, setProfileSuccess] = useState(false);

  const cgpaObj = currentUser.role === 'student' ? calculateCgpa(currentUser.id) : null;
  const attendancePct = currentUser.role === 'student' ? getOverallAttendancePercentage(currentUser.id) : null;

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      avatar,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your existing password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div id="user-profile-management-view" className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatar || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 text-white rounded-full shadow-xs">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {currentUser.role} Account
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ID: {currentUser.rollNumber || 'REG-USER-01'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{currentUser.name}</h2>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>

          {/* Quick Academic KPIs (if student) */}
          {currentUser.role === 'student' && cgpaObj && (
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  Current CGPA
                </span>
                <span className="text-2xl font-black text-emerald-950">
                  {cgpaObj.cgpa.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-right">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  Attendance
                </span>
                <span className="text-2xl font-black text-blue-950">{attendancePct}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Avatar Preset Picker */}
        <div className="pt-4 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">Choose Profile Avatar:</span>
          <div className="flex items-center gap-2">
            {avatarOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatar(opt)}
                className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  avatar === opt
                    ? 'border-indigo-600 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={opt} alt="Avatar option" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Information Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Update your public details and contact metadata</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>User profile information updated and synchronized successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Email verified via OTP protocol
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Mobile Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.department}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Term / Semester
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={`Semester ${currentUser.semester || 5} (Fall 2026)`}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Bio & Research Interests
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 font-sans"
              />
            </div>

            <div className="text-right pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Security & Preferences */}
        <div className="lg:col-span-5 space-y-6">
          {/* Email OTP Verification Status Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-5 border border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-emerald-950">Email OTP 2FA Verified</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300">
                Active Session
              </span>
            </div>

            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Your account identity is validated under SVKM's NMIMS Institutional Single Sign-On and two-factor email OTP protocol.
            </p>

            <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs space-y-1.5 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Identifier:</span>
                <span className="font-bold text-slate-900">{currentUser.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Verified At:</span>
                <span className="text-emerald-800">{verifiedSessionDetails?.verifiedAt || 'Current Session'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Auth Token:</span>
                <span className="text-slate-500">{verifiedSessionDetails?.sessionToken || 'NMIMS-SEC-TOKEN'}</span>
              </div>
            </div>

            <button
              type="button"
              id="profile-view-verified-modal-btn"
              onClick={openVerifiedDetailsModal}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Inspect Full Verified Details Record</span>
            </button>
          </div>

          {/* Security & Password Change */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Security Credentials</h3>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password updated and encrypted securely!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Institutional Notification Preferences */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Communication Alerts</h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Grade Publication Alerts</span>
                  <span className="text-[11px] text-slate-500">
                    Notify when internal or exam marks are published
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifGrades}
                  onChange={e => setNotifGrades(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Attendance Risk Warning</span>
                  <span className="text-[11px] text-slate-500">
                    Immediate notice when session attendance drops below 75%
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifAttendance}
                  onChange={e => setNotifAttendance(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">University Circulars</span>
                  <span className="text-[11px] text-slate-500">
                    Broadcast notifications from the Office of Academic Registrar
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifAnnouncements}
                  onChange={e => setNotifAnnouncements(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
