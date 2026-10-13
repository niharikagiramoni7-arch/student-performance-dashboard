import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { User } from '../types';
import { ReportModal } from './ReportModal';
import {
  Users,
  GraduationCap,
  Award,
  Calendar,
  Search,
  Filter,
  ShieldCheck,
  Plus,
  Send,
  Building2,
  CheckCircle,
  AlertTriangle,
  Megaphone,
  UserPlus,
  Edit2,
  Trash2,
  FileText,
  UserX,
  UserCheck,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { currentUser, users, addUser, updateUser, deleteUser, toggleUserStatus } = useAuth();
  const { courses, announcements, addAnnouncement, calculateCgpa, getOverallAttendancePercentage } = useAcademic();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'faculty'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Announcement modal state
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'academic' | 'exam' | 'urgent' | 'general'>('academic');

  // Add User modal state (User Story 7: Admin can add users)
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'faculty'>('student');
  const [newUserRoll, setNewUserRoll] = useState('');
  const [newUserDept, setNewUserDept] = useState('MPSTME - Computer Engineering');
  const [newUserSemester, setNewUserSemester] = useState<number>(5);
  const [newUserPhone, setNewUserPhone] = useState('');

  // Edit User modal state (User Story 7: Admin can update user details)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editSemester, setEditSemester] = useState<number>(5);
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  // Report modal state (User Story 8: Admin can generate performance reports)
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string | null>(null);

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const students = users.filter(u => u.role === 'student');
  const facultyMembers = users.filter(u => u.role === 'faculty');

  // Filtered users for registry
  const filteredUsers = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterDept !== 'all' && u.department !== filterDept) return false;
    if (filterStatus !== 'all' && (u.status || 'active') !== filterStatus) return false;
    if (searchTerm) {
      const match = `${u.name} ${u.email} ${u.rollNumber || ''} ${u.department}`.toLowerCase();
      if (!match.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const departmentData = [
    { name: 'Computer Eng', count: 184, avgCgpa: 8.8 },
    { name: 'Info Tech', count: 112, avgCgpa: 8.4 },
    { name: 'AI & Data Sci', count: 96, avgCgpa: 8.9 },
    { name: 'Electronics', count: 78, avgCgpa: 8.1 },
    { name: 'Mechanical', count: 64, avgCgpa: 7.9 },
  ];

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      author: currentUser?.name || 'Dean Eleanor Thorne',
      role: 'Dean of Academic Affairs, SVKM\'s NMIMS',
      category: annCategory,
    });

    setShowAnnounceModal(false);
    setAnnTitle('');
    setAnnContent('');
    setFeedbackMessage({ text: 'Official circular published to NMIMS portal.', type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // User Story 7: Add User Handler
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserRoll.trim()) {
      setFeedbackMessage({ text: 'Please fill in all mandatory fields.', type: 'error' });
      return;
    }

    const res = addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      rollNumber: newUserRoll.trim(),
      department: newUserDept,
      semester: newUserRole === 'student' ? Number(newUserSemester) : undefined,
      phone: newUserPhone.trim() || '+91 98201 00000',
      status: 'active',
      joinedYear: new Date().getFullYear(),
      bio: `${newUserRole === 'student' ? 'Student' : 'Faculty'} at SVKM's NMIMS MPSTME.`,
    });

    if (res.success) {
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRoll('');
      setNewUserPhone('');
      setFeedbackMessage({ text: res.message, type: 'success' });
    } else {
      setFeedbackMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // User Story 7: Update User Handler
  const handleEditUserClick = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRoll(u.rollNumber || '');
    setEditDept(u.department);
    setEditSemester(u.semester || 5);
    setEditPhone(u.phone || '');
    setEditStatus(u.status || 'active');
  };

  const handleUpdateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const res = updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      rollNumber: editRoll.trim(),
      department: editDept,
      semester: editingUser.role === 'student' ? Number(editSemester) : undefined,
      phone: editPhone.trim(),
      status: editStatus,
    });

    setEditingUser(null);
    setFeedbackMessage({ text: res.message, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // User Story 7: Remove Inactive Account Handler
  const handleDeleteUserClick = (u: User) => {
    if (window.confirm(`Are you sure you want to permanently remove ${u.name} (${u.email}) from SVKM's NMIMS University directory?`)) {
      const res = deleteUser(u.id);
      setFeedbackMessage({ text: res.message, type: res.success ? 'success' : 'error' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  return (
    <div id="admin-institutional-dashboard" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/40 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                  SVKM's NMIMS University • MPSTME
                </span>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-purple-500/30 text-purple-200 rounded-full border border-purple-400/30">
                  Registry & Academic Affairs
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 text-white">
                Institutional Administrative Portal
              </h2>
              <p className="text-xs text-purple-200/80 mt-1">
                Overseeing student & faculty directories, attendance compliance, accreditation metrics, and official circulars.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="admin-add-user-btn"
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Student / Faculty</span>
            </button>

            <button
              type="button"
              id="admin-new-circular-btn"
              onClick={() => setShowAnnounceModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Publish Circular</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Institutional KPIs Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Registered Students</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {students.length}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Active Term
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across 5 engineering branches at MPSTME
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Faculty Corps</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {facultyMembers.length}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              1:12 Ratio
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Professors & research advisors
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Institutional Avg CGPA</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">8.62</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +0.18 YoY
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            First Class with Distinction benchmark
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Campus Attendance</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">87.4%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Compliant
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Exceeds 75% UGC minimum threshold
          </span>
        </div>
      </div>

      {/* Analytics Charts & Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Departmental Enrolment & Performance Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Student count and average CGPA metrics across MPSTME programs
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              Fall 2026 Cohort
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Enrolled Students" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Announcements Overview */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">SVKM's NMIMS Circulars</h3>
              <span className="text-xs text-slate-400">{announcements.length} active</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2 space-y-2 max-h-60 overflow-y-auto">
              {announcements.map(ann => (
                <div key={ann.id} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
                    <span className="uppercase font-bold text-indigo-600">{ann.category}</span>
                    <span>{ann.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800">{ann.title}</h4>
                  <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAnnounceModal(true)}
            className="w-full mt-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer"
          >
            + Create New Circular
          </button>
        </div>
      </div>

      {/* User Story 7: Student & Faculty Identity Registry with Full Admin Management */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Student & Faculty Identity Registry
              </h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {filteredUsers.length} Accounts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Add users, update account details, generate certified reports, or remove inactive accounts.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Only</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Inactive Accounts</option>
            </select>

            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Departments</option>
              <option value="MPSTME - Computer Engineering">Computer Eng</option>
              <option value="Academic Affairs & Registry">Registry</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search user..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 w-36 sm:w-48 font-medium"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-2.5 px-3">User & Contact</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">SAP / Employee ID</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Academic Standing</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const isStudent = user.role === 'student';
                const cgpa = isStudent ? calculateCgpa(user.id).cgpa : null;
                const isActive = (user.status || 'active') === 'active';

                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt={user.name}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{user.name}</span>
                          <span className="text-slate-500 text-[11px]">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'faculty'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 font-semibold">
                      {user.rollNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{user.department}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(user.id)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 text-amber-600" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isStudent && cgpa ? (
                        <span className="font-black text-indigo-900 text-xs">
                          {cgpa.toFixed(2)} CGPA
                        </span>
                      ) : (
                        <span className="text-slate-400">Faculty/Admin</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isStudent && (
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForReport(user.id)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Generate Performance Report (User Story 8)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEditUserClick(user)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Update User Details (User Story 7)"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUserClick(user)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Account (User Story 7)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD USER (User Story 7) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Add User to SVKM's NMIMS Registry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  User Role *
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewUserRole('student')}
                    className={`py-1.5 text-xs font-bold rounded-lg ${
                      newUserRole === 'student' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserRole('faculty')}
                    className={`py-1.5 text-xs font-bold rounded-lg ${
                      newUserRole === 'faculty' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Faculty
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Neil Sengupta"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="user@nmims.edu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {newUserRole === 'student' ? 'Roll / SAP ID *' : 'Faculty Employee ID *'}
                </label>
                <input
                  type="text"
                  required
                  value={newUserRoll}
                  onChange={e => setNewUserRoll(e.target.value)}
                  placeholder={newUserRole === 'student' ? '70012023099' : 'FAC-NMIMS-088'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={newUserDept}
                  onChange={e => setNewUserDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="MPSTME - Computer Engineering">MPSTME - Computer Engineering</option>
                  <option value="MPSTME - Information Technology">MPSTME - Information Technology</option>
                  <option value="MPSTME - Artificial Intelligence & Data Science">MPSTME - AI & Data Science</option>
                  <option value="MPSTME - Electronics & Telecommunication">MPSTME - Electronics & Telecom</option>
                </select>
              </div>

              {newUserRole === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={newUserSemester}
                    onChange={e => setNewUserSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  placeholder="+91 98201 12345"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER (User Story 7: Update user details) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Update User Details: {editingUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SAP / Roll / Employee ID
                </label>
                <input
                  type="text"
                  required
                  value={editRoll}
                  onChange={e => setEditRoll(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={editDept}
                  onChange={e => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {editingUser.role === 'student' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Semester
                    </label>
                    <select
                      value={editSemester}
                      onChange={e => setEditSemester(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BROADCAST ANNOUNCEMENT */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Broadcast Official SVKM's NMIMS Circular
            </h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  placeholder="e.g. Schedule for End-Term Practical Exams"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={annCategory}
                  onChange={e => setAnnCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="academic">Academic & Curriculum</option>
                  <option value="exam">Examination Circular</option>
                  <option value="urgent">Urgent Notice / Compliance</option>
                  <option value="general">General Campus Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Notice Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  placeholder="Provide all relevant dates, hall allocations, or guidelines..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Report Generation Modal from Admin Registry (User Story 8) */}
      {selectedStudentForReport && (
        <ReportModal
          isOpen={!!selectedStudentForReport}
          onClose={() => setSelectedStudentForReport(null)}
          targetStudentId={selectedStudentForReport}
        />
      )}
    </div>
  );
};
