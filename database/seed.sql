-- ======================================================
-- CURRENT LIVE DATABASE EXPORT
-- Generated on 2026-10-23 14:51:00 (Live Auto-Sync)
-- ======================================================

USE student_performance_db;

-- 1. USERS TABLE (1 records stored):
INSERT INTO users (id, email, full_name, phone, role, status) VALUES
  (1, 'niharikagiramoni7@gmail.com', 'Institutional Administrator', '+91 9876543210', 'ROLE_ADMIN', 'ACTIVE');

-- 2. LOGIN AUDIT LOGS TABLE (3 records stored):
INSERT INTO login_audits (id, user_id, email, full_name, role, ip_address, status, remarks, login_time) VALUES
  (1, NULL, 'giramoniniharika77@gmail.com', NULL, 'ROLE_STUDENT', '103.177.233.106', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-10-23T14:00:08.872904'),
  (2, 1, 'niharikagiramoni7@gmail.com', 'Institutional Administrator', 'ROLE_ADMIN', '38.183.103.202', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-10-23T14:50:33.388252'),
  (3, 1, 'niharikagiramoni7@gmail.com', 'Institutional Administrator', 'ROLE_ADMIN', '38.183.103.202', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-10-23T14:50:58.310663');

-- 3. DEPARTMENTS TABLE (3 records stored):
INSERT INTO departments (id, code, name) VALUES
  (1, 'CSE', 'Computer Science & Engineering'),
  (2, 'IT', 'Information Technology'),
  (3, 'ECE', 'Electronics & Communication Engineering');

-- 4. SUBJECTS TABLE (8 records stored):
INSERT INTO subjects (id, code, name, department, credits, semester) VALUES
  (1, 'CS301', 'Database Management Systems', 'Computer Science & Engineering', 4, 3),
  (2, 'CS302', 'Data Structures & Algorithms', 'Computer Science & Engineering', 4, 3),
  (3, 'CS303', 'Web Technologies', 'Computer Science & Engineering', 3, 3),
  (4, 'CS304', 'Operating Systems', 'Computer Science & Engineering', 4, 3),
  (5, 'IT201', 'Object Oriented Programming', 'Information Technology', 4, 2),
  (6, 'IT202', 'Computer Networks', 'Information Technology', 3, 2),
  (7, 'EC401', 'Digital Signal Processing', 'Electronics & Communication Engineering', 4, 4),
  (8, 'EC402', 'VLSI Design', 'Electronics & Communication Engineering', 4, 4);

-- 5. STUDENTS TABLE (1 records stored):
INSERT INTO students (id, user_id, student_id, department, study_year, section, current_cgpa) VALUES
  (1, 1, '70572400000', 'Computer Science & Engineering', 1, 'A', 0.00);

-- 6. FACULTY TABLE (1 records stored):
INSERT INTO faculty (id, user_id, employee_id, department, designation) VALUES
  (1, 1, 'A000', 'Computer Science & Engineering', 'Dean / Administrator');

-- 7. ATTENDANCE TABLE (0 records stored):
-- (empty)

-- 8. MARKS TABLE (0 records stored):
-- (empty)

-- 9. ASSIGNMENTS TABLE (0 records stored):
-- (empty)

-- 10. ASSIGNMENT SUBMISSIONS TABLE (0 records stored):
-- (empty)

