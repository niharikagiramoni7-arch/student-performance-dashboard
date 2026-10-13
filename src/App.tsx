import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicProvider } from './context/AcademicContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { StudentDashboard } from './components/StudentDashboard';
import { AttendanceView } from './components/AttendanceView';
import { MarksView } from './components/MarksView';
import { AssignmentsView } from './components/AssignmentsView';
import { CgpaCalculator } from './components/CgpaCalculator';
import { FacultyDashboard } from './components/FacultyDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileView } from './components/ProfileView';
import { ReportModal } from './components/ReportModal';
import { VerifiedDetailsModal } from './components/VerifiedDetailsModal';
import {
  GraduationCap,
  ArrowRight,
  Shield,
  Users,
} from 'lucide-react';

type LoginRole = 'student' | 'faculty' | 'admin';

const MainContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedLoginRole, setSelectedLoginRole] = useState<LoginRole>('student');
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // If user is not logged in, render a welcoming authentication gateway
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="max-w-4xl mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 mb-6">
            <GraduationCap className="w-10 h-10" />
          </div>

          <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 rounded-full border border-amber-300 mb-3">
            SVKM's NMIMS University • MPSTME
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl">
            Student Performance Dashboard
          </h1>

          <div className="mt-10 w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setShowRoleOptions(prev => !prev)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center gap-2"
            >
              <span>Choose your role to login</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${showRoleOptions ? 'rotate-90' : ''}`} />
            </button>

            {showRoleOptions && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-5">
              {/* Student Persona */}
              <div
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><GraduationCap className="w-6 h-6" /></div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 block">
                      Student
                    </span>
                    <span className="text-[11px] text-slate-400">View your academic progress</span>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedLoginRole('student'); setIsAuthModalOpen(true); }} className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors">Continue as Student <ArrowRight className="inline w-3.5 h-3.5 ml-1" /></button>
              </div>

              {/* Faculty Persona */}
              <div
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users className="w-6 h-6" /></div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 block">
                      Faculty
                    </span>
                    <span className="text-[11px] text-slate-400">Manage academic records</span>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedLoginRole('faculty'); setIsAuthModalOpen(true); }} className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors">Continue as Faculty <ArrowRight className="inline w-3.5 h-3.5 ml-1" /></button>
              </div>

              {/* Admin Persona */}
              <div
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Shield className="w-6 h-6" /></div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-purple-600 block">
                      Administrator
                    </span>
                    <span className="text-[11px] text-slate-400">Manage the whole platform</span>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedLoginRole('admin'); setIsAuthModalOpen(true); }} className="mt-4 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors">Continue as Admin <ArrowRight className="inline w-3.5 h-3.5 ml-1" /></button>
              </div>
            </div>}
          </div>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialRole={selectedLoginRole} />
        <VerifiedDetailsModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col text-slate-800">
      {/* Main Top Navigation */}
      <Navbar
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Render View Based on activeTab and User Role */}
        {(activeTab === 'overview' || activeTab === 'dashboard') && (
          <>
            {currentUser.role === 'student' && (
              <StudentDashboard
                onNavigateTab={setActiveTab}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
            {currentUser.role === 'faculty' && <FacultyDashboard initialSubTab="overview" />}
            {currentUser.role === 'admin' && <AdminDashboard />}
          </>
        )}

        {activeTab === 'attendance' && (
          <>
            {currentUser.role === 'student' ? (
              <AttendanceView />
            ) : (
              <FacultyDashboard initialSubTab="attendance" />
            )}
          </>
        )}

        {activeTab === 'marks' && (
          <>
            {currentUser.role === 'student' ? (
              <MarksView />
            ) : (
              <FacultyDashboard initialSubTab="marks" />
            )}
          </>
        )}

        {activeTab === 'assignments' && (
          <>
            {currentUser.role === 'student' ? (
              <AssignmentsView />
            ) : (
              <FacultyDashboard initialSubTab="assignments" />
            )}
          </>
        )}

        {activeTab === 'cgpa' && <CgpaCalculator />}

        {activeTab === 'profile' && <ProfileView />}

        {/* Faculty Direct Route Tabs */}
        {activeTab === 'faculty-dash' && <FacultyDashboard initialSubTab="overview" />}
        {activeTab === 'attendance-entry' && <FacultyDashboard initialSubTab="attendance" />}
        {activeTab === 'marks-entry' && <FacultyDashboard initialSubTab="marks" />}
        {activeTab === 'assignments-mgmt' && <FacultyDashboard initialSubTab="assignments" />}

        {/* Admin Direct Route Tabs */}
        {activeTab === 'admin-dash' && <AdminDashboard />}
        {activeTab === 'student-registry' && <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialRole={selectedLoginRole} />
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      <VerifiedDetailsModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AcademicProvider>
        <MainContent />
      </AcademicProvider>
    </AuthProvider>
  );
}
