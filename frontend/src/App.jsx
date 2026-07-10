import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute   from './components/ProtectedRoute';
import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import UserManagement   from './pages/UserManagement';
import Profile          from './pages/Profile';
import ForgotPassword   from './pages/ForgotPassword';
import ResetPassword    from './pages/ResetPassword';

export default function App() {
  return (
    <Routes>
      <Route path="/login"           element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      }/>
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <UserManagement />
        </ProtectedRoute>
      }/>
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      }/>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
