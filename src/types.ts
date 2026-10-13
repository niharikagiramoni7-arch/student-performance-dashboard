export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  phone?: string;
  rollNumber?: string; // Roll No for student (e.g. 70012023084) or Employee ID for faculty (e.g. FAC-NMIMS-012)
  department: string;  // e.g. "MPSTME - Computer Engineering"
  year?: number;       // e.g. 3 (3rd Year)
  section?: string;    // e.g. "A"
  semester?: number;   // e.g. 5
  joinedYear?: number;
  bio?: string;
  address?: string;
  emergencyContact?: string;
  advisorName?: string;
  password?: string;
  status?: 'active' | 'inactive';
}

export interface Course {
  id: string;
  code: string;         // e.g. "CS301"
  name: string;         // e.g. "Analysis & Design of Algorithms"
  credits: number;      // e.g. 4
  semester: number;     // e.g. 5
  department: string;
  facultyId: string;
  facultyName: string;
  schedule: string;     // e.g. "Mon, Wed 09:30 AM - 11:00 AM"
  room: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;         // YYYY-MM-DD
  status: 'present' | 'absent' | 'excused';
  topicCovered?: string;
}

export interface CourseAttendanceSummary {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  excusedClasses: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical'; // <75% warning, <65% critical
}

export interface ExamComponent {
  name: string;         // e.g. "Internal Assessment 1", "Mid-Term", "Assignments & Quiz", "End-Sem Exam"
  maxMarks: number;
  obtainedMarks: number;
  weightagePercent: number; // e.g. 20%
}

export interface MarkRecord {
  id: string;
  studentId: string;
  courseId: string;
  semester: number;
  internalMarks?: number;   // out of 40 (IA1, Mid-term, Quiz)
  externalMarks?: number;   // out of 60 (End-Sem Exam)
  components: ExamComponent[];
  totalScore: number;       // out of 100
  gradeLetter: string;      // O, A+, A, B+, B, C, P, F
  gradePoint: number;       // 10, 9, 8, 7, 6, 5, 4, 0
  classAverage?: number;
  highestMarks?: number;
  feedback?: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  title: string;
  description: string;
  dueDate: string;          // ISO string
  totalPoints: number;
  fileAttachmentName?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;      // ISO string
  fileName?: string;
  solutionNotes: string;
  status: 'submitted' | 'graded' | 'late';
  pointsAwarded?: number;
  feedback?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  role: string;
  date: string;
  category: 'academic' | 'exam' | 'urgent' | 'general';
}

export interface SemesterGpaRecord {
  semester: number;
  academicYear: string;
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
}

export interface OTPVerificationSession {
  email: string;
  otp: string;
  purpose: 'registration' | 'login' | 'email_verify' | 'faculty_registration' | 'student_registration';
  expiresAt: number;
  tempUserData?: Partial<User>;
}

export interface VerifiedLoginSessionDetails {
  user: User;
  verifiedAt: string;
  verificationMethod: string;
  purpose: string;
  otpCode: string;
  sessionToken: string;
  clientIp?: string;
}

export type ReportType =
  | 'student_performance'
  | 'attendance'
  | 'marks'
  | 'cgpa'
  | 'assignment'
  | 'semester_performance';

export interface ReportFilter {
  semester?: number | 'all';
  department?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}
