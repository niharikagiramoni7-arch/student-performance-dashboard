import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { Assignment, Submission } from '../types';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  X,
  MessageSquare,
  Award,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const AssignmentsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { assignments, submissions, submitAssignment } = useAcademic();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);

  // Form state for submission
  const [solutionNotes, setSolutionNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!currentUser) return null;

  // Student's submissions map
  const studentSubmissions = submissions.filter(s => s.studentId === currentUser.id);
  const submissionsMap = new Map<string, Submission>();
  studentSubmissions.forEach(sub => {
    submissionsMap.set(sub.assignmentId, sub);
  });

  const getStatus = (assignmentId: string): 'pending' | 'submitted' | 'graded' => {
    const sub = submissionsMap.get(assignmentId);
    if (!sub) return 'pending';
    return sub.status === 'graded' ? 'graded' : 'submitted';
  };

  const filteredAssignments = assignments.filter(asg => {
    const status = getStatus(asg.id);
    if (activeFilter === 'all') return true;
    return status === activeFilter;
  });

  const handleOpenSubmitModal = (asg: Assignment) => {
    const existing = submissionsMap.get(asg.id);
    setSubmittingAssignment(asg);
    setSolutionNotes(existing ? existing.solutionNotes : '');
    setUploadedFileName(existing ? existing.fileName || '' : `${asg.courseCode.toLowerCase()}_solution_${currentUser.name.toLowerCase().replace(/\s+/g, '_')}.zip`);
    setSubmitSuccess(false);
  };

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    submitAssignment(
      submittingAssignment.id,
      currentUser.id,
      currentUser.name,
      solutionNotes.trim() || 'Solution files submitted successfully.',
      uploadedFileName || 'assignment_submission.zip'
    );

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmittingAssignment(null);
      setSubmitSuccess(false);
    }, 1200);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      setTimeout(() => {
        setUploadedFileName(file.name);
        setIsUploading(false);
      }, 500);
    }
  };

  return (
    <div id="assignment-tracking-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Assignment & Project Tracking
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit coursework solutions, track deadlines, and review detailed faculty evaluation marks
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'pending'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Due ({assignments.filter(a => getStatus(a.id) === 'pending').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('submitted')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'submitted'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submitted ({assignments.filter(a => getStatus(a.id) === 'submitted').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('graded')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'graded'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Graded ({assignments.filter(a => getStatus(a.id) === 'graded').length})
            </button>
          </div>
        </div>

        {/* Assignment Cards List */}
        <div className="divide-y divide-slate-100 mt-2">
          {filteredAssignments.map(asg => {
            const status = getStatus(asg.id);
            const submission = submissionsMap.get(asg.id);
            const formattedDue = new Date(asg.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={asg.id}
                className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                      status === 'graded'
                        ? 'bg-emerald-50 text-emerald-600'
                        : status === 'submitted'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {status === 'graded' && <CheckCircle2 className="w-6 h-6" />}
                    {status === 'submitted' && <Clock className="w-6 h-6" />}
                    {status === 'pending' && <BookOpen className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {asg.courseCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {asg.courseName}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          status === 'graded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'submitted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {status === 'graded'
                          ? 'Graded'
                          : status === 'submitted'
                          ? 'Under Review'
                          : 'Action Required'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">{asg.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {asg.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Deadline: {formattedDue}
                      </span>
                      <span>Total Points: <strong>{asg.totalPoints} pts</strong></span>
                      {asg.fileAttachmentName && (
                        <span className="flex items-center gap-1 text-indigo-600 font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          Spec: {asg.fileAttachmentName}
                        </span>
                      )}
                    </div>

                    {/* Graded Feedback Card */}
                    {status === 'graded' && submission && (
                      <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-700" />
                            Score Awarded: {submission.pointsAwarded} / {asg.totalPoints} points
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {Math.round(((submission.pointsAwarded || 0) / asg.totalPoints) * 100)}%
                          </span>
                        </div>
                        {submission.feedback && (
                          <p className="text-emerald-800 text-[11px] mt-0.5">
                            <strong>Feedback:</strong> {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Action Button */}
                <div className="shrink-0 w-full md:w-auto text-right">
                  <button
                    type="button"
                    onClick={() => handleOpenSubmitModal(asg)}
                    className={`w-full md:w-auto px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer ${
                      status === 'graded'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : status === 'submitted'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {status === 'graded'
                      ? 'View Submission'
                      : status === 'submitted'
                      ? 'Update Submission'
                      : 'Submit Solution'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Submission Modal */}
      {submittingAssignment && (
        <div
          id="submit-assignment-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-indigo-800 to-blue-700 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-indigo-200 block">
                  {submittingAssignment.courseCode} Course Submission
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {submittingAssignment.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSubmittingAssignment(null)}
                className="p-1 rounded-full text-indigo-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} className="p-6 space-y-4">
              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Submission registered and timestamped successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Solution Archive / Code File (.zip, .pdf, .py, .sql)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 block">
                    <span>Browse file to attach</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleSimulatedFileUpload}
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isUploading ? 'Attaching file...' : uploadedFileName || 'No file selected yet'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Implementation Notes & Summary
                </label>
                <textarea
                  rows={4}
                  value={solutionNotes}
                  onChange={e => setSolutionNotes(e.target.value)}
                  placeholder="Detail algorithms used, benchmarks achieved, instructions to execute tests..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitSuccess}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Confirm & Turn In Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
