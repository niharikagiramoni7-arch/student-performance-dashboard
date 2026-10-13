import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import {
  GraduationCap,
  Bell,
  FileText,
  UserCheck,
  Shield,
  Layers,
  LogOut,
  ChevronDown,
  User as UserIcon,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenReportModal,
  onOpenAuthModal,
}) => {
  const { currentUser, logout, openVerifiedDetailsModal } = useAuth();
  const { announcements, getAllCoursesAttendance } = useAcademic();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Check if student has attendance warnings
  const attendanceShortages = currentUser?.role === 'student'
    ? getAllCoursesAttendance(currentUser.id).filter(a => a.status === 'warning' || a.status === 'critical')
    : [];

  const totalNotifs = announcements.length + attendanceShortages.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              type="button"
              onClick={() => setCurrentTab('overview')}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                    SVKM's NMIMS University
                  </h1>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                    MPSTME
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student Performance Dashboard & Academic Portal
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Links based on active role */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {currentUser?.role === 'student' && (
              <>
                <button
                  type="button"
                  id="nav-tab-overview"
                  onClick={() => setCurrentTab('overview')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'overview'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  id="nav-tab-attendance"
                  onClick={() => setCurrentTab('attendance')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all relative ${
                    currentTab === 'attendance'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Attendance
                  {attendanceShortages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </button>
                <button
                  type="button"
                  id="nav-tab-marks"
                  onClick={() => setCurrentTab('marks')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'marks'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Marks & Grades
                </button>
                <button
                  type="button"
                  id="nav-tab-assignments"
                  onClick={() => setCurrentTab('assignments')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'assignments'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Assignments
                </button>
                <button
                  type="button"
                  id="nav-tab-cgpa"
                  onClick={() => setCurrentTab('cgpa')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'cgpa'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  CGPA Simulator
                </button>
              </>
            )}

            {currentUser?.role === 'faculty' && (
              <>
                <button
                  type="button"
                  id="nav-tab-faculty-dash"
                  onClick={() => setCurrentTab('faculty-dash')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'faculty-dash'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Faculty Control Center
                </button>
                <button
                  type="button"
                  id="nav-tab-faculty-attendance"
                  onClick={() => setCurrentTab('attendance-entry')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'attendance-entry'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Mark Attendance
                </button>
                <button
                  type="button"
                  id="nav-tab-faculty-marks"
                  onClick={() => setCurrentTab('marks-entry')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'marks-entry'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Enter Student Marks
                </button>
                <button
                  type="button"
                  id="nav-tab-faculty-assignments"
                  onClick={() => setCurrentTab('assignments-mgmt')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'assignments-mgmt'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Assignment Portal
                </button>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <button
                  type="button"
                  id="nav-tab-admin-dash"
                  onClick={() => setCurrentTab('admin-dash')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'admin-dash'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Institutional Dashboard
                </button>
                <button
                  type="button"
                  id="nav-tab-admin-students"
                  onClick={() => setCurrentTab('student-registry')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'student-registry'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Student Registry
                </button>
                <button
                  type="button"
                  id="nav-tab-admin-announcements"
                  onClick={() => setCurrentTab('announcements')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === 'announcements'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  Announcements & Calendar
                </button>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Official Report Card Button */}
            <button
              id="open-report-card-btn"
              type="button"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Official Transcript & Report</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Email OTP Verified Credentials Quick Action */}
            {currentUser && (
              <button
                id="verified-identity-badge-btn"
                type="button"
                onClick={openVerifiedDetailsModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors cursor-pointer shadow-2xs"
                title="Click to view full Email OTP Verified Credentials"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">OTP Verified Details</span>
                <span className="lg:hidden">Verified</span>
              </button>
            )}

            {/* Notifications Popover */}
            <div className="relative">
              <button
                id="notifications-toggle-btn"
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {totalNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  id="notifications-popover"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Notifications & Announcements ({totalNotifs})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-indigo-600 hover:underline"
                    >
                      Close
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2 space-y-2">
                    {/* Attendance shortage alert for student */}
                    {attendanceShortages.map(c => (
                      <div key={c.courseId} className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Attendance Warning: {c.courseCode}</span>
                        </div>
                        <p className="text-[11px] text-amber-700">
                          Your attendance in {c.courseName} is currently at <strong>{c.percentage}%</strong> (Threshold: 75%).
                        </p>
                      </div>
                    ))}

                    {/* Announcements */}
                    {announcements.map(ann => (
                      <div key={ann.id} className="py-2.5 text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-slate-800">{ann.title}</span>
                          <span className="text-[10px] text-slate-400">{ann.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{ann.content}</p>
                        <span className="text-[10px] text-indigo-600 font-medium mt-1 inline-block">
                          By {ann.author} ({ann.role})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="profile-dropdown-btn"
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 pl-2 text-left rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-bold text-slate-900 leading-none">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 capitalize mt-0.5">
                      {currentUser.role} • {currentUser.rollNumber || currentUser.department.slice(0, 14)}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div
                    id="profile-menu-dropdown"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Email Verified
                      </span>
                    </div>

                    <button
                      type="button"
                      id="menu-profile-btn"
                      onClick={() => {
                        setCurrentTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>User Profile & Credentials</span>
                    </button>

                    <button
                      type="button"
                      id="menu-verified-details-btn"
                      onClick={() => {
                        openVerifiedDetailsModal();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View OTP Verified Details</span>
                    </button>

                    <button
                      type="button"
                      id="menu-logout-btn"
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-signin-btn"
                type="button"
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
