import { atom } from 'recoil';

export const settingsFilters = atom({
  key: 'settings-filters',
  default: localStorage.getItem('filters') ?? ['all'],
});
