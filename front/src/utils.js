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

export const dateLocalized = (date) => {
  try {
    return new Intl.DateTimeFormat('ukr', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      minute: 'numeric',
      hour: 'numeric',
    }).format(date);
  } catch (e) {
    console.error(e);
    return 'error';
  }
};
