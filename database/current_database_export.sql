-- ======================================================
-- CURRENT LIVE DATABASE EXPORT
-- Generated on 2026-10-07 14:54:59 (Live Auto-Sync)
-- ======================================================

USE student_performance_db;

-- 1. USERS TABLE (4 records stored):
INSERT INTO users (id, email, full_name, phone, role, status) VALUES
  (67, 'niharikagiramoni7@gmail.com', 'Niharika', '6302042898', 'ROLE_ADMIN', 'ACTIVE'),
  (269, 'giramoniniharika77@gmail.com', 'Neethu', '6302042898', 'ROLE_STUDENT', 'ACTIVE'),
  (270, 'sumalathagiramoni43@gmail.com', 'Arjun Varma', '6301865557', 'ROLE_FACULTY', 'ACTIVE'),
  (271, 'vinuthnamanikonda7@gmail.com', 'Vinuthna', '8639033522', 'ROLE_STUDENT', 'ACTIVE');

-- 2. LOGIN AUDIT LOGS TABLE (108 records stored):
INSERT INTO login_audits (id, user_id, email, full_name, role, ip_address, status, remarks, login_time) VALUES
  (2, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T10:05:12.403614'),
  (4, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T10:05:54.153518'),
  (5, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T10:05:54.215265'),
  (8, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T10:05:55.098689'),
  (9, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T10:05:55.118185'),
  (10, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T10:06:30.891729'),
  (11, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T10:06:30.930764'),
  (12, 100, 'neethu77@gmail.com', 'Neethu', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T10:08:42.673827'),
  (13, 100, 'neethu77@gmail.com', 'Neethu', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T10:08:49.803204'),
  (14, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T10:10:21.335375'),
  (15, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T10:10:29.801244'),
  (34, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T10:40:08.989698'),
  (35, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T10:40:29.879566'),
  (65, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T10:42:30.048254'),
  (66, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T11:04:21.677355'),
  (67, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T11:04:21.791827'),
  (68, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T11:04:42.104923'),
  (69, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T11:04:42.186901'),
  (70, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T11:05:21.303181'),
  (71, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T11:05:21.355797'),
  (72, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T11:05:33.651160'),
  (73, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T11:05:33.708932'),
  (74, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:22.096200'),
  (75, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:31.325079'),
  (76, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:31.401051'),
  (77, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:31.469431'),
  (78, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:31.547613'),
  (79, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:31.669483'),
  (80, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:31.756691'),
  (81, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:31.860809'),
  (82, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:39.893904'),
  (83, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:40.066574'),
  (84, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:40.220777'),
  (85, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:40.334022'),
  (86, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:40.420677'),
  (87, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-23T11:07:40.529627'),
  (97, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T11:15:20.031730'),
  (98, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T11:15:32.057767'),
  (99, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T13:06:49.495987'),
  (100, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T13:07:04.241493'),
  (101, 132, 'vinuthnamanikonda7@gmail.com', 'Vinuthna', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T13:21:11.906963'),
  (102, 132, 'vinuthnamanikonda7@gmail.com', 'Vinuthna', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T13:21:19.118929'),
  (103, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T14:54:20.230908'),
  (104, 1, 'admin@university.edu.in', 'Dr. Rajesh Kumar (Admin)', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T14:54:20.415663'),
  (105, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T14:55:22.859696'),
  (106, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T14:55:22.908307'),
  (107, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T14:55:34.826890'),
  (108, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T14:55:34.871214'),
  (109, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T22:20:29.372907'),
  (110, 2, 'prof.sharma@university.edu.in', 'Prof. Ramesh Sharma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T22:20:29.671864'),
  (111, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code.', '2026-09-23T22:32:39.656090'),
  (112, 99, 'arjun77@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-23T22:32:47.097639'),
  (141, NULL, 'nonexistent99@university.edu.in', NULL, NULL, '0:0:0:0:0:0:0:1', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-09-29T20:25:18.399398'),
  (142, 3, 'student@university.edu.in', 'Aarav Mehta', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-29T20:25:18.655491'),
  (143, NULL, 'nonexistent99@university.edu.in', NULL, NULL, '0:0:0:0:0:0:0:1', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-09-29T20:26:31.316009'),
  (144, 3, 'student@university.edu.in', 'Aarav Mehta', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-29T20:26:31.442735'),
  (173, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-29T21:45:58.999656'),
  (174, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-29T21:53:13.093873'),
  (205, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-29T22:32:04.021398'),
  (206, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-29T22:32:20.211119'),
  (207, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-29T22:32:37.272495'),
  (208, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-29T22:34:01.400172'),
  (209, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-29T22:34:17.670747'),
  (210, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-29T22:34:55.604298'),
  (211, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-29T22:36:17.142428'),
  (212, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-29T22:37:59.123371'),
  (213, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_INVALID_OTP', '2FA OTP verification failed: incorrect 6-digit code (attempt 1)', '2026-09-29T22:38:19.939709'),
  (214, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_INVALID_OTP', '2FA OTP verification failed: incorrect 6-digit code (attempt 1)', '2026-09-29T22:38:26.476145'),
  (215, 197, 'sumalathagiramoni43@gmail.com', 'Mister', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-29T22:38:50.758278'),
  (216, NULL, 'giramoniniharika77@gmail.com', NULL, 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-09-29T22:39:45.237784'),
  (217, 198, 'giramoniniharika77@gmail.com', 'Neethu', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-29T22:41:18.593276'),
  (218, 198, 'giramoniniharika77@gmail.com', 'Neethu', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-29T22:41:48.084664'),
  (219, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-29T22:42:28.959604'),
  (220, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-29T22:42:46.727599'),
  (221, NULL, 'sumalathagiramoni43@gmail.com', NULL, 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-09-30T09:21:31.481967'),
  (222, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-09-30T09:23:48.885516'),
  (253, NULL, 'other@gmail.com', NULL, 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-09-30T09:32:54.150169'),
  (254, 3, 'student@university.edu.in', 'Aarav Mehta', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'FAILED_ROLE_MISMATCH', 'Login rejected: role mismatch (requested ROLE_ADMIN)', '2026-09-30T09:33:03.058138'),
  (255, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T09:34:42.567723'),
  (256, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T09:35:11.494343'),
  (257, 132, 'vinuthnamanikonda7@gmail.com', 'Vinuthna', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T09:35:47.207135'),
  (258, 132, 'vinuthnamanikonda7@gmail.com', 'Vinuthna', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T09:36:19.106550'),
  (259, 199, 'sumalathagiramoni43@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T09:46:57.306299'),
  (260, 199, 'sumalathagiramoni43@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T09:47:33.578261'),
  (285, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:09:57.427235'),
  (286, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:10:31.033450'),
  (287, NULL, 'giramoniniharika77@gmail.com', NULL, 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-09-30T13:13:19.430548'),
  (288, 237, 'giramoniniharika77@gmail.com', 'Neethu', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:15:01.679810'),
  (289, 237, 'giramoniniharika77@gmail.com', 'Neethu', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:15:18.689792'),
  (290, NULL, 'sumalathagiramoni43@gmail.com', NULL, 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-09-30T13:16:52.239744'),
  (291, 239, 'sumalathagiramoni43@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:21:20.150490'),
  (292, 239, 'sumalathagiramoni43@gmail.com', 'Arjun', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:21:42.001316'),
  (317, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:37:08.889465'),
  (318, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_ADMIN', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:37:53.361302'),
  (319, NULL, 'giramoniniharika77@gmail.com', NULL, 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-09-30T13:38:47.422219'),
  (320, 269, 'giramoniniharika77@gmail.com', 'Neethu', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:39:51.601334'),
  (321, 269, 'giramoniniharika77@gmail.com', 'Neethu', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:40:13.795741'),
  (322, 270, 'sumalathagiramoni43@gmail.com', 'Arjun Varma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:41:32.058688'),
  (323, 270, 'sumalathagiramoni43@gmail.com', 'Arjun Varma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:41:50.427360'),
  (324, 270, 'sumalathagiramoni43@gmail.com', 'Arjun Varma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:42:54.292657'),
  (325, 270, 'sumalathagiramoni43@gmail.com', 'Arjun Varma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:43:12.002470'),
  (326, 271, 'vinuthnamanikonda7@gmail.com', 'Vinuthna', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:50:27.726749'),
  (327, 271, 'vinuthnamanikonda7@gmail.com', 'Vinuthna', 'ROLE_STUDENT', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:50:46.414154'),
  (328, 270, 'sumalathagiramoni43@gmail.com', 'Arjun Varma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'OTP_CHALLENGED', 'Password verified. Dispatched 6-digit 2FA OTP code to user email.', '2026-09-30T13:51:47.381200'),
  (329, 270, 'sumalathagiramoni43@gmail.com', 'Arjun Varma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'FAILED_INVALID_OTP', '2FA OTP verification failed: incorrect 6-digit code (attempt 1)', '2026-09-30T13:52:32.371561'),
  (330, 270, 'sumalathagiramoni43@gmail.com', 'Arjun Varma', 'ROLE_FACULTY', '0:0:0:0:0:0:0:1', 'SUCCESS', 'Two-factor authentication successful. User granted active session.', '2026-09-30T13:56:11.351080'),
  (331, NULL, 'test@notfound.com', NULL, 'ROLE_STUDENT', '103.177.233.106', 'FAILED_CREDENTIALS', 'Login failed: account does not exist', '2026-10-07T14:54:51.005730'),
  (332, 67, 'niharikagiramoni7@gmail.com', 'Niharika', 'ROLE_ADMIN', '103.177.233.106', 'FAILED_PASSWORD', 'Login failed: incorrect password', '2026-10-07T14:54:57.736965');

-- 3. DEPARTMENTS TABLE (3 records stored):
INSERT INTO departments (id, code, name) VALUES
  (1, 'CSE', 'Computer Science & Engineering'),
  (2, 'IT', 'Information Technology'),
  (3, 'ECE', 'Electronics & Communication Engineering');

-- 4. SUBJECTS TABLE (9 records stored):
INSERT INTO subjects (id, code, name, department, credits, semester) VALUES
  (1, 'CS301', 'Database Management Systems', 'Computer Science & Engineering', 4, 3),
  (2, 'CS302', 'Data Structures & Algorithms', 'Computer Science & Engineering', 4, 3),
  (3, 'CS303', 'Web Technologies', 'Computer Science & Engineering', 3, 3),
  (4, 'CS304', 'Operating Systems', 'Computer Science & Engineering', 4, 3),
  (5, 'IT201', 'Object Oriented Programming', 'Information Technology', 4, 2),
  (6, 'IT202', 'Computer Networks', 'Information Technology', 3, 2),
  (7, 'EC401', 'Digital Signal Processing', 'Electronics & Communication Engineering', 4, 4),
  (8, 'EC402', 'VLSI Design', 'Electronics & Communication Engineering', 4, 4),
  (33, 'SE101', 'Software Engineering', 'Computer Science & Engineering', 3, 5);

-- 5. STUDENTS TABLE (3 records stored):
INSERT INTO students (id, user_id, student_id, department, study_year, section, current_cgpa) VALUES
  (194, 269, '70572400102', 'Computer Science & Engineering', 3, 'A', 0.00),
  (195, 271, '70572400103', 'Computer Science & Engineering', 3, 'A', 0.00),
  (196, 67, '70572400000', 'Computer Science & Engineering', 1, 'A', 0.00);

-- 6. FACULTY TABLE (2 records stored):
INSERT INTO faculty (id, user_id, employee_id, department, designation) VALUES
  (164, 270, 'A001', 'Computer Science & Engineering', 'Assistant Professor'),
  (165, 67, 'A000', 'Computer Science & Engineering', 'Dean / Administrator');

-- 7. ATTENDANCE TABLE (0 records stored):
-- (empty)

-- 8. MARKS TABLE (0 records stored):
-- (empty)

-- 9. ASSIGNMENTS TABLE (0 records stored):
-- (empty)

-- 10. ASSIGNMENT SUBMISSIONS TABLE (0 records stored):
-- (empty)

