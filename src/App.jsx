import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Tasks } from './pages/Tasks';
import { Dashboard } from './pages/Dashboard';
import { MasterRedirect } from './pages/master/MasterRedirect';
import { MasterUsers } from './pages/master/MasterUsers';
import { MasterRecurringConfig } from './pages/master/MasterRecurringConfig';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const LoginOrRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginOrRedirect />} />
          <Route path="/" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ASSET']}><Dashboard /></ProtectedRoute>} />
          <Route path="/master" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ASSET']}><MasterRedirect /></ProtectedRoute>} />
          <Route path="/master/users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><MasterUsers /></ProtectedRoute>} />
          <Route path="/master/recurring-config" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ASSET']}><MasterRecurringConfig /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
