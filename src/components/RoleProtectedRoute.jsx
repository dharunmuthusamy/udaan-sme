import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects specific dashboard modules by checking the user's role.
 * If the user's role is not in the allowedRoles array, they are redirected to /dashboard.
 */
export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { userData, loading } = useAuth();

  // If auth is still loading, don't redirect yet to prevent flash
  if (loading) {
    return null; 
  }

  // If there's no user data or the user's role is not allowed, redirect to dashboard root
  if (!userData || !allowedRoles.includes(userData.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
