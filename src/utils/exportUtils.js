export const downloadCSV = (data, filename) => {
  if (!data || !data.length) {
    alert('No data to export');
    return;
  }

  // Get headers
  const headers = Object.keys(data[0]);

  // Convert array of objects to CSV string
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row => 
      headers.map(header => {
        let val = row[header];
        // Handle null/undefined
        if (val === null || val === undefined) val = '';
        // Escape quotes and handle strings with commas
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  
  // Create a blob and download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
