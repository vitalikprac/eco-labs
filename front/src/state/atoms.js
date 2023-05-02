import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export const settingsFiltersAtom = atom({
  key: 'settings-filters',
  default: JSON.parse(localStorage.getItem('filters') ?? '["all"]'),
});

export const markerAtom = atom({
  key: 'marker',
  default: null,
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

export const chartsAtom = atom({
  key: 'charts',
  default: {
    visible: false,
    values: [],
  },
});

export const calculatedParamAtom = atom({
  key: 'calculated-param',
  default: undefined,
});

export const energyInfoAtom = atom({
  key: 'energy-info',
  default: [],
});

export const reportAtom = atom({
  key: 'report',
  default: {},
  effects_UNSTABLE: [persistAtom],
});

export const table1DataAtom = atom({
  key: 'table1',
  default: [
    {
      key: '0',
      name: null,
      program: null,
    },
  ],
  effects_UNSTABLE: [persistAtom],
});

export const table1StructureAtom = atom({
  key: 'table1-structure',
  default: [
    {
      title: '2023',
      dataIndex: 'money2023',
      key: 'money2023',
      editable: true,
    },
  ],
  effects_UNSTABLE: [persistAtom],
});
