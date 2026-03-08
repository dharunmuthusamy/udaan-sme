import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { taskService } from '../../services/taskService';
import TaskTable from '../../components/Dashboard/TaskTable';

export default function Tasks() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (businessData?.id) {
      loadTasks();
    }
  }, [businessData]);

  async function loadTasks() {
    try {
      setError('');
      const data = await taskService.getAll(businessData.id);
      setTasks(data);
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

  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="space-y-8 anime-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Task Management')}</h1>
          <p className="text-surface-500 mt-1 font-medium">{t('Manage and track your operational tasks.')}</p>
        </div>
        <Link
          to="/dashboard/tasks/create"
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
              <h3 className="text-2xl font-black text-surface-900">{tasks.length}</h3>
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

      {loading ? (
        <div className="p-12 text-center animate-pulse">
          <div className="h-4 w-48 bg-surface-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-surface-100 rounded mx-auto"></div>
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-red-50 rounded-[2rem] border-2 border-dashed border-red-200">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <button 
            onClick={loadTasks}
            className="text-sm font-black text-primary-600 hover:underline"
          >
            {t('Try Again')}
          </button>
        </div>
      ) : (
        <TaskTable tasks={tasks} />
      )}
    </div>
  );
}
