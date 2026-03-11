import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { taskService } from '../../../services/taskService';
import { getBusinessUsers } from '../../../services/dbService';
import SearchableDropdown from '../../../components/Common/SearchableDropdown';
import { useEffect } from 'react';

export default function CreateTask() {
  const { businessData } = useAuth();
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
      const formattedStaff = data.map(s => {
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
      await taskService.create(businessData.id, formData);
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
        <Link to="/dashboard/staffs/tasks" className="p-2 lg:p-3 rounded-2xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">Create Task</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2rem] border border-surface-200 shadow-sm">
        <div>
          <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Task Name <span className="text-red-500">*</span></label>
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
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Due Date <span className="text-red-500">*</span></label>
            <input
               type="date"
               required
               className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
               value={formData.dueDate}
               onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Status <span className="text-red-500">*</span></label>
            <select
              required
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
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
            {loading ? 'Creating Task...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
