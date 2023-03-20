const API_URL = 'http://localhost:4444';
//const API_URL = 'https://eco-lab.ddns.net';
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

export const getMarkerById = async (id) => {
  const response = await fetch(`${API_URL}/marker/${id}`);
  return await response.json();
};
