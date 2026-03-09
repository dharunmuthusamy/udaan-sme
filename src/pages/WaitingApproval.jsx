import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function WaitingApproval() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] items-center justify-center p-6 bg-surface-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-surface-200 text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 text-primary-600 flex items-center justify-center rounded-full mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-surface-900 mb-4">Waiting for Approval</h2>
        <p className="text-surface-600 mb-6">
          Your request to join the business is waiting for approval from the owner.
        </p>
        <button 
          onClick={async () => { await logout(); navigate('/login'); }} 
          className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 w-full transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
