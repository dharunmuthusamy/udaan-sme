import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getBusinessUsers, updateUserRole, updateUserStatus } from '../../../services/dbService';

export default function UserManagement() {
  const { t } = useLanguage();
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userData?.businessId) {
      loadUsers();
    }
  }, [userData?.businessId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBusinessUsers(userData.businessId);
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(t('Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating role:', err);
      alert(t('Failed to update role'));
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      // Treat absence of status or 'undefined' as 'active' (since we didn't always have the status field)
      const newStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
      await updateUserStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Error updating status:', err);
      alert(t('Failed to update status'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-surface-900">{t('User Management')}</h1>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-medium">{t('Staff Contact Name')}</th>
                <th className="px-6 py-4 font-medium">{t('Phone Number')}</th>
                <th className="px-6 py-4 font-medium">{t('WhatsApp Number')}</th>
                <th className="px-6 py-4 font-medium">{t('Role')}</th>
                <th className="px-6 py-4 font-medium">{t('Status')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs uppercase">
                        {(user.fullName || user.phone || '?').charAt(0)}
                      </div>
                      <span className="font-bold text-surface-900">{user.fullName || 'Unknown Staff'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-surface-600 font-medium">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-surface-600">{user.whatsappNumber || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === userData.id} // Don't allow owner to change own role to prevent lockout
                      className="rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="owner">{t('Owner')}</option>
                      <option value="accountant">{t('Accountant')}</option>
                      <option value="storekeeper">{t('Storekeeper')}</option>
                      <option value="staff">{t('Staff')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.status === 'deactivated' 
                        ? 'bg-red-50 text-red-700' 
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {user.status === 'deactivated' ? t('Deactivated') : t('Active')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.id !== userData.id && (
                      <button
                        onClick={() => handleStatusChange(user.id, user.status)}
                        className={`text-sm font-bold transition-colors ${
                          user.status === 'deactivated' 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-red-500 hover:text-red-600'
                        }`}
                      >
                        {user.status === 'deactivated' ? t('Activate') : t('Deactivate')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-surface-500">
                    {t('No users found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
