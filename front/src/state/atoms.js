import { atom } from 'recoil';

export const settingsFiltersAtom = atom({
  key: 'settings-filters',
  default: JSON.parse(localStorage.getItem('filters') ?? '["all"]'),
});

export const markersAtom = atom({
  key: 'markers',
  default: [],
});

export const adminKeyAtom = atom({
  key: 'admin-key',
  default: localStorage.getItem('adminKey') ?? '',
});

export const newMarkerAtom = atom({
  key: 'new-marker',
  default: {
    isAdding: false,
    isAdded: false,
  },
});

export const systemsAtom = atom({
  key: 'systems',
  default: [],
});
