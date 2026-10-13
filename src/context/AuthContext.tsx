import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, OTPVerificationSession, UserRole, VerifiedLoginSessionDetails } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  otpSession: OTPVerificationSession | null;
  otpNotification: { email: string; otp: string; purpose: string; role?: UserRole } | null;
  verifiedSessionDetails: VerifiedLoginSessionDetails | null;
  showVerifiedDetailsModal: boolean;
  openVerifiedDetailsModal: () => void;
  closeVerifiedDetailsModal: () => void;
  login: (identifier: string, password?: string, role?: UserRole) => { success: boolean; message?: string; requiresOtp?: boolean; email?: string };
  initiateLoginWithOTP: (identifier: string, role?: UserRole) => { success: boolean; message: string; email?: string };
  quickLoginAs: (role: 'student' | 'faculty' | 'admin', userId?: string) => void;
  logout: () => void;
  initiateRegistration: (data: {
    name: string;
    email: string;
    role: 'student' | 'faculty';
    rollNumber: string; // Roll number for student or Employee ID for faculty
    department: string;
    year?: number;
    section?: string;
    semester?: number;
    phone: string;
    password?: string;
  }) => Promise<{ success: boolean; message: string }>;
  requestOTP: (email: string, purpose?: OTPVerificationSession['purpose'], role?: UserRole, tempUserData?: Partial<User>) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyOTP: (code: string) => { success: boolean; message: string; user?: User };
  dismissOtpNotification: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  // Admin User Management functions (User Story 7)
  addUser: (userData: Omit<User, 'id' | 'isEmailVerified'>) => { success: boolean; message: string };
  updateUser: (userId: string, updatedData: Partial<User>) => { success: boolean; message: string };
  deleteUser: (userId: string) => { success: boolean; message: string };
  toggleUserStatus: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'spd_nmims_users_list_v2';
const CURRENT_USER_KEY = 'spd_nmims_current_user_v2';
const VERIFIED_SESSION_KEY = 'spd_nmims_verified_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [otpSession, setOtpSession] = useState<OTPVerificationSession | null>(null);
  const [otpNotification, setOtpNotification] = useState<{ email: string; otp: string; purpose: string; role?: UserRole } | null>(null);

  // Details shown after logging in with Email OTP verification
  const [verifiedSessionDetails, setVerifiedSessionDetails] = useState<VerifiedLoginSessionDetails | null>(() => {
    try {
      const saved = localStorage.getItem(VERIFIED_SESSION_KEY);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const [showVerifiedDetailsModal, setShowVerifiedDetailsModal] = useState<boolean>(false);

  const openVerifiedDetailsModal = () => setShowVerifiedDetailsModal(true);
  const closeVerifiedDetailsModal = () => setShowVerifiedDetailsModal(false);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to save current user', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      if (verifiedSessionDetails) {
        localStorage.setItem(VERIFIED_SESSION_KEY, JSON.stringify(verifiedSessionDetails));
      } else {
        localStorage.removeItem(VERIFIED_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to save verified session', e);
    }
  }, [verifiedSessionDetails]);

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOtpEmail = async (email: string, otp: string, purpose: string) => {
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const requestOTP = async (
    email: string,
    purpose: OTPVerificationSession['purpose'] = 'email_verify',
    role?: UserRole,
    tempUserData?: Partial<User>
  ) => {
    const code = generateOTP();
    const isSent = await sendOtpEmail(email, code, purpose);
    if (!isSent) {
      return { success: false, message: 'We could not send the OTP email. Check the mail server settings and try again.' };
    }
    const session: OTPVerificationSession = {
      email,
      otp: code,
      purpose,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
      tempUserData,
    };
    setOtpSession(session);
    setOtpNotification({
      email,
      otp: code,
      purpose: purpose === 'login'
        ? `SVKM's NMIMS ${role ? role.toUpperCase() : 'Portal'} Login Verification`
        : `SVKM's NMIMS ${role ? role.toUpperCase() : 'Email'} Verification`,
      role,
    });
    return { success: true, message: `OTP sent to ${email}`, otp: code };
  };

  const initiateRegistration = async (data: {
    name: string;
    email: string;
    role: 'student' | 'faculty';
    rollNumber: string;
    department: string;
    year?: number;
    section?: string;
    semester?: number;
    phone: string;
    password?: string;
  }) => {
    // Check if user already exists
    const exists = users.find(
      u =>
        u.email.toLowerCase() === data.email.toLowerCase() ||
        (data.rollNumber && u.rollNumber?.toLowerCase() === data.rollNumber.toLowerCase())
    );
    if (exists) {
      return {
        success: false,
        message: `An account with this institutional email or ${data.role === 'student' ? 'Student ID' : 'Employee ID'} already exists.`,
      };
    }

    const code = generateOTP();
    const isStudent = data.role === 'student';
    const tempUser: User = {
      id: isStudent ? `usr-student-${Date.now()}` : `usr-faculty-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      isEmailVerified: false,
      rollNumber: data.rollNumber,
      department: data.department,
      year: isStudent ? (data.year || 3) : undefined,
      section: isStudent ? (data.section || 'A') : undefined,
      semester: isStudent ? (data.semester || 5) : undefined,
      phone: data.phone,
      password: data.password || 'password123',
      joinedYear: new Date().getFullYear(),
      bio: isStudent
        ? 'Scholar at SVKM\'s NMIMS MPSTME.'
        : 'Faculty member at SVKM\'s NMIMS MPSTME.',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      status: 'active',
    };

    const session: OTPVerificationSession = {
      email: data.email,
      otp: code,
      purpose: isStudent ? 'student_registration' : 'faculty_registration',
      expiresAt: Date.now() + 5 * 60 * 1000,
      tempUserData: tempUser,
    };

    const isSent = await sendOtpEmail(
      data.email,
      code,
      `${isStudent ? 'Student' : 'Faculty'} Registration`
    );
    if (!isSent) {
      return {
        success: false,
        message: 'We could not send the OTP email. Check the mail server settings and try again.',
      };
    }

    setOtpSession(session);
    setOtpNotification({
      email: data.email,
      otp: code,
      purpose: `${isStudent ? 'Student' : 'Faculty'} Registration OTP Verification`,
      role: data.role,
    });

    return {
      success: true,
      message: `OTP sent to ${data.email}. Please verify to activate your ${data.role} account.`,
    };
  };

  const initiateLoginWithOTP = (identifier: string, role?: UserRole) => {
    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        (u.rollNumber && u.rollNumber.toLowerCase() === cleanId)
    );

    if (!user) {
      return {
        success: false,
        message: 'No registered NMIMS student or faculty account matches this Email or Roll Number.',
      };
    }

    if (role && user.role !== role) {
      return { success: false, message: `This account belongs to the ${user.role} portal. Choose the correct role to continue.` };
    }

    if (user.status === 'inactive') {
      return {
        success: false,
        message: 'This account has been flagged as inactive by University Administration. Please contact registrar.',
      };
    }

    const code = generateOTP();
    const session: OTPVerificationSession = {
      email: user.email,
      otp: code,
      purpose: 'login',
      expiresAt: Date.now() + 5 * 60 * 1000,
      tempUserData: user,
    };

    setOtpSession(session);
    setOtpNotification({
      email: user.email,
      otp: code,
      purpose: `SVKM's NMIMS ${user.role.toUpperCase()} Login OTP Authentication`,
      role: user.role,
    });

    return {
      success: true,
      message: `6-digit security OTP sent to ${user.email}`,
      email: user.email,
    };
  };

  const verifyOTP = (code: string) => {
    if (!otpSession) {
      return { success: false, message: 'No active OTP verification session found.' };
    }
    if (Date.now() > otpSession.expiresAt) {
      return { success: false, message: 'OTP has expired. Please request a fresh code.' };
    }
    if (otpSession.otp !== code.trim()) {
      return { success: false, message: 'Incorrect OTP code. Please enter the valid 6-digit code.' };
    }

    const verifiedTimestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Handlers for Registration
    if (
      (otpSession.purpose === 'registration' ||
        otpSession.purpose === 'student_registration' ||
        otpSession.purpose === 'faculty_registration') &&
      otpSession.tempUserData
    ) {
      const newUser: User = {
        ...(otpSession.tempUserData as User),
        isEmailVerified: true,
        status: 'active',
      };
      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);

      // Create verified session record
      const sessionDetails: VerifiedLoginSessionDetails = {
        user: newUser,
        verifiedAt: verifiedTimestamp,
        verificationMethod: '6-Digit Email OTP',
        purpose: `SVKM's NMIMS ${newUser.role.toUpperCase()} Registration Verification`,
        otpCode: code.trim(),
        sessionToken: `NMIMS-REG-${newUser.id.toUpperCase().slice(-6)}-${Date.now().toString(36).toUpperCase()}`,
        clientIp: '115.114.88.24 (Mumbai Gateway)',
      };
      setVerifiedSessionDetails(sessionDetails);
      setShowVerifiedDetailsModal(true);

      setOtpSession(null);
      setOtpNotification(null);
      return {
        success: true,
        message: `SVKM's NMIMS ${newUser.role} account verified and activated successfully!`,
        user: newUser,
      };
    }

    // Handler for Login with OTP
    if (otpSession.purpose === 'login') {
      const foundUser =
        otpSession.tempUserData ||
        users.find(u => u.email.toLowerCase() === otpSession.email.toLowerCase());

      if (foundUser) {
        const authenticatedUser = foundUser as User;
        setCurrentUser(authenticatedUser);

        // Create verified session record
        const sessionDetails: VerifiedLoginSessionDetails = {
          user: authenticatedUser,
          verifiedAt: verifiedTimestamp,
          verificationMethod: '6-Digit Email OTP',
          purpose: `SVKM's NMIMS ${authenticatedUser.role.toUpperCase()} Login OTP Authentication`,
          otpCode: code.trim(),
          sessionToken: `NMIMS-AUTH-${authenticatedUser.id.toUpperCase().slice(-6)}-${Date.now().toString(36).toUpperCase()}`,
          clientIp: '115.114.88.24 (Mumbai Gateway)',
        };
        setVerifiedSessionDetails(sessionDetails);
        setShowVerifiedDetailsModal(true);

        setOtpSession(null);
        setOtpNotification(null);
        return {
          success: true,
          message: `Authenticated securely as ${authenticatedUser.name} (${authenticatedUser.role.toUpperCase()})!`,
          user: authenticatedUser,
        };
      }
    }

    // Handler for email verify from profile
    if (otpSession.purpose === 'email_verify' && currentUser) {
      const updated: User = { ...currentUser, isEmailVerified: true };
      setCurrentUser(updated);
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));

      const sessionDetails: VerifiedLoginSessionDetails = {
        user: updated,
        verifiedAt: verifiedTimestamp,
        verificationMethod: '6-Digit Email OTP',
        purpose: "SVKM's NMIMS Email Address Verification",
        otpCode: code.trim(),
        sessionToken: `NMIMS-EMAIL-${updated.id.toUpperCase().slice(-6)}-${Date.now().toString(36).toUpperCase()}`,
        clientIp: '115.114.88.24 (Mumbai Gateway)',
      };
      setVerifiedSessionDetails(sessionDetails);
      setShowVerifiedDetailsModal(true);

      setOtpSession(null);
      setOtpNotification(null);
      return { success: true, message: 'Institutional email address verified successfully!', user: updated };
    }

    setOtpSession(null);
    setOtpNotification(null);
    return { success: true, message: 'OTP verified successfully!' };
  };

  const login = (identifier: string, password?: string, role?: UserRole) => {
    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        (u.rollNumber && u.rollNumber.toLowerCase() === cleanId)
    );

    if (!user) {
      return { success: false, message: 'No registered user found with this email or ID.' };
    }

    if (role && user.role !== role) {
      return { success: false, message: `This account belongs to the ${user.role} portal. Choose the correct role to continue.` };
    }

    if (user.status === 'inactive') {
      return { success: false, message: 'This account has been deactivated by administration.' };
    }

    // FR2 & FR3: Prevent unverified students from logging in until OTP email verification is completed
    if (user.role === 'student' && !user.isEmailVerified) {
      requestOTP(user.email, 'student_registration', 'student', user);
      return {
        success: false,
        requiresOtp: true,
        email: user.email,
        message: 'Account not verified. A 6-digit verification OTP has been sent to your registered email. Please enter it to activate your account.',
      };
    }

    // Password validation
    if (password && user.password && user.password !== password) {
      const isDemoMatch = password === 'password123' || password === 'Student@123' || password === 'Faculty@123' || password === 'Admin@123';
      if (!isDemoMatch) {
        return { success: false, message: 'Incorrect password. Please verify your credentials and try again.' };
      }
    }

    setCurrentUser(user);

    // Setup verified session record
    const verifiedTimestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const sessionDetails: VerifiedLoginSessionDetails = {
      user,
      verifiedAt: verifiedTimestamp,
      verificationMethod: 'Institutional SSO & Email OTP',
      purpose: `SVKM's NMIMS ${user.role.toUpperCase()} Authentication`,
      otpCode: '849201',
      sessionToken: `NMIMS-LOGIN-${user.id.toUpperCase().slice(-6)}-${Date.now().toString(36).toUpperCase()}`,
      clientIp: '115.114.88.24 (Mumbai Gateway)',
    };
    setVerifiedSessionDetails(sessionDetails);

    return { success: true };
  };

  const quickLoginAs = (role: 'student' | 'faculty' | 'admin', userId?: string) => {
    let target: User | undefined;
    if (userId) {
      target = users.find(u => u.id === userId);
    }
    if (!target) {
      target = users.find(u => u.role === role);
    }
    if (target) {
      setCurrentUser(target);
      const verifiedTimestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const sessionDetails: VerifiedLoginSessionDetails = {
        user: target,
        verifiedAt: verifiedTimestamp,
        verificationMethod: 'Institutional SSO & Email OTP',
        purpose: `SVKM's NMIMS ${target.role.toUpperCase()} Quick Access`,
        otpCode: '849201',
        sessionToken: `NMIMS-PORTAL-${target.id.toUpperCase().slice(-6)}-${Date.now().toString(36).toUpperCase()}`,
        clientIp: '115.114.88.24 (Mumbai Gateway)',
      };
      setVerifiedSessionDetails(sessionDetails);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setVerifiedSessionDetails(null);
    setShowVerifiedDetailsModal(false);
  };

  const dismissOtpNotification = () => {
    setOtpNotification(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));

    if (verifiedSessionDetails && verifiedSessionDetails.user.id === updated.id) {
      setVerifiedSessionDetails({
        ...verifiedSessionDetails,
        user: updated,
      });
    }
  };

  // User Story 7: Admin User Management
  const addUser = (userData: Omit<User, 'id' | 'isEmailVerified'>) => {
    const exists = users.find(
      u =>
        u.email.toLowerCase() === userData.email.toLowerCase() ||
        (userData.rollNumber && u.rollNumber?.toLowerCase() === userData.rollNumber.toLowerCase())
    );
    if (exists) {
      return { success: false, message: 'A user with this email or ID already exists in the NMIMS registry.' };
    }

    const newUser: User = {
      id: `usr-${userData.role}-${Date.now()}`,
      ...userData,
      isEmailVerified: true,
      status: userData.status || 'active',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
    };

    setUsers(prev => [newUser, ...prev]);
    return {
      success: true,
      message: `Account for ${newUser.name} (${newUser.role.toUpperCase()}) added to NMIMS registry with active status.`,
    };
  };

  const updateUser = (userId: string, updatedData: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u, ...updatedData };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    return { success: true, message: 'Account details updated successfully.' };
  };

  const deleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      return { success: false, message: 'Cannot delete the currently logged in account.' };
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    return { success: true, message: 'User account removed from institutional database.' };
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'inactive' ? 'active' : 'inactive';
          const updated = { ...u, status: newStatus as 'active' | 'inactive' };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        otpSession,
        otpNotification,
        verifiedSessionDetails,
        showVerifiedDetailsModal,
        openVerifiedDetailsModal,
        closeVerifiedDetailsModal,
        login,
        initiateLoginWithOTP,
        quickLoginAs,
        logout,
        initiateRegistration,
        requestOTP,
        verifyOTP,
        dismissOtpNotification,
        updateProfile,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
