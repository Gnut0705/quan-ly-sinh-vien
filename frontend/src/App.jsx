import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import ClassList from './pages/ClassList';
import ClassDetail from './pages/ClassDetail';
import CourseList from './pages/CourseList';
import GradeList from './pages/GradeList';
import StudentTranscript from './pages/StudentTranscript';
import Unauthorized from './pages/Unauthorized';
import './styles/index.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer />
          <Routes>
            {/* Public Route: Login */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes inside AppLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<StudentList />} />
              <Route path="students/:id/grades" element={<StudentTranscript />} />
              <Route path="classes" element={<ClassList />} />
              <Route path="classes/:id" element={<ClassDetail />} />
              <Route path="courses" element={<CourseList />} />
              <Route path="grades" element={<GradeList />} />
              <Route path="unauthorized" element={<Unauthorized />} />
            </Route>

            {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
