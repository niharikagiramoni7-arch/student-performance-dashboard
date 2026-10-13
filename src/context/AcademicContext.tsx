import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Course,
  AttendanceRecord,
  CourseAttendanceSummary,
  MarkRecord,
  Assignment,
  Submission,
  Announcement,
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_ATTENDANCE,
  INITIAL_MARKS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ANNOUNCEMENTS,
  STUDENT_SEMESTER_HISTORY,
} from '../data/mockData';

interface AcademicContextType {
  courses: Course[];
  attendance: AttendanceRecord[];
  marks: MarkRecord[];
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  getCourseAttendanceSummary: (studentId: string, courseId: string) => CourseAttendanceSummary;
  getAllCoursesAttendance: (studentId: string) => CourseAttendanceSummary[];
  getOverallAttendancePercentage: (studentId: string) => number;
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  markBulkAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  getStudentMarks: (studentId: string) => MarkRecord[];
  saveMarkRecord: (record: Partial<MarkRecord> & { studentId: string; courseId: string }) => void;
  deleteMarkRecord: (markId: string) => void;
  calculateSgpa: (studentId: string, semester?: number) => { sgpa: number; totalCredits: number; earnedPoints: number };
  calculateCgpa: (studentId: string) => { cgpa: number; totalCredits: number; semesterCount: number };
  submitAssignment: (assignmentId: string, studentId: string, studentName: string, notes: string, fileName?: string) => void;
  gradeSubmission: (submissionId: string, points: number, feedback?: string) => void;
  createAssignment: (data: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addCourse: (data: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addAnnouncement: (data: Omit<Announcement, 'id' | 'date'>) => void;
  getLetterAndPoint: (score: number) => { letter: string; point: number };
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

const COURSES_KEY = 'spd_courses_v1';
const ATTENDANCE_KEY = 'spd_attendance_v1';
const MARKS_KEY = 'spd_marks_v1';
const ASSIGNMENTS_KEY = 'spd_assignments_v1';
const SUBMISSIONS_KEY = 'spd_submissions_v1';
const ANNOUNCEMENTS_KEY = 'spd_announcements_v1';

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const s = localStorage.getItem(COURSES_KEY);
      return s ? JSON.parse(s) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const s = localStorage.getItem(ATTENDANCE_KEY);
      return s ? JSON.parse(s) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [marks, setMarks] = useState<MarkRecord[]>(() => {
    try {
      const s = localStorage.getItem(MARKS_KEY);
      return s ? JSON.parse(s) : INITIAL_MARKS;
    } catch {
      return INITIAL_MARKS;
    }
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const s = localStorage.getItem(ASSIGNMENTS_KEY);
      return s ? JSON.parse(s) : INITIAL_ASSIGNMENTS;
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const s = localStorage.getItem(SUBMISSIONS_KEY);
      return s ? JSON.parse(s) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const s = localStorage.getItem(ANNOUNCEMENTS_KEY);
      return s ? JSON.parse(s) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  // Persist state updates
  useEffect(() => {
    try {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error(e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
    } catch (e) {
      console.error(e);
    }
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
    } catch (e) {
      console.error(e);
    }
  }, [marks]);

  useEffect(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error(e);
    }
  }, [assignments]);

  useEffect(() => {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.error(e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    } catch (e) {
      console.error(e);
    }
  }, [announcements]);

  const getLetterAndPoint = (score: number): { letter: string; point: number } => {
    if (score >= 90) return { letter: 'O', point: 10 };
    if (score >= 80) return { letter: 'A+', point: 9 };
    if (score >= 70) return { letter: 'A', point: 8 };
    if (score >= 60) return { letter: 'B+', point: 7 };
    if (score >= 55) return { letter: 'B', point: 6 };
    if (score >= 50) return { letter: 'C', point: 5 };
    if (score >= 40) return { letter: 'P', point: 4 };
    return { letter: 'F', point: 0 };
  };

  const getCourseAttendanceSummary = (studentId: string, courseId: string): CourseAttendanceSummary => {
    const course = courses.find(c => c.id === courseId);
    const records = attendance.filter(a => a.studentId === studentId && a.courseId === courseId);

    const attended = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const total = records.length;

    // percentage: (attended + excused) / total or attended / total
    // Excused counts toward attendance eligibility in university standard
    const effectiveAttended = attended + excused;
    const percentage = total > 0 ? Math.round((effectiveAttended / total) * 100) : 100;

    let status: CourseAttendanceSummary['status'] = 'normal';
    if (percentage < 65) {
      status = 'critical';
    } else if (percentage < 75) {
      status = 'warning';
    }

    return {
      courseId,
      courseCode: course ? course.code : 'COURSE',
      courseName: course ? course.name : 'Unknown Course',
      credits: course ? course.credits : 3,
      totalClasses: total,
      attendedClasses: attended,
      absentClasses: absent,
      excusedClasses: excused,
      percentage,
      status,
    };
  };

  const getAllCoursesAttendance = (studentId: string): CourseAttendanceSummary[] => {
    return courses.map(course => getCourseAttendanceSummary(studentId, course.id));
  };

  const getOverallAttendancePercentage = (studentId: string): number => {
    const records = attendance.filter(a => a.studentId === studentId);
    if (records.length === 0) return 92; // default healthy
    const attended = records.filter(r => r.status === 'present' || r.status === 'excused').length;
    return Math.round((attended / records.length) * 100);
  };

  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setAttendance(prev => {
      const existingIndex = prev.findIndex(
        a => a.studentId === record.studentId && a.courseId === record.courseId && a.date === record.date
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], ...record };
        return copy;
      }
      return [...prev, { ...record, id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` }];
    });
  };

  const markBulkAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    records.forEach(rec => markAttendance(rec));
  };

  const getStudentMarks = (studentId: string): MarkRecord[] => {
    return marks.filter(m => m.studentId === studentId);
  };

  const saveMarkRecord = (data: Partial<MarkRecord> & { studentId: string; courseId: string }) => {
    setMarks(prev => {
      const idx = prev.findIndex(m => m.studentId === data.studentId && m.courseId === data.courseId);
      const components = data.components || [];
      const totalScore = components.reduce((sum, c) => sum + (c.obtainedMarks || 0), 0);
      const internalMarks = components.slice(0, 3).reduce((sum, c) => sum + (c.obtainedMarks || 0), 0);
      const externalMarks = components[3] ? components[3].obtainedMarks : 0;
      const { letter, point } = getLetterAndPoint(totalScore);

      const record: MarkRecord = {
        id: idx >= 0 ? prev[idx].id : `mrk-${Date.now()}`,
        studentId: data.studentId,
        courseId: data.courseId,
        semester: data.semester || 5,
        internalMarks: data.internalMarks !== undefined ? data.internalMarks : internalMarks,
        externalMarks: data.externalMarks !== undefined ? data.externalMarks : externalMarks,
        components,
        totalScore,
        gradeLetter: letter,
        gradePoint: point,
        classAverage: data.classAverage || 75,
        highestMarks: data.highestMarks || 95,
        feedback: data.feedback || '',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  const deleteMarkRecord = (markId: string) => {
    setMarks(prev => prev.filter(m => m.id !== markId));
  };

  const calculateSgpa = (studentId: string, semester: number = 5) => {
    const studentMarks = marks.filter(m => m.studentId === studentId && (m.semester === semester || !m.semester));
    if (studentMarks.length === 0) {
      return { sgpa: 8.8, totalCredits: 20, earnedPoints: 176 };
    }

    let totalCredits = 0;
    let earnedPoints = 0;

    studentMarks.forEach(m => {
      const course = courses.find(c => c.id === m.courseId);
      const credits = course ? course.credits : 3;
      totalCredits += credits;
      earnedPoints += credits * m.gradePoint;
    });

    const sgpa = totalCredits > 0 ? Number((earnedPoints / totalCredits).toFixed(2)) : 0;
    return { sgpa, totalCredits, earnedPoints };
  };

  const calculateCgpa = (studentId: string) => {
    // Current semester calculations
    const currentSem = calculateSgpa(studentId, 5);

    // Use historical semester records when available.
    if (studentId === 'usr-student-01') {
      let cumulativeCredits = 0;
      let cumulativePoints = 0;

      STUDENT_SEMESTER_HISTORY.forEach(sem => {
        cumulativeCredits += sem.totalCredits;
        cumulativePoints += sem.totalCredits * sem.sgpa;
      });

      // Add current semester 5
      cumulativeCredits += currentSem.totalCredits;
      cumulativePoints += currentSem.earnedPoints;

      const cgpa = Number((cumulativePoints / cumulativeCredits).toFixed(2));
      return {
        cgpa,
        totalCredits: cumulativeCredits,
        semesterCount: 5,
      };
    }

    // Generic formula for newly registered or other students
    return {
      cgpa: currentSem.sgpa,
      totalCredits: currentSem.totalCredits,
      semesterCount: 1,
    };
  };

  const submitAssignment = (
    assignmentId: string,
    studentId: string,
    studentName: string,
    notes: string,
    fileName: string = 'assignment_submission.zip'
  ) => {
    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      studentId,
      studentName,
      submittedAt: new Date().toISOString(),
      fileName,
      solutionNotes: notes,
      status: 'submitted',
    };

    setSubmissions(prev => {
      // replace if already submitted
      const filtered = prev.filter(s => !(s.assignmentId === assignmentId && s.studentId === studentId));
      return [...filtered, newSub];
    });
  };

  const gradeSubmission = (submissionId: string, points: number, feedback?: string) => {
    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            status: 'graded',
            pointsAwarded: points,
            feedback: feedback || sub.feedback,
          };
        }
        return sub;
      })
    );
  };

  const createAssignment = (data: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAsg: Assignment = {
      ...data,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments(prev => [newAsg, ...prev]);
  };

  const updateAssignment = (id: string, data: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    setSubmissions(prev => prev.filter(s => s.assignmentId !== id));
  };

  const addCourse = (data: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...data,
      id: `crs-${Date.now()}`,
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const addAnnouncement = (data: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  return (
    <AcademicContext.Provider
      value={{
        courses,
        attendance,
        marks,
        assignments,
        submissions,
        announcements,
        getCourseAttendanceSummary,
        getAllCoursesAttendance,
        getOverallAttendancePercentage,
        markAttendance,
        markBulkAttendance,
        getStudentMarks,
        saveMarkRecord,
        deleteMarkRecord,
        calculateSgpa,
        calculateCgpa,
        submitAssignment,
        gradeSubmission,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        addCourse,
        updateCourse,
        deleteCourse,
        addAnnouncement,
        getLetterAndPoint,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
