import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { STUDENT_SEMESTER_HISTORY } from '../data/mockData';
import {
  Award,
  Calculator,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const CgpaCalculator: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, getStudentMarks, calculateSgpa, calculateCgpa, getLetterAndPoint } = useAcademic();

  if (!currentUser) return null;

  const marksList = getStudentMarks(currentUser.id);
  const currentSemActual = calculateSgpa(currentUser.id, 5);
  const baseCgpaObj = calculateCgpa(currentUser.id);

  // Simulation state for Current Semester Courses (What-If Grade Simulator)
  const [simulatedGrades, setSimulatedGrades] = useState<{ [courseId: string]: number }>(() => {
    const init: { [courseId: string]: number } = {};
    courses.forEach(crs => {
      const existing = marksList.find(m => m.courseId === crs.id);
      init[crs.id] = existing ? existing.gradePoint : 9;
    });
    return init;
  });

  // Target CGPA Planner state
  const [targetCgpa, setTargetCgpa] = useState<number>(9.20);
  const [plannedFutureCredits, setPlannedFutureCredits] = useState<number>(60); // 3 remaining semesters * ~20 credits

  // Compute Simulated Current Semester SGPA
  let simSemCredits = 0;
  let simSemPoints = 0;
  courses.forEach(crs => {
    const gp = simulatedGrades[crs.id] ?? 9;
    simSemCredits += crs.credits;
    simSemPoints += crs.credits * gp;
  });
  const simulatedSgpa = simSemCredits > 0 ? Number((simSemPoints / simSemCredits).toFixed(2)) : 0;

  // Compute Simulated Overall CGPA
  let priorCredits = 0;
  let priorPoints = 0;
  STUDENT_SEMESTER_HISTORY.forEach(s => {
    priorCredits += s.totalCredits;
    priorPoints += s.totalCredits * s.sgpa;
  });

  const totalSimulatedCredits = priorCredits + simSemCredits;
  const totalSimulatedPoints = priorPoints + simSemPoints;
  const simulatedCgpa = totalSimulatedCredits > 0
    ? Number((totalSimulatedPoints / totalSimulatedCredits).toFixed(2))
    : simulatedSgpa;

  // Target Planner Calculation:
  // targetCgpa = (currentEarnedPoints + futureEarnedPoints) / (currentTotalCredits + plannedFutureCredits)
  // futureEarnedPoints = targetCgpa * (currentTotalCredits + plannedFutureCredits) - currentEarnedPoints
  // requiredAverageSgpa = futureEarnedPoints / plannedFutureCredits
  const currentTotalCredits = baseCgpaObj.totalCredits;
  const currentEarnedPoints = baseCgpaObj.cgpa * currentTotalCredits;
  const finalTotalCredits = currentTotalCredits + plannedFutureCredits;
  const neededTotalPoints = targetCgpa * finalTotalCredits;
  const requiredFuturePoints = neededTotalPoints - currentEarnedPoints;
  const requiredFutureSgpa = plannedFutureCredits > 0
    ? Number((requiredFuturePoints / plannedFutureCredits).toFixed(2))
    : 0;

  const handleGradeChange = (courseId: string, point: number) => {
    setSimulatedGrades(prev => ({
      ...prev,
      [courseId]: point,
    }));
  };

  const handleResetToActual = () => {
    const init: { [courseId: string]: number } = {};
    courses.forEach(crs => {
      const existing = marksList.find(m => m.courseId === crs.id);
      init[crs.id] = existing ? existing.gradePoint : 9;
    });
    setSimulatedGrades(init);
  };

  const gradeOptions = [
    { label: 'O (Outstanding, 10 GP)', value: 10 },
    { label: 'A+ (Excellent, 9 GP)', value: 9 },
    { label: 'A (Very Good, 8 GP)', value: 8 },
    { label: 'B+ (Good, 7 GP)', value: 7 },
    { label: 'B (Above Average, 6 GP)', value: 6 },
    { label: 'C (Average, 5 GP)', value: 5 },
    { label: 'P (Pass, 4 GP)', value: 4 },
    { label: 'F (Fail, 0 GP)', value: 0 },
  ];

  return (
    <div id="cgpa-calculator-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              CGPA & SGPA Calculation Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Credit-weighted grade point calculations, academic trajectory, and interactive target planner
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200/70 rounded-xl text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                Current CGPA
              </span>
              <span className="text-2xl font-black text-emerald-900 leading-none">
                {baseCgpaObj.cgpa.toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200/70 rounded-xl text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block">
                Earned Credits
              </span>
              <span className="text-2xl font-black text-indigo-900 leading-none">
                {baseCgpaObj.totalCredits}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Formula Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            <span className="font-bold text-indigo-900 block mb-1">
              Semester GPA (SGPA) Formula:
            </span>
            <code className="text-indigo-700 font-mono text-[11px] block bg-white p-2 rounded-lg border border-slate-200">
              SGPA = Σ (Course Credits × Grade Point) / Σ (Course Credits)
            </code>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Each registered course contributes proportionally to its assigned credits.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            <span className="font-bold text-emerald-900 block mb-1">
              Cumulative GPA (CGPA) Formula:
            </span>
            <code className="text-emerald-700 font-mono text-[11px] block bg-white p-2 rounded-lg border border-slate-200">
              CGPA = Σ (All Semesters Earned Grade Points) / Σ (All Total Credits)
            </code>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Reflects continuous weighted academic performance across the full degree program.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Semester Progression Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Semester-Wise Academic Transcript Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Semester</th>
                <th className="py-2.5 px-3">Academic Term</th>
                <th className="py-2.5 px-3 text-center">Registered Credits</th>
                <th className="py-2.5 px-3 text-center">Earned Credits</th>
                <th className="py-2.5 px-3 text-center">SGPA</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {STUDENT_SEMESTER_HISTORY.map(sem => (
                <tr key={sem.semester} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    Semester {sem.semester}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{sem.academicYear}</td>
                  <td className="py-3 px-3 text-center font-semibold">{sem.totalCredits}</td>
                  <td className="py-3 px-3 text-center font-semibold text-emerald-600">
                    {sem.earnedCredits}
                  </td>
                  <td className="py-3 px-3 text-center font-black text-indigo-700 text-sm">
                    {sem.sgpa.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                      Completed (Passed)
                    </span>
                  </td>
                </tr>
              ))}
              {/* Current Semester 5 Row */}
              <tr className="bg-indigo-50/40 font-semibold border-t-2 border-indigo-200">
                <td className="py-3 px-3 font-bold text-indigo-900">
                  Semester 5 (Current)
                </td>
                <td className="py-3 px-3 text-indigo-800">Fall 2026</td>
                <td className="py-3 px-3 text-center text-indigo-900">{currentSemActual.totalCredits}</td>
                <td className="py-3 px-3 text-center text-indigo-900">{currentSemActual.totalCredits}</td>
                <td className="py-3 px-3 text-center font-black text-indigo-900 text-sm">
                  {currentSemActual.sgpa.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full text-[10px]">
                    Ongoing (Evaluated)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive "What-If" Grade Simulator */}
      <div
        id="what-if-cgpa-simulator"
        className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 rounded-2xl p-6 border border-indigo-200 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-indigo-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interactive "What-If" CGPA & SGPA Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Adjust prospective course grades to simulate their direct impact on cumulative GPA
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToActual}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Current Grades</span>
          </button>
        </div>

        {/* Live Projected Simulator Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
              Simulated Semester 5 SGPA
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-indigo-900">{simulatedSgpa.toFixed(2)}</span>
              <span className="text-xs text-slate-400">/ 10.00</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Based on {simSemCredits} total semester credits
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Projected Overall Cumulative CGPA
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-900">{simulatedCgpa.toFixed(2)}</span>
              <span className="text-xs text-slate-400">/ 10.00</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Cumulative across {totalSimulatedCredits} degree credits
            </span>
          </div>
        </div>

        {/* Course Grade Selectors */}
        <div className="mt-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Simulate Subject Grades:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map(course => {
              const currentPoint = simulatedGrades[course.id] ?? 9;
              return (
                <div
                  key={course.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-indigo-700 block">
                      {course.code} ({course.credits} Credits)
                    </span>
                    <span className="text-xs text-slate-700 font-medium truncate block">
                      {course.name}
                    </span>
                  </div>

                  <select
                    value={currentPoint}
                    onChange={e => handleGradeChange(course.id, Number(e.target.value))}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
                  >
                    {gradeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target CGPA Goal Planner */}
      <div
        id="target-cgpa-goal-planner"
        className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs"
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Target CGPA Graduation Planner</h3>
            <p className="text-xs text-slate-500">
              Calculate the minimum SGPA needed in upcoming semesters to graduate with your desired honors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Desired Target Graduation CGPA
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.05"
                min="5.0"
                max="10.0"
                value={targetCgpa}
                onChange={e => setTargetCgpa(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Enter target on a 10.0 scale (e.g. 9.20 for Summa Cum Laude)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Remaining Degree Credits Planned
            </label>
            <input
              type="number"
              step="1"
              min="10"
              max="100"
              value={plannedFutureCredits}
              onChange={e => setPlannedFutureCredits(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Typically ~20 credits per remaining semester (Sem 6, 7, 8)
            </p>
          </div>

          {/* Goal Planner Recommendation */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Required Average SGPA
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black ${
                    requiredFutureSgpa > 10.0
                      ? 'text-red-600'
                      : requiredFutureSgpa >= 9.0
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {requiredFutureSgpa.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">/ 10.00</span>
              </div>
            </div>

            <div className="mt-2 text-xs">
              {requiredFutureSgpa > 10.0 ? (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Target exceeds maximum possible 10.0 mathematically.
                </span>
              ) : requiredFutureSgpa >= 9.0 ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  Challenging goal: Requires mostly O and A+ grades.
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Achievable target with consistent A/B+ grades!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
