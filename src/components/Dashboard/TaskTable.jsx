import { useLanguage } from '../../context/LanguageContext';

export default function TaskTable({ tasks, currentUser, onUpdateTask }) {
  const { t } = useLanguage();
  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-surface-200">
        <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-surface-500 font-bold">{t('No tasks created yet.')}</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-accent-100 text-accent-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Pending': default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-surface-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50/50 border-b border-surface-200">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Task Name')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Assigned To')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Due Date')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-surface-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-surface-900">{task.name}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs">
                      {task.assignedToName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <p className="font-medium text-surface-600">{task.assignedToName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-surface-900">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('No Date')}
                </td>
                <td className="px-6 py-4">
                  {currentUser && (currentUser.role === 'owner' || currentUser.id === task.assignedTo) ? (
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateTask && onUpdateTask(task.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-black outline-none cursor-pointer border-r-8 border-transparent ${getStatusColor(task.status)}`}
                    >
                      <option value="Pending" className="text-surface-900 bg-white">{t('Pending')}</option>
                      <option value="In Progress" className="text-surface-900 bg-white">{t('In Progress')}</option>
                      <option value="Completed" className="text-surface-900 bg-white">{t('Completed')}</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-black inline-block ${getStatusColor(task.status)}`}>
                      {t(task.status)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
