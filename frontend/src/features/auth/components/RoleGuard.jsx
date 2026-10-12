import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { AuthGuard } from './AuthGuard.jsx';

export function RoleGuard({ roles, children }) {
  const { user } = useAuth();
  return (
    <AuthGuard>
      {roles.some((role) => user?.roles?.includes(role)) ? children : <Navigate to="/" replace />}
    </AuthGuard>
  );
}
