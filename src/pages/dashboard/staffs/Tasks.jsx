import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { taskService } from '../../../services/taskService';
import { getBusinessUsers } from '../../../services/dbService';
import TaskTable from '../../../components/Dashboard/TaskTable';
import SearchableDropdown from '../../../components/Common/SearchableDropdown';

export default function Tasks() {
  const { businessData, userData } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    if (businessData?.id) {
      loadData();
    }
  }, [businessData]);

  async function loadData() {
    try {
      setError('');
      const isOwner = userData?.role === 'owner';
      const [tasksData, staffData] = await Promise.all([
        isOwner 
          ? taskService.getAll(businessData.id)
          : taskService.getByStaff(businessData.id, userData.id),
        getBusinessUsers(businessData.id)
      ]);
      const formattedStaff = staffData.map(s => {
        const displayName = s.fullName || s.name || s.phone || 'Unknown Staff';
        return {
          ...s,
          name: (s.phone && displayName !== s.phone) ? `${displayName} - ${s.phone}` : displayName,
        };
      });

      const enrichedTasks = tasksData.map(t => {
        const staff = formattedStaff.find(s => s.id === t.assignedTo);
        return {
          ...t,
          assignedToName: staff ? staff.name : 'Unknown Staff'
        };
      });

      setTasks(enrichedTasks);
      setStaff(formattedStaff);
    } catch (err) {
      console.error('[Tasks] Load error:', err);
      if (err.message.includes('index')) {
        setError('Missing Firestore Index. Please deploy indexes.');
      } else {
        setError('Failed to load tasks. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'All' && task.status !== filterStatus) return false;
    if (filterStaff && task.assignedTo !== filterStaff) return false;
    
    if (filterStartDate && filterEndDate) {
      if (task.dueDate < filterStartDate || task.dueDate > filterEndDate) return false;
    } else if (filterStartDate) {
      if (task.dueDate < filterStartDate) return false;
    } else if (filterEndDate) {
      if (task.dueDate > filterEndDate) return false;
    }
    
    return true;
  });

  const clearFilters = () => {
    setFilterStatus('All');
    setFilterStaff('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const pendingTasks = filteredTasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length;

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      // Optimistic UI update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('[Tasks] Update status error:', err);
      // Could show a toast notification here
    }
  };

  return (
    <div className="space-y-8 anime-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Task Management')}</h1>
          <p className="text-surface-500 mt-1 font-medium">{t('Manage and track your operational tasks.')}</p>
        </div>
        <Link
          to="/dashboard/staffs/tasks/create"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('Create Task')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-50 rounded-2xl flex items-center justify-center text-surface-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2-2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Total')}</p>
              <h3 className="text-2xl font-black text-surface-900">{filteredTasks.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Pending')}</p>
              <h3 className="text-2xl font-black text-surface-900">{pendingTasks}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('In Progress')}</p>
              <h3 className="text-2xl font-black text-surface-900">{inProgressTasks}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Completed')}</p>
              <h3 className="text-2xl font-black text-surface-900">{completedTasks}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{t('Status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-3 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="All">{t('All Statuses')}</option>
              <option value="Pending">{t('Pending')}</option>
              <option value="In Progress">{t('In Progress')}</option>
              <option value="Completed">{t('Completed')}</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <SearchableDropdown
              type="staff"
              label={t('Staff')}
              value={filterStaff}
              onChange={(val) => setFilterStaff(val)}
              options={staff}
              businessId={businessData?.id}
              placeholder={t('All Staff')}
              hideAddButton={true}
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{t('Start Date')}</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-3 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{t('End Date')}</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-3 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={clearFilters}
            className="px-6 py-3 rounded-2xl border-2 border-surface-200 text-surface-600 font-bold hover:bg-surface-50 hover:text-surface-900 transition-colors whitespace-nowrap"
          >
            {t('Clear Filters')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center animate-pulse">
          <div className="h-4 w-48 bg-surface-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-surface-100 rounded mx-auto"></div>
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-red-50 rounded-[2rem] border-2 border-dashed border-red-200">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="text-sm font-black text-primary-600 hover:underline"
          >
            {t('Try Again')}
          </button>
        </div>
      ) : (
        <TaskTable tasks={filteredTasks} currentUser={userData} onUpdateTask={updateTaskStatus} />
      )}
    </div>
  );
}

