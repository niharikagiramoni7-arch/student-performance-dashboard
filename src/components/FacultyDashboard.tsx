import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { Course, User, MarkRecord, Assignment, Submission } from '../types';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  FileCheck,
  Filter,
  Plus,
  Save,
  Search,
  Sparkles,
  Users,
  AlertTriangle,
  Award,
  MessageSquare,
  XCircle,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';

interface FacultyDashboardProps {
  initialSubTab?: 'overview' | 'attendance' | 'marks' | 'assignments';
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ initialSubTab = 'overview' }) => {
  const { currentUser, users, openVerifiedDetailsModal, verifiedSessionDetails } = useAuth();
  const {
    courses,
    attendance,
    marks,
    assignments,
    submissions,
    markBulkAttendance,
    saveMarkRecord,
    deleteMarkRecord,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
    getCourseAttendanceSummary,
  } = useAcademic();

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'marks' | 'assignments'>(initialSubTab);

  // Filter courses assigned to this faculty member
  const facultyCourses = courses.filter(c => c.facultyId === currentUser?.id || currentUser?.role === 'admin');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(facultyCourses[0]?.id || courses[0]?.id || '');

  // Students enrolled
  const students = users.filter(u => u.role === 'student');

  // Search & Filter state for Roster
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterDept, setRosterDept] = useState('all');
  const [rosterYear, setRosterYear] = useState<number | 'all'>('all');
  const [rosterSection, setRosterSection] = useState<string>('all');

  // Attendance Entry state
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceTopic, setAttendanceTopic] = useState<string>('Graph Search: Dijkstra & A* Algorithm');
  const [sessionAttendanceStatus, setSessionAttendanceStatus] = useState<{ [studentId: string]: 'present' | 'absent' | 'excused' }>(() => {
    const map: { [id: string]: 'present' | 'absent' | 'excused' } = {};
    students.forEach(s => {
      map[s.id] = 'present';
    });
    return map;
  });
  const [attendanceSaveSuccess, setAttendanceSaveSuccess] = useState(false);

  // Marks Entry state
  const [editingStudentId, setEditingStudentId] = useState<string>(students[0]?.id || '');
  const [internal1, setInternal1] = useState<number>(18);
  const [midTerm, setMidTerm] = useState<number>(27);
  const [labProject, setLabProject] = useState<number>(9);
  const [endSem, setEndSem] = useState<number>(36);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('Strong analytical breakdown; keeps clean test cases.');
  const [marksSaveSuccess, setMarksSaveSuccess] = useState(false);

  // Create Assignment state
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDesc, setNewAsgDesc] = useState('');
  const [newAsgDue, setNewAsgDue] = useState('2026-10-10T23:59');
  const [newAsgPoints, setNewAsgPoints] = useState(100);

  // Edit Assignment modal state
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editAsgTitle, setEditAsgTitle] = useState('');
  const [editAsgDesc, setEditAsgDesc] = useState('');
  const [editAsgDue, setEditAsgDue] = useState('');
  const [editAsgPoints, setEditAsgPoints] = useState(100);

  // Grade Submission modal state
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [awardedPoints, setAwardedPoints] = useState<number>(85);
  const [gradingFeedback, setGradingFeedback] = useState<string>('Good test execution. Ensure edge cases are handled.');

  const currentCourse = courses.find(c => c.id === selectedCourseId);

  // Update Marks Form when student changes
  const handleSelectStudentForMarks = (studId: string) => {
    setEditingStudentId(studId);
    const existing = marks.find(m => m.studentId === studId && m.courseId === selectedCourseId);
    if (existing && existing.components.length >= 4) {
      setInternal1(existing.components[0].obtainedMarks);
      setMidTerm(existing.components[1].obtainedMarks);
      setLabProject(existing.components[2].obtainedMarks);
      setEndSem(existing.components[3].obtainedMarks);
      setFeedbackNotes(existing.feedback || '');
    } else {
      setInternal1(16);
      setMidTerm(24);
      setLabProject(8);
      setEndSem(32);
      setFeedbackNotes('');
    }
  };

  const handleSaveAttendance = () => {
    const records = students.map(st => ({
      studentId: st.id,
      courseId: selectedCourseId,
      date: attendanceDate,
      status: sessionAttendanceStatus[st.id] || 'present',
      topicCovered: attendanceTopic,
    }));
    markBulkAttendance(records);
    setAttendanceSaveSuccess(true);
    setTimeout(() => setAttendanceSaveSuccess(false), 2500);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    saveMarkRecord({
      studentId: editingStudentId,
      courseId: selectedCourseId,
      semester: 5,
      components: [
        { name: 'Internal Assessment 1', maxMarks: 20, obtainedMarks: Number(internal1), weightagePercent: 20 },
        { name: 'Mid-Term Exam', maxMarks: 30, obtainedMarks: Number(midTerm), weightagePercent: 30 },
        { name: 'Assignments & Quiz', maxMarks: 10, obtainedMarks: Number(labProject), weightagePercent: 10 },
        { name: 'End-Sem Exam', maxMarks: 40, obtainedMarks: Number(endSem), weightagePercent: 40 },
      ],
      feedback: feedbackNotes,
    });
    setMarksSaveSuccess(true);
    setTimeout(() => setMarksSaveSuccess(false), 2500);
  };

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim() || !currentCourse) return;

    createAssignment({
      courseId: currentCourse.id,
      courseCode: currentCourse.code,
      courseName: currentCourse.name,
      facultyId: currentUser?.id || 'usr-faculty-01',
      title: newAsgTitle.trim(),
      description: newAsgDesc.trim(),
      dueDate: newAsgDue,
      totalPoints: Number(newAsgPoints),
      fileAttachmentName: 'Assignment_Problem_Statement.pdf',
    });

    setShowCreateAssignmentModal(false);
    setNewAsgTitle('');
    setNewAsgDesc('');
  };

  const handleGradeSubmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    gradeSubmission(gradingSubmission.id, Number(awardedPoints), gradingFeedback);
    setGradingSubmission(null);
  };

  const handleDeleteMark = (markId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this student mark record?')) {
      deleteMarkRecord(markId);
    }
  };

  const handleStartEditAssignment = (asg: Assignment) => {
    setEditingAssignment(asg);
    setEditAsgTitle(asg.title);
    setEditAsgDesc(asg.description);
    setEditAsgDue(asg.dueDate);
    setEditAsgPoints(asg.totalPoints);
  };

  const handleSaveEditAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    updateAssignment(editingAssignment.id, {
      title: editAsgTitle.trim(),
      description: editAsgDesc.trim(),
      dueDate: editAsgDue,
      totalPoints: Number(editAsgPoints),
    });

    setEditingAssignment(null);
  };

  const handleDeleteAssignment = (asgId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this assignment and all student submissions?')) {
      deleteAssignment(asgId);
    }
  };

  // Filtered roster students
  const displayedStudents = students.filter(st => {
    if (rosterDept !== 'all' && st.department !== rosterDept) return false;
    if (rosterYear !== 'all' && st.year && st.year !== Number(rosterYear)) return false;
    if (rosterSection !== 'all' && st.section && st.section !== rosterSection) return false;
    if (rosterSearch) {
      const q = rosterSearch.toLowerCase();
      const match = `${st.name} ${st.rollNumber || ''} ${st.department}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div id="faculty-dashboard-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                  SVKM's NMIMS University • MPSTME
                </span>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/30">
                  Faculty Portal
                </span>
                <span className="text-xs text-slate-300 font-mono">{currentUser?.rollNumber}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                {currentUser?.name || 'Dr. Marcus Vance'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
                Managing {facultyCourses.length} active lecture courses • {students.length} enrolled students
              </p>
            </div>
          </div>

          {/* Course Selector Dropdown */}
          <div className="w-full md:w-auto bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
            <label className="block text-[11px] font-semibold text-emerald-200 mb-1">
              Active Instructional Course:
            </label>
            <select
              value={selectedCourseId}
              onChange={e => {
                setSelectedCourseId(e.target.value);
                handleSelectStudentForMarks(students[0]?.id || '');
              }}
              className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-slate-900/90 text-white border border-emerald-500/40"
            >
              {facultyCourses.map(crs => (
                <option key={crs.id} value={crs.id}>
                  {crs.code} - {crs.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Course Roster & Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'attendance'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            1-Click Daily Attendance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('marks')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'marks'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Marks & Grade Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'assignments'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Assignments & Grading ({submissions.length})
          </button>
        </div>
      </div>

      {/* Email OTP Verified Faculty Session Details Card */}
      <div
        id="otp-verified-faculty-details-card"
        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 animate-in fade-in"
      >
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200/80 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Faculty Session
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {verifiedSessionDetails?.verifiedAt ? `Authenticated: ${verifiedSessionDetails.verifiedAt}` : 'Active Session'}
              </span>
              <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                Faculty ID: {currentUser?.rollNumber}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {currentUser?.name} • {currentUser?.department}
            </h3>
            <p className="text-xs text-slate-500">
              Institutional Email: <span className="font-mono text-slate-700 font-medium">{currentUser?.email}</span> • Assigned Courses: <strong className="text-slate-800">{facultyCourses.length} Curricular Modules</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <div className="px-2 text-center border-r border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Courses</span>
              <span className="font-black text-slate-900 font-mono">{facultyCourses.length}</span>
            </div>
            <div className="px-2 text-center border-r border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Enrolled</span>
              <span className="font-black text-emerald-700 font-mono">{students.length}</span>
            </div>
            <div className="px-2 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Submissions</span>
              <span className="font-black text-blue-900 font-mono">{submissions.length}</span>
            </div>
          </div>

          <button
            type="button"
            id="view-faculty-verified-credentials-btn"
            onClick={openVerifiedDetailsModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>View Full Verified Details</span>
          </button>
        </div>
      </div>

      {/* At-Risk Student Sentinel Banner */}
      {atRiskStudents.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">
                Academic Risk Sentinel Alert ({atRiskStudents.length} Student Debarment Risk)
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                {atRiskStudents.map(s => `${s.name} (${s.rollNumber})`).join(', ')} has attendance
                below 75% in {currentCourse?.code}. Mandatory student counseling or notice required.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className="text-xs font-bold text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg whitespace-nowrap"
          >
            Review Attendance &rarr;
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & ROSTER */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Enrolled Student Roster • {currentCourse?.name} ({currentCourse?.code})
              </h3>
              <p className="text-xs text-slate-500">
                Student academic performance standing, attendance rates, and component grades
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {displayedStudents.length} of {students.length} Students Shown
            </span>
          </div>

          {/* Student Search & Multi-criteria Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Search Student
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Name or Student ID..."
                  value={rosterSearch}
                  onChange={e => setRosterSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Department
              </label>
              <select
                value={rosterDept}
                onChange={e => setRosterDept(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white truncate"
              >
                <option value="all">All Departments</option>
                <option value="MPSTME - Computer Engineering">Computer Engineering</option>
                <option value="MPSTME - Information Technology">Information Technology</option>
                <option value="MPSTME - Artificial Intelligence & Data Science">AI & Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Academic Year
              </label>
              <select
                value={rosterYear}
                onChange={e => setRosterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">All Years</option>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Section
              </label>
              <select
                value={rosterSection}
                onChange={e => setRosterSection(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Student Name & Roll No</th>
                  <th className="py-3 px-3">Department & Sem</th>
                  <th className="py-3 px-3 text-center">Attendance %</th>
                  <th className="py-3 px-3 text-center">Course Total Score</th>
                  <th className="py-3 px-3 text-center">Grade Letter</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedStudents.map(st => {
                  const summary = getCourseAttendanceSummary(st.id, selectedCourseId);
                  const markRecord = marks.find(m => m.studentId === st.id && m.courseId === selectedCourseId);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.name}`}
                            alt={st.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{st.name}</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {st.rollNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {st.department} • Sem {st.semester}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            summary.percentage >= 75
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {summary.percentage}% ({summary.attendedClasses}/{summary.totalClasses})
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-black text-slate-900 text-sm">
                        {markRecord ? `${markRecord.totalScore} / 100` : 'Pending'}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`font-black text-xs px-2.5 py-1 rounded-md ${
                            markRecord?.gradeLetter === 'O'
                              ? 'bg-amber-100 text-amber-900'
                              : markRecord?.gradeLetter === 'A+'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-indigo-100 text-indigo-900'
                          }`}
                        >
                          {markRecord ? markRecord.gradeLetter : '--'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectStudentForMarks(st.id);
                            setActiveTab('marks');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                        >
                          Edit Marks
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE ENTRY */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1-Click Daily Session Attendance Register
              </h3>
              <p className="text-xs text-slate-500">
                Mark attendance for {currentCourse?.name} ({currentCourse?.code})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const map: { [id: string]: 'present' | 'absent' | 'excused' } = {};
                  students.forEach(s => (map[s.id] = 'present'));
                  setSessionAttendanceStatus(map);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => {
                  const map: { [id: string]: 'present' | 'absent' | 'excused' } = {};
                  students.forEach(s => (map[s.id] = 'absent'));
                  setSessionAttendanceStatus(map);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {attendanceSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Attendance register for {attendanceDate} saved successfully!</span>
            </div>
          )}

          {/* Session Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lecture Session Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topic / Syllabus Chapter Covered
              </label>
              <input
                type="text"
                value={attendanceTopic}
                onChange={e => setAttendanceTopic(e.target.value)}
                placeholder="e.g. B-Tree Concurrency Locking Protocols"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>

          {/* Student attendance toggles */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {students.map(st => {
              const currentStatus = sessionAttendanceStatus[st.id] || 'present';
              return (
                <div
                  key={st.id}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st.name}`}
                      alt={st.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{st.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{st.rollNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSessionAttendanceStatus(prev => ({ ...prev, [st.id]: 'present' }))
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSessionAttendanceStatus(prev => ({ ...prev, [st.id]: 'absent' }))
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        currentStatus === 'absent'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSessionAttendanceStatus(prev => ({ ...prev, [st.id]: 'excused' }))
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        currentStatus === 'excused'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Excused
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-right pt-2">
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Session Attendance</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: MARKS ENTRY */}
      {activeTab === 'marks' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Grade & Assessment Marks Entry Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Record internal assessments, mid-term, end-term exams and evaluation remarks
              </p>
            </div>
          </div>

          {marksSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Marks and grade calculations saved and synced with student transcript!</span>
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Enrolled Student to Grade:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {students.map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectStudentForMarks(st.id)}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    editingStudentId === st.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="block text-xs truncate">{st.name}</span>
                  <span className="block text-[11px] text-slate-500 font-mono">{st.rollNumber}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Marks Input Form */}
          <form onSubmit={handleSaveMarks} className="space-y-4 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal 1 (Max 20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  required
                  value={internal1}
                  onChange={e => setInternal1(Number(e.target.value))}
                  className="w-full text-base font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Weightage: 20%</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mid-Term (Max 30)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  required
                  value={midTerm}
                  onChange={e => setMidTerm(Number(e.target.value))}
                  className="w-full text-base font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Weightage: 30%</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quiz & Lab (Max 10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  required
                  value={labProject}
                  onChange={e => setLabProject(Number(e.target.value))}
                  className="w-full text-base font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Weightage: 10%</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End-Sem (Max 40)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  required
                  value={endSem}
                  onChange={e => setEndSem(Number(e.target.value))}
                  className="w-full text-base font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Weightage: 40%</span>
              </div>
            </div>

            {/* Calculated Total & Grade Preview */}
            {(() => {
              const total = Number(internal1) + Number(midTerm) + Number(labProject) + Number(endSem);
              return (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-600 block">Computed Composite Total Score:</span>
                    <span className="text-2xl font-black text-emerald-950">{total} / 100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 block">Assigned Grade Letter:</span>
                    <span className="text-xl font-black text-emerald-700">
                      {total >= 90
                        ? 'O (10 GP)'
                        : total >= 80
                        ? 'A+ (9 GP)'
                        : total >= 70
                        ? 'A (8 GP)'
                        : total >= 60
                        ? 'B+ (7 GP)'
                        : 'B (6 GP)'}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructor Remarks & Actionable Feedback
              </label>
              <textarea
                rows={3}
                value={feedbackNotes}
                onChange={e => setFeedbackNotes(e.target.value)}
                placeholder="Give constructive academic feedback for student progress..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 font-sans"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Student Grade</span>
              </button>
            </div>
          </form>

          {/* Recorded Marks Ledger */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recorded Marks Ledger ({marks.filter(m => m.courseId === selectedCourseId).length} Graded Records)
                </h4>
                <p className="text-[11px] text-slate-500">
                  All submitted grades for {currentCourse?.name || 'this course'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-2.5 px-3">Student Name & SAP</th>
                    <th className="py-2.5 px-3 text-center">Internal (/40)</th>
                    <th className="py-2.5 px-3 text-center">External (/60)</th>
                    <th className="py-2.5 px-3 text-center">Total Score</th>
                    <th className="py-2.5 px-3 text-center">Grade (GP)</th>
                    <th className="py-2.5 px-3">Remarks</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marks.filter(m => m.courseId === selectedCourseId).map(m => {
                    const st = users.find(u => u.id === m.studentId);
                    const internal = m.internalMarks ?? (m.components.slice(0, 3).reduce((sum, c) => sum + c.obtainedMarks, 0));
                    const external = m.externalMarks ?? (m.components[3]?.obtainedMarks || 0);

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={st?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${st?.name || 'User'}`}
                              alt={st?.name || 'Student'}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{st?.name || 'Student'}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{st?.rollNumber || m.studentId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                          {internal}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                          {external}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-black text-emerald-950">{m.totalScore}</span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-100 text-emerald-800">
                            {m.gradeLetter} ({m.gradePoint} GP)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate text-[11px]">
                          {m.feedback || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectStudentForMarks(m.studentId)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Marks Record"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMark(m.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Marks Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {marks.filter(m => m.courseId === selectedCourseId).length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                        No marks records submitted for this course yet. Use the form above to record grades.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS PORTAL */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Coursework Assignment Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue new homework tasks, review submitted archives, and assign rubric scores
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateAssignmentModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Assignment</span>
            </button>
          </div>

          {/* Active Course Assignments List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Active Course Assignments ({assignments.filter(a => a.courseId === selectedCourseId || facultyCourses.some(fc => fc.id === a.courseId)).length})
            </h4>

            <div className="divide-y divide-slate-100">
              {assignments
                .filter(a => a.courseId === selectedCourseId || facultyCourses.some(fc => fc.id === a.courseId))
                .map(asg => {
                  const subCount = submissions.filter(s => s.assignmentId === asg.id).length;
                  const formattedDue = new Date(asg.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={asg.id}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{asg.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                            {asg.courseCode}
                          </span>
                          <span className="text-[11px] text-slate-400">• Max: {asg.totalPoints} pts</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-1 max-w-xl">
                          {asg.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Due: {formattedDue}
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            {subCount} Submissions received
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditAssignment(asg)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(asg.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              {assignments.filter(a => a.courseId === selectedCourseId || facultyCourses.some(fc => fc.id === a.courseId)).length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No assignments created for this course yet. Click "Create New Assignment" above.
                </div>
              )}
            </div>
          </div>

          {/* Submissions Review Roster */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Received Student Submissions ({submissions.length})
            </h4>

            <div className="divide-y divide-slate-100">
              {submissions.map(sub => {
                const asg = assignments.find(a => a.id === sub.assignmentId);

                return (
                  <div
                    key={sub.id}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800">{sub.studentName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700">{asg?.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === 'graded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1 max-w-xl">
                        Notes: {sub.solutionNotes}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                        {sub.fileName && <span className="font-mono text-slate-600">Attached: {sub.fileName}</span>}
                        {sub.status === 'graded' && (
                          <span className="font-bold text-emerald-700">
                            Score: {sub.pointsAwarded} / {asg?.totalPoints || 100}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setGradingSubmission(sub);
                        setAwardedPoints(sub.pointsAwarded || 70);
                        setGradingFeedback(sub.feedback || 'Good work on architecture tests.');
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {sub.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Assignment */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Create New Course Assignment
            </h3>

            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={newAsgTitle}
                  onChange={e => setNewAsgTitle(e.target.value)}
                  placeholder="e.g. Lab Exercise 4: Trie Indexing"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Specifications *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newAsgDesc}
                  onChange={e => setNewAsgDesc(e.target.value)}
                  placeholder="Detailed problem instructions..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newAsgDue}
                    onChange={e => setNewAsgDue(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    required
                    value={newAsgPoints}
                    onChange={e => setNewAsgPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignmentModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Grade Submission */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Grade Submission: {gradingSubmission.studentName}
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <span className="text-slate-500 block">Submitted File:</span>
              <span className="font-mono text-indigo-700 font-semibold">{gradingSubmission.fileName || 'Archive.zip'}</span>
              <p className="text-slate-600 text-[11px] mt-1">{gradingSubmission.solutionNotes}</p>
            </div>

            <form onSubmit={handleGradeSubmissionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Awarded Score (Points)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={awardedPoints}
                  onChange={e => setAwardedPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Feedback & Critique
                </label>
                <textarea
                  rows={3}
                  value={gradingFeedback}
                  onChange={e => setGradingFeedback(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Submit Grade & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Assignment */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Assignment Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={editAsgTitle}
                  onChange={e => setEditAsgTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Specifications *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editAsgDesc}
                  onChange={e => setEditAsgDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editAsgDue}
                    onChange={e => setEditAsgDue(e.target.value)}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    required
                    value={editAsgPoints}
                    onChange={e => setEditAsgPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
