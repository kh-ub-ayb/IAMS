import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Core Pages (Eager load to prevent jank on first paint)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';

// Lazy Loaded Dashboards (Code Splitting)
const SuperAdminDashboard = React.lazy(() => import('./pages/SuperAdminDashboard'));
const ManagerView = React.lazy(() => import('./pages/ManagerView'));
const TeacherView = React.lazy(() => import('./pages/TeacherView'));
const StudentView = React.lazy(() => import('./pages/StudentView'));

// Lazy Loaded Features
const BatchManagement = React.lazy(() => import('./pages/BatchManagement'));
const BranchManagement = React.lazy(() => import('./pages/BranchManagement'));
const SemesterView = React.lazy(() => import('./pages/SemesterView'));
const SubjectManagement = React.lazy(() => import('./pages/SubjectManagement'));
const TeacherAttendance = React.lazy(() => import('./pages/TeacherAttendance'));
const StudentAttendance = React.lazy(() => import('./pages/StudentAttendance'));
const FeeManagement = React.lazy(() => import('./pages/FeeManagement'));
const StudentFeeDashboard = React.lazy(() => import('./pages/StudentFeeDashboard'));
const Announcements = React.lazy(() => import('./pages/Announcements'));
const AIAssistant = React.lazy(() => import('./pages/AIAssistant'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const StudentResult = React.lazy(() => import('./pages/StudentResult'));

const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const Marks = React.lazy(() => import('./pages/Marks'));
const ClassStudents = React.lazy(() => import('./pages/ClassStudents'));

const Institutions = React.lazy(() => import('./pages/Institutions'));
const Managers = React.lazy(() => import('./pages/Managers'));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs'));
const StaffManagement = React.lazy(() => import('./pages/StaffManagement'));
const StudentManagement = React.lazy(() => import('./pages/StudentManagement'));

// Fallback Spinner
const PageLoader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 text-sm font-medium">Loading Module...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Group (uses MainLayout & PrivateRoute) */}
          <Route path="/" element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* --- Role Based Routes --- */}
              <Route element={<RoleProtectedRoute allowedRoles={['SuperAdmin']} />}>
                <Route path="institutions" element={<Suspense fallback={<PageLoader />}><Institutions /></Suspense>} />
                <Route path="managers" element={<Suspense fallback={<PageLoader />}><Managers /></Suspense>} />
                <Route path="audit" element={<Suspense fallback={<PageLoader />}><AuditLogs /></Suspense>} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['Manager']} />}>
                <Route path="manager/staff" element={<Suspense fallback={<PageLoader />}><StaffManagement /></Suspense>} />
                <Route path="manager/students" element={<Suspense fallback={<PageLoader />}><StudentManagement /></Suspense>} />
                <Route path="manager/settings" element={<Suspense fallback={<PageLoader />}><StaffManagement /></Suspense>} />
                <Route path="academics/batches" element={<Suspense fallback={<PageLoader />}><BatchManagement /></Suspense>} />
                <Route path="academics/branches" element={<Suspense fallback={<PageLoader />}><BranchManagement /></Suspense>} />
                <Route path="fees/manage" element={<Suspense fallback={<PageLoader />}><FeeManagement /></Suspense>} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['Manager', 'ClassTeacher', 'Teacher', 'Student']} />}>
                {/* Semesters & Subjects are viewable by everyone in the system, but creation is restricted at the API/UI level within the component based on role */}
                <Route path="academics/semesters" element={<Suspense fallback={<PageLoader />}><SemesterView /></Suspense>} />
                <Route path="academics/subjects" element={<Suspense fallback={<PageLoader />}><SubjectManagement /></Suspense>} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['Manager', 'ClassTeacher', 'Teacher']} />}>
                <Route path="attendance/mark" element={<Suspense fallback={<PageLoader />}><TeacherAttendance /></Suspense>} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['Manager', 'ClassTeacher']} />}>
                <Route path="announcements" element={<Suspense fallback={<PageLoader />}><Announcements /></Suspense>} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['Teacher', 'ClassTeacher']} />}>
                <Route path="classes" element={<Suspense fallback={<PageLoader />}><TeacherDashboard /></Suspense>} />
                <Route path="marks" element={<Suspense fallback={<PageLoader />}><Marks /></Suspense>} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['ClassTeacher']} />}>
                <Route path="class-students" element={<Suspense fallback={<PageLoader />}><ClassStudents /></Suspense>} />
              </Route>

              <Route element={<RoleProtectedRoute allowedRoles={['Student']} />}>
                <Route path="student/academics" element={<Suspense fallback={<PageLoader />}><StudentDashboard /></Suspense>} />
                <Route path="student/result" element={<Suspense fallback={<PageLoader />}><StudentResult /></Suspense>} />
                <Route path="student-attendance" element={<Suspense fallback={<PageLoader />}><StudentAttendance /></Suspense>} />
                <Route path="student-fees" element={<Suspense fallback={<PageLoader />}><StudentFeeDashboard /></Suspense>} />
                <Route path="ai-assistant" element={<Suspense fallback={<PageLoader />}><AIAssistant /></Suspense>} />
              </Route>

              {/* Catch All - Nested inside main layout so header/sidebar remain */}
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Route>
          </Route>

          <Route path="/access-denied" element={<AccessDenied />} />
          {/* Fallback for completely non-existent root paths */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
