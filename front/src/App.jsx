import { useEffect, useRef, useState } from 'react';
import './App.scss';

import { Place } from './components/Place.jsx';
import { getMarkers } from './api.js';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import Settings from './components/Settings.jsx';
import L from 'leaflet';
import {
  markersAtom,
  newMarkerAtom,
  settingsFiltersAtom,
} from './state/atoms.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import NewPlace from './components/NewPlace.jsx';

const MarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  shadowAnchor: [13, 41],
});

function App() {
  const newMarkerRef = useRef();
  const [markers, setMarkers] = useRecoilState(markersAtom);
  const filters = useRecoilValue(settingsFiltersAtom);
  const [newMarker, setNewMarker] = useRecoilState(newMarkerAtom);

  useEffect(() => {
    getMarkers(filters).then((markers) => {
      setMarkers(markers);
    });

    localStorage.setItem('filters', JSON.stringify(filters ?? []));
  }, [filters]);

  useEffect(() => {
    setTimeout(() => {
      if (newMarkerRef.current && newMarker.isAdded) {
        newMarkerRef.current._icon.classList.add('new-marker');
      }
    }, 50);
  }, [newMarker.isAdded]);

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
        <Settings />
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
        {newMarker.isAdded ? (
          <Marker
            ref={newMarkerRef}
            icon={MarkerIcon}
            position={[newMarker.lat, newMarker.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setNewMarker((prev) => ({
                  ...prev,
                  lat,
                  lng,
                }));
              },
            }}
          >
            <Popup>
              <NewPlace />
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>
      <div className="side">
        <div>Лабораторна робота №1</div>
        <div>Автори: Прачов Віталій ТР-21мп, Петренко Пилип ТР-23мп</div>
      </div>
    </div>
  );
}

export default App;
