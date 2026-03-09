import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route that requires authentication.
 * Shows a spinner while auth state is loading, redirects to /login if unauthenticated.
 */
export default function ProtectedRoute({ children }) {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 text-primary-500 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-surface-700/60">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Global interception: if a staff user is pending, trap them in /waiting-approval
  if (userData?.joinStatus === 'pending' && location.pathname !== '/waiting-approval') {
    return <Navigate to="/waiting-approval" replace />;
  }

  // Prevent approved users (or owners) from viewing the waiting-approval screen manually
  if (userData?.joinStatus !== 'pending' && location.pathname === '/waiting-approval') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
