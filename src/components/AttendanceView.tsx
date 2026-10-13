import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  HelpCircle,
  Filter,
  Calculator,
  Search,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    courses,
    attendance,
    getAllCoursesAttendance,
    getOverallAttendancePercentage,
  } = useAcademic();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // What-If Attendance Projection state
  const [targetCourseId, setTargetCourseId] = useState<string>(courses[0]?.id || '');
  const [simulatedAttendNext, setSimulatedAttendNext] = useState<number>(3);
  const [simulatedMissNext, setSimulatedMissNext] = useState<number>(0);

  if (!currentUser) return null;

  const overallPercent = getOverallAttendancePercentage(currentUser.id);
  const courseSummaries = getAllCoursesAttendance(currentUser.id);

  // Student's raw session attendance records
  const studentRecords = attendance.filter(a => a.studentId === currentUser.id);

  // Filtered session records
  const filteredRecords = studentRecords.filter(rec => {
    if (selectedCourseId !== 'all' && rec.courseId !== selectedCourseId) return false;
    if (filterStatus !== 'all' && rec.status !== filterStatus) return false;
    if (searchTerm) {
      const course = courses.find(c => c.id === rec.courseId);
      const searchTarget = `${course?.code || ''} ${course?.name || ''} ${rec.topicCovered || ''} ${rec.date}`.toLowerCase();
      if (!searchTarget.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  // Calculate target course simulation
  const targetCourseSummary = courseSummaries.find(c => c.courseId === targetCourseId);
  const currentTotal = targetCourseSummary?.totalClasses || 10;
  const currentAttended = (targetCourseSummary?.attendedClasses || 0) + (targetCourseSummary?.excusedClasses || 0);

  const projectedTotal = currentTotal + simulatedAttendNext + simulatedMissNext;
  const projectedAttended = currentAttended + simulatedAttendNext;
  const projectedPercentage = projectedTotal > 0 ? Math.round((projectedAttended / projectedTotal) * 100) : 100;

  // Calculate how many consecutive attendances are needed to reach 75%
  // (currentAttended + x) / (currentTotal + x) >= 0.75  =>  currentAttended + x >= 0.75 * currentTotal + 0.75x
  // 0.25x >= 0.75 * currentTotal - currentAttended  =>  x >= 3 * currentTotal - 4 * currentAttended
  const classesNeededFor75 = Math.max(
    0,
    Math.ceil(3 * currentTotal - 4 * currentAttended)
  );

  return (
    <div id="attendance-management-view" className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Attendance Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Course-wise session logs, minimum 75% compliance tracking, and predictive forecasting
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                overallPercent >= 75
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              Institutional Standing: {overallPercent >= 75 ? 'Exam Eligible' : 'Debarment Risk (<75%)'}
            </span>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500 block">Overall Percentage</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {overallPercent}%
            </span>
            <span className="text-[11px] text-slate-500">Across all 6 registered subjects</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs font-semibold text-emerald-700 block">Total Attended</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {studentRecords.filter(r => r.status === 'present').length}
            </span>
            <span className="text-[11px] text-slate-500">Present in regular sessions</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs font-semibold text-red-600 block">Total Absences</span>
            <span className="text-2xl font-black text-red-600 mt-1 block">
              {studentRecords.filter(r => r.status === 'absent').length}
            </span>
            <span className="text-[11px] text-slate-500">Unexcused missed classes</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs font-semibold text-blue-600 block">Excused Leaves</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">
              {studentRecords.filter(r => r.status === 'excused').length}
            </span>
            <span className="text-[11px] text-slate-500">Medical / Institutional sanction</span>
          </div>
        </div>
      </div>

      {/* Course-Wise Summary Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Course-by-Course Attendance Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Course Code & Name</th>
                <th className="py-3 px-3 text-center">Credits</th>
                <th className="py-3 px-3 text-center">Conducted</th>
                <th className="py-3 px-3 text-center">Attended</th>
                <th className="py-3 px-3 text-center">Absent</th>
                <th className="py-3 px-3 text-center">Excused</th>
                <th className="py-3 px-3 text-center">Attendance %</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courseSummaries.map(c => (
                <tr key={c.courseId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-indigo-700 block">{c.courseCode}</span>
                    <span className="text-slate-700 font-medium">{c.courseName}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                    {c.credits}
                  </td>
                  <td className="py-3.5 px-3 text-center text-slate-600">{c.totalClasses}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                    {c.attendedClasses}
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-red-500">
                    {c.absentClasses}
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-blue-600">
                    {c.excusedClasses}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-extrabold text-slate-900">{c.percentage}%</span>
                      <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
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
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {c.status === 'normal' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Normal
                      </span>
                    )}
                    {c.status === 'warning' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        Warning (&lt;75%)
                      </span>
                    )}
                    {c.status === 'critical' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200">
                        <XCircle className="w-3 h-3" />
                        Critical (&lt;65%)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive What-If Attendance Projection Calculator */}
      <div
        id="attendance-projection-calculator"
        className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl p-6 border border-indigo-200/80 shadow-xs"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-indigo-100">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Attendance Projection Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Simulate future lecture attendance to ensure you maintain examination eligibility
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {/* Target Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Subject to Simulate
            </label>
            <select
              value={targetCourseId}
              onChange={e => setTargetCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
            >
              {courses.map(crs => (
                <option key={crs.id} value={crs.id}>
                  {crs.code} - {crs.name}
                </option>
              ))}
            </select>

            <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block">Current Status:</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-black text-slate-900">
                  {targetCourseSummary?.percentage || 0}%
                </span>
                <span className="text-slate-500 font-medium">
                  {currentAttended} / {currentTotal} attended
                </span>
              </div>
              {classesNeededFor75 > 0 ? (
                <p className="text-[11px] text-amber-700 font-semibold mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Must attend next {classesNeededFor75} classes continuously to reach 75%.
                </p>
              ) : (
                <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Currently above the 75% institutional requirement.
                </p>
              )}
            </div>
          </div>

          {/* Projection Input Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Attend next upcoming classes:</span>
                <span className="text-indigo-600 font-bold">{simulatedAttendNext} Classes</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={simulatedAttendNext}
                onChange={e => setSimulatedAttendNext(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Miss next upcoming classes:</span>
                <span className="text-red-500 font-bold">{simulatedMissNext} Classes</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={simulatedMissNext}
                onChange={e => setSimulatedMissNext(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </div>

          {/* Projection Result Card */}
          <div className="bg-white p-5 rounded-xl border border-indigo-200 flex flex-col justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                Projected Forecast
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{projectedPercentage}%</span>
                <span className="text-xs text-slate-500">
                  ({projectedAttended}/{projectedTotal} sessions)
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              {projectedPercentage >= 75 ? (
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eligible to appear for final end-semester exam.</span>
                </div>
              ) : (
                <div className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Warning: Below 75% threshold. Will require medical or dean waiver.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Session Logs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Session Attendance Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified daily attendance register with topics covered
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Subject filter */}
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Subjects</option>
              {courses.map(crs => (
                <option key={crs.id} value={crs.id}>
                  {crs.code}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="absent">Absent Only</option>
              <option value="excused">Excused Only</option>
            </select>

            {/* Search box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search topic or date..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Sessions list */}
        <div className="divide-y divide-slate-100 mt-2">
          {filteredRecords.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No attendance records found matching current search/filter.
            </div>
          ) : (
            filteredRecords.map(rec => {
              const course = courses.find(c => c.id === rec.courseId);
              return (
                <div
                  key={rec.id}
                  className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs hover:bg-slate-50/60 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        rec.status === 'present'
                          ? 'bg-emerald-50 text-emerald-600'
                          : rec.status === 'absent'
                          ? 'bg-red-50 text-red-500'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {rec.status === 'present' && <CheckCircle2 className="w-4 h-4" />}
                      {rec.status === 'absent' && <XCircle className="w-4 h-4" />}
                      {rec.status === 'excused' && <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-700">{course?.code}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-800">{course?.name}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Topic: {rec.topicCovered || 'Regular Curriculum Lecture'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-slate-400 font-mono text-[11px]">{rec.date}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                        rec.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'absent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
