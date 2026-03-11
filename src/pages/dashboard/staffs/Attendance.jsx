import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { attendanceService } from '../../../services/attendanceService';
import { getBusinessUsers } from '../../../services/dbService';
import SearchableDropdown from '../../../components/Common/SearchableDropdown';

export default function Attendance() {
  const { userData } = useAuth();
  const { t } = useLanguage();
  const [attendance, setAttendance] = useState([]);
  const [activeAttendance, setActiveAttendance] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [filterStaff, setFilterStaff] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (userData?.businessId) {
      loadData();
      if (userData.role === 'owner' || userData.role === 'accountant') {
        loadStaffList();
      }
    }
  }, [userData]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const isManager = ['owner', 'accountant', 'storekeeper'].includes(userData?.role);
      let data;
      if (isManager) {
        data = await attendanceService.getAll(userData.businessId);
      } else {
        data = await attendanceService.getByStaff(userData.businessId, userData.userId);
      }
      setAttendance(data);

      const active = await attendanceService.getActiveAttendance(userData.userId);
      setActiveAttendance(active);
    } catch (err) {
      console.error('Error loading attendance:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const users = await getBusinessUsers(userData.businessId);
      // Format for SearchableDropdown: { id, name }
      setStaffList(users.map(u => ({ id: u.userId, name: u.fullName || u.phone })));
    } catch (err) {
      console.error('Error loading staff list:', err);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await attendanceService.checkIn(userData.businessId, userData.userId, userData.fullName || userData.phone || userData.name);
      await loadData();
    } catch (err) {
      console.error('Check-in failed:', err);
      alert(t('You are already checked in today.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeAttendance) return;
    try {
      setActionLoading(true);
      await attendanceService.checkOut(activeAttendance.id);
      await loadData();
    } catch (err) {
      console.error('Check-out failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesStaff = !filterStaff || record.staffId === filterStaff;
    const recordDate = new Date(record.date);
    const matchesStart = !startDate || recordDate >= new Date(startDate);
    const matchesEnd = !endDate || recordDate <= new Date(endDate);
    return matchesStaff && matchesStart && matchesEnd;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const isOwner = userData?.role === 'owner' || userData?.role === 'accountant';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Action Header */}
      <div className="bg-white rounded-[2.5rem] border border-surface-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-surface-900 tracking-tight">{t('Daily Attendance')}</h2>
          <p className="text-surface-500 font-medium">{t('Check in when you start work and out when you finish.')}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={activeAttendance !== null || actionLoading}
            className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
              activeAttendance === null 
                ? 'bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5' 
                : 'bg-surface-100 text-surface-400'
            }`}
          >
            {t('Check In')}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={activeAttendance === null || actionLoading}
            className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
              activeAttendance !== null 
                ? 'bg-red-600 text-white shadow-red-500/20 hover:bg-red-700 hover:-translate-y-0.5' 
                : 'bg-surface-100 text-surface-400'
            }`}
          >
            {t('Check Out')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-50 rounded-3xl p-6 border border-surface-200 flex flex-col md:flex-row gap-4 items-end">
        {isOwner && (
          <div className="flex-1 w-full md:w-auto">
            <SearchableDropdown
              type="staff"
              label={t('Filter by Staff')}
              value={filterStaff}
              onChange={setFilterStaff}
              options={staffList}
              placeholder={t('All Staff')}
            />
          </div>
        )}
        <div className="flex-1 w-full md:w-auto">
          <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{t('Start Date')}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-2xl border border-surface-200 bg-white p-4 font-bold focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none"
          />
        </div>
        <div className="flex-1 w-full md:w-auto">
          <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{t('End Date')}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-2xl border border-surface-200 bg-white p-4 font-bold focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all outline-none"
          />
        </div>
        <button
          onClick={() => { setFilterStaff(''); setStartDate(''); setEndDate(''); }}
          className="px-6 py-4 rounded-2xl font-black text-surface-500 hover:bg-surface-100 transition-all"
        >
          {t('Reset')}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
          {t('Failed to load attendance:')} {error}
          <button onClick={loadData} className="ml-4 underline hover:text-red-700">{t('Retry')}</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-medium">{t('Date')}</th>
                <th className="px-6 py-4 font-medium">{t('Staff Name')}</th>
                <th className="px-6 py-4 font-medium">{t('Check In Time')}</th>
                <th className="px-6 py-4 font-medium">{t('Check Out Time')}</th>
                <th className="px-6 py-4 font-medium">{t('Hours Worked')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-surface-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs uppercase">
                        {(record.staffName || '?').charAt(0)}
                      </div>
                      <span className="font-bold text-surface-900">{record.staffName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-600 font-medium">
                    {record.checkInTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-surface-600 font-medium">
                    {record.checkOutTime 
                      ? record.checkOutTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : <span className="text-primary-600 bg-primary-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{t('Active')}</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-surface-900">
                      {record.hoursWorked > 0 ? `${record.hoursWorked} hrs` : '-'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-surface-500 font-medium">
                    {t('No attendance records found.')}
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
