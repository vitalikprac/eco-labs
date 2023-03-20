import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import { dbApi, startDb } from './mongodb.js';

const fastify = Fastify({ logger: false });

fastify.register(FastifyCors, {
  origin: '*',
  methods: ['GET', 'POST'],
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
