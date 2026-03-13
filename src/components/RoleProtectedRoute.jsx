import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects specific dashboard modules by checking the user's role.
 * If the user's role is not in the allowedRoles array, they are redirected to /dashboard.
 */
export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { userData, loading } = useAuth();
  const location = useLocation();

  // If auth is still loading, don't redirect yet to prevent flash
  if (loading) {
    return null; 
  }

  // If there's no user data or the user's role is not allowed, redirect to dashboard root
  const currentRole = userData?.role?.toLowerCase()?.trim();
  const isAllowed = allowedRoles.some(role => role.toLowerCase().trim() === currentRole);

  if (!userData || !isAllowed) {
    console.warn(`[RoleProtectedRoute] Access denied for role: "${userData?.role}" at path: "${location.pathname}". Allowed: ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
