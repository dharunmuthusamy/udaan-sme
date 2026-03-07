export default function DataTable({ 
  columns, 
  data, 
  loading, 
  emptyMessage = "No records found.",
  onRowClick
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 bg-surface-50 rounded-full flex items-center justify-center text-surface-200 mb-4 text-3xl">📭</div>
        <p className="text-surface-500 font-bold max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-surface-100 bg-surface-50/50">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest text-surface-400 ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {data.map((row, rowIdx) => (
            <tr 
              key={row.id || rowIdx} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-50/80' : 'hover:bg-surface-50/30'}`}
            >
              {columns.map((col, colIdx) => (
                <td 
                  key={colIdx} 
                  className={`px-6 py-5 text-sm ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.render ? col.render(row) : (
                    <span className="font-medium text-surface-700">{row[col.accessor]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
