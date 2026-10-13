import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileCheck,
  HelpCircle,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const MarksView: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, getStudentMarks, calculateSgpa } = useAcademic();

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);
  const [filterCourseId, setFilterCourseId] = useState<string>('all');

  if (!currentUser) return null;

  const marksList = getStudentMarks(currentUser.id);
  const sgpaInfo = calculateSgpa(currentUser.id, 5);

  const filteredMarks = filterCourseId === 'all'
    ? marksList
    : marksList.filter(m => m.courseId === filterCourseId);

  const toggleExpand = (courseId: string) => {
    setExpandedCourseId(prev => (prev === courseId ? null : courseId));
  };

  return (
    <div id="marks-management-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Marks & Grade Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Semester 5 continuous internal evaluations, mid-terms, final assessments, and grade letters
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 border border-indigo-200/60 rounded-xl text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block">
                Semester 5 SGPA
              </span>
              <span className="text-2xl font-black text-indigo-900 leading-none">
                {sgpaInfo.sgpa.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Total Credits
              </span>
              <span className="text-2xl font-black text-slate-800 leading-none">
                {sgpaInfo.totalCredits}
              </span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Filter by Course:</label>
            <select
              value={filterCourseId}
              onChange={e => setFilterCourseId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Registered Courses</option>
              {courses.map(crs => (
                <option key={crs.id} value={crs.id}>
                  {crs.code} - {crs.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500">
            Showing {filteredMarks.length} course grade records
          </span>
        </div>
      </div>

      {/* Course Marks Cards */}
      <div className="space-y-4">
        {filteredMarks.map(record => {
          const course = courses.find(c => c.id === record.courseId);
          const isExpanded = expandedCourseId === record.courseId;

          return (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Card Header Summary */}
              <div
                onClick={() => toggleExpand(record.courseId)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                      record.gradeLetter === 'O'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : record.gradeLetter === 'A+'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : record.gradeLetter === 'A'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-purple-100 text-purple-800 border border-purple-300'
                    }`}
                  >
                    {record.gradeLetter}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-indigo-700">{course?.code}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {course?.credits} Credits
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                        Grade Point: {record.gradePoint} / 10
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {course?.name || 'Academic Course'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Faculty: {course?.facultyName} • Evaluated on {record.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-medium">Total Score</span>
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-2xl font-black text-slate-900">
                        {record.totalScore}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right hidden md:block">
                    <span className="text-xs text-slate-400 block">Class Avg</span>
                    <span className="text-sm font-bold text-slate-600">
                      {record.classAverage || 72}
                    </span>
                  </div>

                  <div className="text-right hidden md:block">
                    <span className="text-xs text-emerald-600 block">Highest</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {record.highestMarks || 95}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Assessment Components Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                      Assessment Components Breakdown
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {record.components.map((comp, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span>{comp.name}</span>
                            <span className="text-slate-400">{comp.weightagePercent}% Wt.</span>
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-xl font-black text-indigo-900">
                              {comp.obtainedMarks}
                            </span>
                            <span className="text-xs text-slate-400">
                              Max: {comp.maxMarks}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{
                                width: `${(comp.obtainedMarks / comp.maxMarks) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Relative Performance Visual Bar */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Relative Class Standing Comparison
                    </span>
                    <div className="relative pt-6 pb-2">
                      {/* Bar track */}
                      <div className="h-3 w-full bg-slate-100 rounded-full relative">
                        {/* Class average marker */}
                        <div
                          className="absolute -top-5 -translate-x-1/2 flex flex-col items-center"
                          style={{ left: `${record.classAverage || 72}%` }}
                        >
                          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                            Avg: {record.classAverage || 72}
                          </span>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-0.5" />
                        </div>

                        {/* Student mark marker */}
                        <div
                          className="h-3 rounded-full bg-indigo-600"
                          style={{ width: `${record.totalScore}%` }}
                        />

                        {/* Batch highest marker */}
                        <div
                          className="absolute -top-5 -translate-x-1/2 flex flex-col items-center"
                          style={{ left: `${record.highestMarks || 95}%` }}
                        >
                          <span className="text-[10px] font-bold text-emerald-600 whitespace-nowrap">
                            High: {record.highestMarks || 95}
                          </span>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Faculty Remarks & Qualitative Feedback */}
                  {record.feedback && (
                    <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-900 block">
                          Faculty Evaluation Remark ({course?.facultyName})
                        </span>
                        <p className="text-indigo-800/90 mt-0.5">{record.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* University Grading Scale Reference Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          University Standard Grading Scale (UGC / AICTE Norms)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Grade points are credit-weighted to compute Semester Grade Point Average (SGPA) and Cumulative Grade Point Average (CGPA).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-black text-amber-700 text-base block">O</span>
            <span className="text-[11px] font-semibold text-slate-800">Outstanding</span>
            <span className="text-[10px] text-slate-500 block">90 - 100% (10 pts)</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-black text-emerald-700 text-base block">A+</span>
            <span className="text-[11px] font-semibold text-slate-800">Excellent</span>
            <span className="text-[10px] text-slate-500 block">80 - 89% (9 pts)</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-black text-blue-700 text-base block">A</span>
            <span className="text-[11px] font-semibold text-slate-800">Very Good</span>
            <span className="text-[10px] text-slate-500 block">70 - 79% (8 pts)</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-black text-indigo-700 text-base block">B+</span>
            <span className="text-[11px] font-semibold text-slate-800">Good</span>
            <span className="text-[10px] text-slate-500 block">60 - 69% (7 pts)</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-black text-purple-700 text-base block">B</span>
            <span className="text-[11px] font-semibold text-slate-800">Above Avg</span>
            <span className="text-[10px] text-slate-500 block">55 - 59% (6 pts)</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-black text-slate-700 text-base block">C</span>
            <span className="text-[11px] font-semibold text-slate-800">Average</span>
            <span className="text-[10px] text-slate-500 block">50 - 54% (5 pts)</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-black text-amber-600 text-base block">P</span>
            <span className="text-[11px] font-semibold text-slate-800">Pass</span>
            <span className="text-[10px] text-slate-500 block">40 - 49% (4 pts)</span>
          </div>

          <div className="p-2.5 bg-red-50 rounded-xl border border-red-200">
            <span className="font-black text-red-600 text-base block">F</span>
            <span className="text-[11px] font-semibold text-red-800">Fail</span>
            <span className="text-[10px] text-red-500 block">&lt; 40% (0 pts)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
