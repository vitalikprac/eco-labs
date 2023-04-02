export const dateToMonthName = (date) => {
  const monthName = new Intl.DateTimeFormat('ukr', {
    month: 'long',
  }).format(date);
  return monthName.slice(0, 1).toUpperCase() + monthName.slice(1);
};
