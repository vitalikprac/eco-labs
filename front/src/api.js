//const API_URL = 'http://localhost:4000';
const API_URL = 'https://eco-lab.ddns.net';
export const getMarkers = async () => {
  const response = await fetch(`${API_URL}/markers`);
  return await response.json();
};

export const getMarkerById = async (id) => {
  const response = await fetch(`${API_URL}/marker/${id}`);
  return await response.json();
};
