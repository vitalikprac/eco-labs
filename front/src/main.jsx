import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import 'antd/dist/reset.css';
import { RecoilRoot } from 'recoil';
import { toTemporalInstant } from '@js-temporal/polyfill';
Date.prototype.toTemporalInstant = toTemporalInstant;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
);
