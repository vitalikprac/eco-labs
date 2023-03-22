import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import { dbApi, startDb } from './mongodb.js';

const fastify = Fastify({ logger: false });

const ADMIN_KEY = 'secret-1234';

fastify.register(FastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
});

fastify.get('/', async () => {
  return { hello: 'works' };
});

const filterMarkers = (markers, filters) => {
  if (filters.includes('all')) {
    return markers;
  }
  const newMarkers = [];
  const middleCoordinates = [50.426992, 30.580841];
  if (filters.includes('left-side')) {
    newMarkers.push(...markers.filter((marker) => marker.coordinates[1] >= middleCoordinates[1]));
  }
  if (filters.includes('right-side')) {
    newMarkers.push(...markers.filter((marker) => marker.coordinates[1] <= middleCoordinates[1]));
  }

  const findByNames = (markers, names) => {
    return markers.filter((marker) => marker.parameters.some((parameter) => names.some((x) => parameter.name.toLowerCase().includes(x.toLowerCase()))));
  };

  if (filters.includes('economic')) {
    const names = ['ВВП', 'квартир', 'лікар', 'газу'];
    newMarkers.push(...findByNames(markers, names));
  }
  if (filters.includes('natural')) {
    const names = ['AQI', 'Радіація', 'водневий показник', 'азот'];
    newMarkers.push(...findByNames(markers, names));
  }

  return newMarkers.filter((marker, index, self) => {
    return self.findIndex((m) => m._id === marker._id) === index;
  });
};

fastify.post('/markers', async (request) => {
  const filters = request.body?.filters ?? [];
  const markers = await dbApi.getMarkersWithParameters();
  return filterMarkers(markers, filters);
});

fastify.get('/systems', async () => {
  return await dbApi.getSystems();
});

fastify.post('/marker', async (request, response) => {
  if (request.body.adminKey !== ADMIN_KEY) {
    return response.code(403).send({ success: false });
  }
  const marker = request.body?.marker ?? {};
  let identificationId = (await dbApi.getIdentification(marker.identification))?._id;
  if (!identificationId) {
    identificationId = await dbApi.createIdentification(marker.identification);
  }

  const insertedIds = await dbApi.createParameters(marker.parameters ?? []);
  const markerToInsert = {
    name: marker.name,
    address: marker.address,
    coordinates: marker.coordinates.map((x) => parseFloat(x)),
    identification_id: identificationId,
    parameters: Object.values(insertedIds),
  };
  await dbApi.createMarker(markerToInsert);
  return { success: true };
});

fastify.get('/marker/:id', async (request) => {
  const systems = await dbApi.getSystems();
  const marker = await dbApi.getMarkerById(request.params.id);
  marker.systems = systems.filter((system) =>
    system.values.some((value) => {
      return marker.parameters.some((parameter) => parameter.name.toLowerCase().includes(value.toLowerCase()));
    }),
  );
  return marker;
});

fastify.delete('/marker/:id', async (request, response) => {
  if (request.body.adminKey !== ADMIN_KEY) {
    return response.code(403).send({ success: false });
  }
  const marker = await dbApi.getMarkerById(request.params.id);
  const markersWithIdentificationId = await dbApi.getMarkersWithIdentificationId(marker.identification_id);
  if (markersWithIdentificationId.length === 1) {
    await dbApi.deleteIdentification(markersWithIdentificationId[0].identification_id);
  }
  await dbApi.deleteParameters(marker.parameters.map((x) => x._id));
  await dbApi.deleteMarker(marker._id);
  return { success: true };
});

const start = async () => {
  try {
    await startDb();
    await fastify.listen({ host: '0.0.0.0', port: 4444 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
