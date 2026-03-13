import { useAuth } from '../context/AuthContext';
import PremiumLockedView from './Dashboard/PremiumLockedView';

export default function PremiumProtectedRoute({ children }) {
  const { isPremium, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isPremium) {
    return <PremiumLockedView />;
  }

  return children;
}
