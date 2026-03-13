import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getJoinRequests, approveJoinRequest, rejectJoinRequest, incrementCounter } from '../../../services/dbService';
import { Link } from 'react-router-dom';
import BackButton from '../../../components/Common/BackButton';
import UpgradeModal from '../../../components/Dashboard/UpgradeModal';

export default function JoinRequests() {
  const { userData } = useAuth();
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // requestId being acted on
  const [filter, setFilter] = useState('pending'); // pending | approved | rejected
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { businessData, checkFeatureLimit } = useAuth();

  const isOwner = userData?.role === 'owner';
  const businessId = userData?.businessId;

  useEffect(() => {
    if (!isOwner || !businessId) return;
    loadRequests();
  }, [isOwner, businessId, filter]);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await getJoinRequests(businessId, filter);
      setRequests(data);
    } catch (err) {
      console.error('[JoinRequests] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(request) {
    if (checkFeatureLimit('staff', businessData?.staffCount || 0)) {
      setShowUpgradeModal(true);
      return;
    }

    setActionLoading(request.requestId);
    try {
      await approveJoinRequest(request);
      // Increment counter
      await incrementCounter('businesses', businessId, 'staffCount', 1);
      setRequests((prev) => prev.filter((r) => r.requestId !== request.requestId));
    } catch (err) {
      console.error('[JoinRequests] Approve failed:', err);
      alert('Failed to approve request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(requestId) {
    setActionLoading(requestId);
    try {
      await rejectJoinRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      console.error('[JoinRequests] Reject failed:', err);
      alert('Failed to reject request. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  // Not an owner
  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-surface-900">Access Denied</h2>
        <p className="mt-1 text-sm text-surface-500">Only business owners can manage join requests.</p>
        <Link to="/dashboard/settings" className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700">
          ← Back to Settings
        </Link>
      </div>
    );
  }

  const roleLabels = {
    accountant: 'Accountant',
    storekeeper: 'Storekeeper',
    staff: 'Staff',
    field_staff: 'Field Staff',
  };

  const roleBadgeColors = {
    accountant: 'bg-blue-50 text-blue-700 border-blue-200',
    storekeeper: 'bg-amber-50 text-amber-700 border-amber-200',
    staff: 'bg-green-50 text-green-700 border-green-200',
    field_staff: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const statusBadge = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BackButton />
            <h1 className="text-2xl font-bold text-surface-900">Join Requests</h1>
          </div>
          <p className="text-sm text-surface-500 ml-7">Review and manage requests from people wanting to join your business</p>
        </div>
        <button
          onClick={loadRequests}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-surface-200 bg-white text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('Refresh')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-surface-100 p-1 gap-1 w-fit">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-bold rounded-lg capitalize transition-all ${filter === status
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {t(status)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-surface-900">{filter === 'pending' ? t('No pending requests') : filter === 'approved' ? t('No approved requests') : t('No rejected requests')}</h3>
          <p className="text-sm text-surface-500 mt-1">
            {filter === 'pending'
              ? t('When someone requests to join your business, it will appear here.')
              : t('No requests found for this status.')}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-50 border-b border-surface-200 text-xs font-bold uppercase tracking-wider text-surface-500">
            <div className="col-span-4">{t('Staff Name & Contact')}</div>
            <div className="col-span-3">{t('Requested Role')}</div>
            <div className="col-span-2">{t('Status')}</div>
            <div className="col-span-3 text-right">{filter === 'pending' ? t('Actions') : ''}</div>
          </div>

          {/* Rows */}
          {requests.map((req) => (
            <div
              key={req.requestId}
              className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-surface-100 last:border-b-0 hover:bg-surface-50/50 transition-colors"
            >
              <div className="col-span-4">
                <span className="text-sm font-semibold text-surface-900">{req.fullName || 'Unknown Staff'}</span>
                <p className="text-xs text-surface-500 mt-0.5">+91 {req.phone} {req.whatsappNumber && req.whatsappNumber !== req.phone ? `| WA: +91 ${req.whatsappNumber}` : ''}</p>
              </div>
              <div className="col-span-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${roleBadgeColors[req.requestedRole] || 'bg-surface-100 text-surface-600 border-surface-200'}`}>
                  {roleLabels[req.requestedRole] || req.requestedRole}
                </span>
              </div>
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${statusBadge[req.status]}`}>
                  {t(req.status)}
                </span>
              </div>
              <div className="col-span-3 flex items-center justify-end gap-2">
                {filter === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={actionLoading === req.requestId}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t('Approve')}
                    </button>
                    <button
                      onClick={() => handleReject(req.requestId)}
                      disabled={actionLoading === req.requestId}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('Reject')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        message={t('You have reached the limit of 3 staff members on the Free plan. Upgrade to Premium to manage a larger team.')}
      />
    </div>
  );
}
