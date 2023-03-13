import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';

export const initLeaflet = () => {
  // const map = L.map('map').setView(, 8);
  // L.tileLayer('', {
  //   maxZoom: 19,
  //   attribution:
  //     '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  // }).addTo(map);
  //
  // return map;
};

export const addMarker = (map, coords, object) => {
  const marker = L.marker(coords, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 10,
  }).addTo(map);
  const popupContent = ReactDOMServer.renderToString(object);
  marker.bindPopup(popupContent);
  return marker;
};
