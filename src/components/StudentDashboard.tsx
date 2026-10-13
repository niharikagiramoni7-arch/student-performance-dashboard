import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { STUDENT_SEMESTER_HISTORY } from '../data/mockData';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Target,
  Sparkles,
  BarChart3,
  BookmarkCheck,
  ShieldCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
  onOpenReportModal,
}) => {
  const { currentUser, openVerifiedDetailsModal, verifiedSessionDetails } = useAuth();
  const {
    courses,
    getOverallAttendancePercentage,
    getAllCoursesAttendance,
    getStudentMarks,
    calculateSgpa,
    calculateCgpa,
    assignments,
    submissions,
  } = useAcademic();

  if (!currentUser) return null;

  const attendancePercent = getOverallAttendancePercentage(currentUser.id);
  const courseAttendances = getAllCoursesAttendance(currentUser.id);
  const studentMarks = getStudentMarks(currentUser.id);
  const currentSgpaObj = calculateSgpa(currentUser.id, 5);
  const cgpaObj = calculateCgpa(currentUser.id);

  // Filter pending assignments for student
  const studentSubmissions = submissions.filter(s => s.studentId === currentUser.id);
  const submittedAssignmentIds = new Set(studentSubmissions.map(s => s.assignmentId));
  const pendingAssignments = assignments.filter(a => !submittedAssignmentIds.has(a.id));

  // Prepare SGPA progression chart data
  const gpaChartData = [
    ...STUDENT_SEMESTER_HISTORY.map(s => ({
      name: `Sem ${s.semester}`,
      SGPA: s.sgpa,
      Target: 9.0,
    })),
    {
      name: 'Sem 5 (Current)',
      SGPA: currentSgpaObj.sgpa,
      Target: 9.0,
    },
  ];

  // Prepare Course Performance comparison data
  const courseMarksChartData = studentMarks.map(m => {
    const course = courses.find(c => c.id === m.courseId);
    return {
      courseCode: course ? course.code : 'Course',
      courseName: course ? course.name : 'Unknown',
      myScore: m.totalScore,
      classAvg: m.classAverage || 72,
      highest: m.highestMarks || 95,
      gradeLetter: m.gradeLetter,
    };
  });

  const lowAttendanceCourses = courseAttendances.filter(
    c => c.status === 'warning' || c.status === 'critical'
  );

  return (
    <div id="student-performance-dashboard" className="space-y-6">
      {/* Welcome & Student Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Abstract subtle background accents */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                  SVKM's NMIMS University • MPSTME
                </span>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/30">
                  Semester {currentUser.semester || 5} • {currentUser.department}
                </span>
                <span className="text-xs text-indigo-200 font-mono">SAP: {currentUser.rollNumber}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                Welcome back, {currentUser.name}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 max-w-xl">
                Current academic standing is <strong>Distinction (Honor Roll)</strong>. Semester 5
                mid-term evaluations and attendance logs are updated.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              id="student-quick-report-btn"
              type="button"
              onClick={onOpenReportModal}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-700" />
              <span>Official Transcript</span>
            </button>
            <button
              id="student-quick-cgpa-btn"
              type="button"
              onClick={() => onNavigateTab('cgpa')}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl border border-indigo-500/40 transition-all cursor-pointer"
            >
              <Target className="w-4 h-4 text-indigo-200" />
              <span>CGPA Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Email OTP Verified Student Session Details Card */}
      <div
        id="otp-verified-student-details-card"
        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 animate-in fade-in"
      >
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200/80 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified via Email OTP
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {verifiedSessionDetails?.verifiedAt ? `Authenticated: ${verifiedSessionDetails.verifiedAt}` : 'Active Session'}
              </span>
              <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono font-bold">
                SAP ID: {currentUser.rollNumber}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {currentUser.name} • {currentUser.department}
            </h3>
            <p className="text-xs text-slate-500">
              Institutional Email: <span className="font-mono text-slate-700 font-medium">{currentUser.email}</span> • Current Term: <strong className="text-slate-800">Semester {currentUser.semester || 5}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <div className="px-2 text-center border-r border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">CGPA</span>
              <span className="font-black text-indigo-900 font-mono">{cgpaObj.cgpa.toFixed(2)}</span>
            </div>
            <div className="px-2 text-center border-r border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">SGPA</span>
              <span className="font-black text-emerald-700 font-mono">{currentSgpaObj.sgpa.toFixed(2)}</span>
            </div>
            <div className="px-2 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Attendance</span>
              <span className="font-black text-blue-900 font-mono">{attendancePercent}%</span>
            </div>
          </div>

          <button
            type="button"
            id="view-verified-credentials-btn"
            onClick={openVerifiedDetailsModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>View Full Verified Details</span>
          </button>
        </div>
      </div>

      {/* Attendance Shortage Warning Banner (if any course is < 75%) */}
      {lowAttendanceCourses.length > 0 && (
        <div
          id="student-attendance-alert-banner"
          className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Attendance Shortage Notice ({lowAttendanceCourses.length} Subject Requiring Attention)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {lowAttendanceCourses.map(c => `${c.courseCode} (${c.percentage}%)`).join(', ')} is
                below the mandatory 75% institutional threshold. Please attend upcoming lecture
                sessions to avoid exam debarment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('attendance')}
            className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
          >
            Review Attendance &rarr;
          </button>
        </div>
      )}

      {/* 4 Core Academic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative CGPA Card */}
        <div
          id="kpi-cgpa-card"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cumulative CGPA
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {cgpaObj.cgpa.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 10.00</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top 5% in CSE Department</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${(cgpaObj.cgpa / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Semester SGPA Card */}
        <div
          id="kpi-sgpa-card"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sem 5 Projected SGPA
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentSgpaObj.sgpa.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 10.00</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{currentSgpaObj.totalCredits} Enrolled Credits</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{ width: `${(currentSgpaObj.sgpa / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Attendance KPI Card */}
        <div
          id="kpi-attendance-card"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div
              className={`p-2 rounded-xl ${
                attendancePercent >= 75
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {attendancePercent}%
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                attendancePercent >= 75
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {attendancePercent >= 75 ? 'Eligible' : 'Warning'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Min. 75% required for end-semester exams
          </p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                attendancePercent >= 75 ? 'bg-blue-600' : 'bg-amber-500'
              }`}
              style={{ width: `${attendancePercent}%` }}
            />
          </div>
        </div>

        {/* Assignment & Credits Progress */}
        <div
          id="kpi-assignments-card"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Submissions
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {pendingAssignments.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              of {assignments.length} Total
            </span>
          </div>
          <p className="mt-2 text-xs text-purple-600 font-semibold flex items-center gap-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Next due: Problem Set 3 (Algorithms)</span>
          </p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-600 h-1.5 rounded-full"
              style={{
                width: `${
                  assignments.length > 0
                    ? ((assignments.length - pendingAssignments.length) / assignments.length) * 100
                    : 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SGPA Progression Chart */}
        <div
          id="sgpa-progression-chart-container"
          className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Academic GPA Progression Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semester-by-semester Grade Point Average (Scale of 10.0)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              Cumulative: {cgpaObj.cgpa.toFixed(2)} CGPA
            </span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[7.0, 10.0]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  ticks={[7.0, 8.0, 9.0, 10.0]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: any) => [`${value} GPA`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="SGPA"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="Target"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Breakdown by Course */}
        <div
          id="course-attendance-breakdown-card"
          className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Course Attendance Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live session percentage by subject
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('attendance')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View Logs &rarr;
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {courseAttendances.map(c => (
                <div key={c.courseId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[190px]">
                      {c.courseCode} • {c.courseName}
                    </span>
                    <span
                      className={`font-bold ${
                        c.percentage >= 75
                          ? 'text-slate-900'
                          : c.percentage >= 65
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {c.percentage}% ({c.attendedClasses}/{c.totalClasses})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        c.percentage >= 75
                          ? 'bg-emerald-500'
                          : c.percentage >= 65
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(c.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
            <span>Minimum University Eligibility:</span>
            <span className="font-bold text-slate-900">75.0% Overall & Subject</span>
          </div>
        </div>
      </div>

      {/* Marks & Performance Comparison Bar Chart */}
      <div
        id="marks-comparison-section"
        className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Course Score Breakdown vs Class Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between your obtained scores, class average, and batch highest marks
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('marks')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Detailed Marks Sheets &rarr;
          </button>
        </div>

        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={courseMarksChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="courseCode"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
                formatter={(val: any, name: any) => [
                  `${val} / 100`,
                  name === 'myScore' ? 'My Score' : name === 'classAvg' ? 'Class Average' : 'Highest',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="myScore" name="My Score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="classAvg" name="Class Average" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highest" name="Batch Highest" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab('attendance')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-left transition-all group cursor-pointer"
        >
          <Calendar className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900">Attendance Log</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Session date logs & leaves</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('marks')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-left transition-all group cursor-pointer"
        >
          <BarChart3 className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900">Marks & Grades</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Components & feedback</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('assignments')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-left transition-all group cursor-pointer"
        >
          <BookOpen className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900">Assignments</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Submit files & rubrics</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('cgpa')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm text-left transition-all group cursor-pointer"
        >
          <Target className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900">CGPA Simulator</div>
          <div className="text-[11px] text-slate-500 mt-0.5">What-If grade targets</div>
        </button>
      </div>
    </div>
  );
};
