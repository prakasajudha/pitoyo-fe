import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const MasterRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ASSET') return <Navigate to="/master/recurring-config" replace />;
  return <Navigate to="/master/users" replace />;
};
