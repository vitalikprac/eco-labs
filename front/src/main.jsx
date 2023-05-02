import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import 'antd/dist/reset.css';
import { RecoilRoot } from 'recoil';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { toTemporalInstant } from '@js-temporal/polyfill';
import Improvements from './components/Improvements/Improvements.jsx';
Date.prototype.toTemporalInstant = toTemporalInstant;

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/report',
    element: <Improvements />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <RecoilRoot>
    <RouterProvider router={router} />
  </RecoilRoot>,
  // </React.StrictMode>,
);
