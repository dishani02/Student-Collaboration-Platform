import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/layout/PublicLayout'

// Public pages
import Home from './pages/public/Home'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Help from './pages/public/Help'

// Auth pages
import Login from './pages/auth/Login'

// Student pages
import Dashboard from './pages/student/Dashboard'
import Resources from './pages/student/Resources'
import StudentResourceDetail from './pages/student/ResourceDetail'
import Chat from './pages/student/Chat'
import StudentGroups from './pages/student/Groups'
import StudentGroupTable from './pages/student/GroupTable'
import StudentProfile from './pages/student/Profile'

// Session pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminSessions from './pages/admin/Sessions'
import AdminSessionDetail from './pages/admin/SessionDetail'
import AdminCreateSession from './pages/admin/CreateSession'
import AdminEditSessionDetails from './pages/admin/EditSessionDetails'
import AdminGroups from './pages/admin/Groups'

import StudentSessions from './pages/student/Sessions'
import StudentSessionDetail from './pages/student/SessionDetail'

import ExpertDashboard from './pages/expert/Dashboard'
import ExpertSessionHistory from './pages/expert/SessionHistory'
import ExpertJoinedSessions from './pages/expert/JoinedSessions'
import ExpertConductedSessions from './pages/expert/ConductedSessions'

import LecturerDashboard from './pages/lecturer/Dashboard'
import LecturerGroups from './pages/lecturer/Groups'
import LecturerProfile from './pages/lecturer/Profile'
import LecturerModules from './pages/lecturer/Modules'
import CreateGroupTable from './pages/lecturer/CreateGroupTable'
import GroupTableDetail from './pages/lecturer/GroupTableDetail'

import Profile from './pages/Profile'
import AdminResources from './pages/admin/Resources'
import AdminResourceDetail from './pages/admin/ResourceDetail'
import Settings from './pages/Settings'
import ToBeImplemented from './pages/ToBeImplemented'

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/help" element={<PublicLayout><Help /></PublicLayout>} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        {/* Register: redirect to login (to be implemented) */}
        <Route path="/register" element={<Navigate to="/login" replace />} />
        
        {/* Main App Routes (Protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={
            user?.role === 'admin' ? <Navigate to="/admin/sessions" replace /> :
            user?.role === 'lecturer' ? <LecturerDashboard /> :
            user?.role === 'expert' ? <ExpertDashboard /> :
            <Dashboard />
          } />
          
          {/* Resources - Shared route but handled by role wrapper */}
          <Route 
            path="/resources" 
            element={
              <ProtectedRoute allowedRoles={['student', 'expert', 'admin']}>
                {user?.role === 'admin' ? <AdminResources /> : <Resources />}
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Resource Alias */}
          <Route 
            path="/admin/resources" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminResources />
              </ProtectedRoute>
            } 
          />
          
          {/* Resource Detail - Role specific */}
          <Route path="/student/resources/:id" element={<ProtectedRoute allowedRoles={['student', 'expert']}><StudentResourceDetail /></ProtectedRoute>} />
          <Route path="/admin/resources/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminResourceDetail /></ProtectedRoute>} />

          {/* Student Groups */}
          <Route path="/groups" element={
            user?.role === 'lecturer' ? <Navigate to="/lecturer/groups" replace /> :
            user?.role === 'admin' ? <Navigate to="/admin/groups" replace /> :
            <Navigate to="/student/groups" replace />
          } />
          <Route path="/student/groups" element={<ProtectedRoute allowedRoles={['student']}><StudentGroups /></ProtectedRoute>} />
          <Route path="/student/groups/:moduleCode" element={<ProtectedRoute allowedRoles={['student']}><StudentGroupTable /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />

          {/* Admin Groups */}
          <Route path="/admin/groups" element={<ProtectedRoute allowedRoles={['admin']}><AdminGroups /></ProtectedRoute>} />
          <Route path="/admin/groups/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminGroups /></ProtectedRoute>} />
          
          {/* Admin Sessions */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/sessions/create" element={<AdminCreateSession />} />
            <Route path="/admin/sessions/:id" element={<AdminSessionDetail />} />
            <Route path="/admin/sessions/:id/edit" element={<AdminEditSessionDetails />} />
          </Route>

          {/* Student Sessions */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/sessions" element={<StudentSessions />} />
            <Route path="/student/sessions/:id" element={<StudentSessionDetail />} />
          </Route>

          {/* Expert Sessions */}
          <Route element={<ProtectedRoute allowedRoles={['expert']} />}>
            <Route path="/expert/dashboard" element={<ExpertDashboard />} />
            <Route path="/expert/session-history" element={<ExpertSessionHistory />} />
            <Route path="/expert/joined-sessions" element={<ExpertJoinedSessions />} />
            <Route path="/expert/conducted-sessions" element={<ExpertConductedSessions />} />
            <Route path="/expert/sessions/:id" element={<StudentSessionDetail />} />
          </Route>

          {/* Lecturer Flow */}
          <Route element={<ProtectedRoute allowedRoles={['lecturer']} />}>
            <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
            <Route path="/lecturer/modules" element={<LecturerModules />} />
            <Route path="/lecturer/profile" element={<LecturerProfile />} />
            <Route path="/lecturer/groups" element={<LecturerGroups />} />
            <Route path="/lecturer/groups/create" element={<CreateGroupTable />} />
            <Route path="/lecturer/groups/:id" element={<GroupTableDetail />} />
            <Route path="/lecturer/sessions/:id" element={<StudentSessionDetail />} />
          </Route>

          {/* Additional Features */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/feed" element={<ToBeImplemented />} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><ToBeImplemented /></ProtectedRoute>} />
            <Route path="/expert-queue" element={<ProtectedRoute allowedRoles={['admin']}><ToBeImplemented /></ProtectedRoute>} />
            <Route path="/modules" element={
              <ProtectedRoute allowedRoles={['lecturer', 'admin']}>
                {user?.role === 'lecturer' ? <LecturerModules /> : <ToBeImplemented />}
              </ProtectedRoute>
            } />
          </Route>
        </Route>

        {/* 404 → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App