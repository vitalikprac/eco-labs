import { useEffect, useState } from 'react';
import './App.css';

import { Place } from './Place.jsx';
import { getMarkers } from './api.js';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

function App() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    getMarkers().then((markers) => {
      setMarkers(markers);
    });
  }, []);

  return (
    <div className="App">
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
        {markers.map((marker) => (
          <Marker key={marker._id} position={marker.coordinates}>
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
