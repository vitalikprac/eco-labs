import { useEffect, useState } from 'react';
import './App.scss';

import { Place } from './Place.jsx';
import { getMarkers } from './api.js';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import Settings from './components/Settings.jsx';
import { settingsFilters } from './state/atoms.js';
import { useRecoilValue } from 'recoil';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const MarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  shadowAnchor: [13, 41],
});

function App() {
  const [markers, setMarkers] = useState([]);
  const filters = useRecoilValue(settingsFilters);

  useEffect(() => {
    getMarkers(filters).then((markers) => {
      setMarkers(markers);
    });

    localStorage.setItem('filters', JSON.stringify(filters ?? []));
  }, [filters]);

  return (
    <div className="App">
      <Settings />
      <MapContainer
        style={{
          height: '100%',
          width: '100%',
        }}
        center={[50.4501, 30.5234]}
        zoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers?.map((marker) => (
          <Marker
            icon={MarkerIcon}
            key={marker._id}
            position={marker.coordinates}
          >
            <Popup>
              <Place {...marker} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="side">
        <div>Лабораторна робота №1</div>
        <div>Автори: Прачов Віталій ТР-21мп, Петренко Пилип ТР-23мп</div>
      </div>
    </div>
  );
}

export default App;