const parseDate = (dateInput) => {
  if (!dateInput) return null;
  let d;
  if (dateInput?.toDate) {
    d = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    d = new Date(dateInput);
  }
  return isNaN(d.getTime()) ? null : d;
};

export const formatDateOnly = (dateInput) => {
  const d = parseDate(dateInput);
  if (!d) return 'Pending';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTimeOnly = (dateInput) => {
  const d = parseDate(dateInput);
  if (!d) return '-';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}-${minutes}`;
};

export const formatDateWithTime = (dateInput) => {
  const date = formatDateOnly(dateInput);
  const time = formatTimeOnly(dateInput);
  if (date === 'Pending') return 'Pending';
  return `${date} ${time}`;
};
