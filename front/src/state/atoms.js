import { atom } from 'recoil';

export const settingsFilters = atom({
  key: 'settings-filters',
  default: JSON.parse(localStorage.getItem('filters') ?? '["all"]'),
});
