//const API_URL = 'http://localhost:4444';
const API_URL = 'https://eco-lab.ddns.net';
export const getMarkers = async (filters) => {
  const response = await fetch(`${API_URL}/markers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filters,
    }),
  });
  return await response.json();
};

const getAdminKey = () => {
  return localStorage.getItem('adminKey');
};

export const getMarkerById = async (id) => {
  const response = await fetch(`${API_URL}/marker/${id}`);
  return await response.json();
};

export const getSystems = async () => {
  const response = await fetch(`${API_URL}/systems`);
  return await response.json();
};

export const removeMarkerById = async (id) => {
  const response = await fetch(`${API_URL}/marker/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      adminKey: getAdminKey(),
    }),
  });
  return await response.json();
};

export const saveMarker = async (marker) => {
  const response = await fetch(`${API_URL}/marker`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      marker,
      adminKey: getAdminKey(),
    }),
  });
  return await response.json();
};
