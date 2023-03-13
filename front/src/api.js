export const getMarkers = async () => {
  const response = await fetch('http://localhost:4000/markers');
  return await response.json();
};

export const getMarkerById = async (id) => {
  const response = await fetch(`http://localhost:4000/marker/${id}`);
  return await response.json();
};
