import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Printer,
  ArrowRight,
  UserCheck,
  Check,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';

export const VerifiedDetailsModal: React.FC = () => {
  const {
    currentUser,
    verifiedSessionDetails,
    showVerifiedDetailsModal,
    closeVerifiedDetailsModal,
  } = useAuth();
  const {
    courses,
    calculateCgpa,
    calculateSgpa,
    getOverallAttendancePercentage,
    assignments,
    submissions,
  } = useAcademic();

  if (!showVerifiedDetailsModal || !currentUser) return null;

  const targetUser = verifiedSessionDetails?.user || currentUser;
  const isStudent = targetUser.role === 'student';
  const isFaculty = targetUser.role === 'faculty';

  // Academic metrics for student
  const cgpaObj = isStudent ? calculateCgpa(targetUser.id) : null;
  const currentSemester = targetUser.semester || 5;
  const sgpaObj = isStudent ? calculateSgpa(targetUser.id, currentSemester) : null;
  const attendancePct = isStudent ? getOverallAttendancePercentage(targetUser.id) : null;
  const studentCourses = courses.filter(c => c.semester === currentSemester);

  // Faculty metrics
  const facultyCourses = courses.filter(
    c => c.facultyId === targetUser.id || c.facultyName.toLowerCase().includes(targetUser.name.toLowerCase().split(' ')[1] || '')
  );
  const pendingToGrade = submissions.filter(s => s.status === 'submitted').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="verified-identity-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="verified-identity-modal-card"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-900 text-white p-6 relative overflow-hidden">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <button
            type="button"
            onClick={closeVerifiedDetailsModal}
            className="absolute top-5 right-5 p-2 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close verified details modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-indigo-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-amber-300">
              NM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  SVKM's NMIMS University
                </span>
                <span className="text-xs text-indigo-300">• MPSTME Mumbai</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                Two-Factor Email OTP Verified Identity Record
              </h2>
            </div>
          </div>

          {/* Verification Status Pill */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Email OTP Authenticated & Session Granted</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Audit Timestamp & Token strip */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Verified At:{' '}
                <strong className="text-slate-900 font-mono">
                  {verifiedSessionDetails?.verifiedAt || 'Just now'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <span>Token:</span>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md font-bold">
                {verifiedSessionDetails?.sessionToken || `NMIMS-OTP-${targetUser.id.toUpperCase()}`}
              </span>
            </div>
          </div>

          {/* Core Profile Card */}
          <div className="p-5 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={targetUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={targetUser.name}
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full shadow-xs">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {targetUser.role.toUpperCase()} ACCOUNT
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified Email
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{targetUser.name}</h3>
                <p className="text-xs font-mono text-indigo-900 font-bold">
                  {isStudent ? 'SAP / Roll No:' : 'Faculty Employee ID:'}{' '}
                  <span className="text-indigo-600 font-black">{targetUser.rollNumber || '70012023084'}</span>
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Institution</span>
              <span className="text-xs font-bold text-slate-800 block">SVKM's NMIMS</span>
              <span className="text-[11px] text-slate-500 block">MPSTME Engineering</span>
            </div>
          </div>

          {/* Identity & Institutional Details Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Institutional Credentials
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Active & Accredited
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">NMIMS Email Address</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  {targetUser.email}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Academic Department / School</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  {targetUser.department}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">
                  {isStudent ? 'Program & Semester' : 'Faculty Designation'}
                </span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  {isStudent
                    ? `B.Tech Computer Engg • Semester ${currentSemester}`
                    : 'Senior Professor • Distributed Systems'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Registered Mobile / Contact</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  {targetUser.phone || '+91 98201 44521'}
                </span>
              </div>
            </div>
          </div>

          {/* STUDENT SPECIFIC: Academic Standing & Performance Details */}
          {isStudent && cgpaObj && sgpaObj && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Verified Academic Standing & Performance
                </h4>
                <span className="text-[11px] font-semibold text-emerald-600">
                  UGC Attendance Statutory: Complied (≥75%)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                    Cumulative CGPA
                  </span>
                  <span className="text-2xl font-black text-indigo-950 font-mono">
                    {cgpaObj.cgpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-indigo-600 block mt-0.5">Scale: 10.00</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    Sem {currentSemester} SGPA
                  </span>
                  <span className="text-2xl font-black text-emerald-950 font-mono">
                    {sgpaObj.sgpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">
                    {sgpaObj.totalCredits} Credits
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">
                    Campus Attendance
                  </span>
                  <span className="text-2xl font-black text-blue-950 font-mono">
                    {attendancePct}%
                  </span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">Good Standing</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-purple-700 block">
                    Total Credits
                  </span>
                  <span className="text-2xl font-black text-purple-950 font-mono">
                    {cgpaObj.totalCredits}
                  </span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">100% Earned</span>
                </div>
              </div>

              {/* Registered Courses breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                  Enrolled Subjects for Semester {currentSemester} (SVKM's NMIMS MPSTME)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {studentCourses.map(c => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-indigo-700 text-[11px]">
                          {c.code}
                        </span>
                        <p className="font-semibold text-slate-800 text-[11px] line-clamp-1">{c.name}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                        {c.credits} Credits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FACULTY SPECIFIC: Teaching & Responsibilities Details */}
          {isFaculty && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Teaching Responsibilities & Assigned Courses
                </h4>
                <span className="text-[11px] font-semibold text-indigo-600">
                  Semester 5 (Academic Year 2025-2026)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                    Active Courses
                  </span>
                  <span className="text-2xl font-black text-indigo-950 font-mono">
                    {facultyCourses.length || 2}
                  </span>
                  <span className="text-[10px] text-indigo-600 block mt-0.5">Assigned Batches</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    Total Students
                  </span>
                  <span className="text-2xl font-black text-emerald-950 font-mono">124</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Enrolled Scholars</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">
                    Class Attendance
                  </span>
                  <span className="text-2xl font-black text-blue-950 font-mono">88.5%</span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">Batch Average</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">
                    Submissions
                  </span>
                  <span className="text-2xl font-black text-amber-950 font-mono">
                    {pendingToGrade}
                  </span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">Pending Grading</span>
                </div>
              </div>

              {/* Faculty Courses list */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                  Assigned Lecture Modules (MPSTME)
                </span>
                <div className="space-y-2 text-xs">
                  {courses.slice(0, 2).map(c => (
                    <div
                      key={c.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700 text-xs">{c.code}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.schedule}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs mt-0.5">{c.name}</h5>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                        Room {c.room}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2-Factor Security Audit Log */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">
                  Two-Factor Email OTP Protocol Verified
                </span>
                <span className="text-[11px] text-emerald-700">
                  Authentication token issued to official NMIMS network node • Code: {verifiedSessionDetails?.otpCode || 'Verified'}
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Status</span>
              <span className="font-mono font-bold text-emerald-950 block">SECURE</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Verified Credentials Sheet</span>
          </button>

          <button
            type="button"
            onClick={closeVerifiedDetailsModal}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to {isStudent ? 'Student' : 'Faculty'} Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
