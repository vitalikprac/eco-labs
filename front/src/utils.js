export const dateToMonthName = (date) => {
  let monthName;
  try {
    monthName = new Intl.DateTimeFormat('ukr', {
      month: 'long',
    }).format(date);
  } catch (e) {
    monthName = 'error';
  }
  return monthName.slice(0, 1).toUpperCase() + monthName.slice(1);
};
