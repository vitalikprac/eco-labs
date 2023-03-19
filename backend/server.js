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

fastify.post('/markers', async (request) => {
  const filters = request.body?.filters ?? [];
  const markers = await dbApi.getMarkersWithParameters();
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
    return markers.filter((marker) =>
      marker.parameters.some((parameter) => names.some((x) => parameter.name.toLowerCase().includes(x.toLowerCase()))),
    );
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
});

fastify.get('/marker/:id', async (request) => {
  return dbApi.getMarkerById(request.params.id);
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
