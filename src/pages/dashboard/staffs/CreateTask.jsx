import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { taskService } from '../../../services/taskService';
import { getBusinessUsers } from '../../../services/dbService';
import SearchableDropdown from '../../../components/Common/SearchableDropdown';
import BackButton from '../../../components/Common/BackButton';
import { useEffect } from 'react';

export default function CreateTask() {
  const { businessData, userData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [staff, setStaff] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    assignedTo: '',
    dueDate: '',
    status: 'Pending'
  });

  useEffect(() => {
    if (businessData?.id) {
      loadStaff();
    }
  }, [businessData]);

  async function loadStaff() {
    try {
      const data = await getBusinessUsers(businessData.id);
      const isOwner = userData?.role === 'owner';
      
      const filteredData = isOwner 
        ? data 
        : data.filter(s => s.role !== 'owner');

      const formattedStaff = filteredData.map(s => {
        const displayName = s.fullName || s.name || s.phone || 'Unknown Staff';
        return {
          ...s,
          name: (s.phone && displayName !== s.phone) ? `${displayName} - ${s.phone}` : displayName,
        };
      });
      setStaff(formattedStaff);
    } catch (err) {
      console.error('[CreateTask] Load staff error:', err);
    } finally {
      setFetching(false);
    }
  }

  const isFormValid = formData.name.trim() !== '' && formData.assignedTo !== '' && formData.dueDate !== '' && formData.status !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.assignedTo || !formData.dueDate) {
      return setError('Please fill all required fields');
    }
    
    setLoading(true);
    setError('');

    try {
      await taskService.create(businessData.id, {
        ...formData,
        createdBy: userData?.id
      });
      navigate('/dashboard/staffs/tasks');
    } catch (err) {
      console.error('[CreateTask] Create error:', err);
      setError('Failed to create task. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto anime-fade-in pb-20">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Create Task')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2rem] border border-surface-200 shadow-sm">
        <div>
          <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{t('Task Name')} <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
            placeholder="e.g. Audit Q1 Inventory"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <SearchableDropdown
          type="staff"
          label={<span>Assigned Staff <span className="text-red-500">*</span></span>}
          value={formData.assignedTo}
          onChange={(val) => setFormData({ ...formData, assignedTo: val })}
          options={staff}
          businessId={businessData.id}
          placeholder="Select staff member"
          required={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{t('Due Date')} <span className="text-red-500">*</span></label>
            <input
               type="date"
               required
               className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
               value={formData.dueDate}
               onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{t('Status')} <span className="text-red-500">*</span></label>
            <select
              required
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Pending">{t('Pending')}</option>
              <option value="In Progress">{t('In Progress')}</option>
              <option value="Completed">{t('Completed')}</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 animate-shake">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('Creating Task...') : t('Create Task')}
          </button>
        </div>
      </form>
    </div>
  );
}
