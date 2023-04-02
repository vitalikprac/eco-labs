import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import { dbApi, startDb } from './mongodb.js';

const fastify = Fastify({ logger: false });

const ADMIN_KEY = 'secret-1234';

const nullOrUndefined = (x) => x === null || x === undefined;

fastify.register(FastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
});

fastify.get('/', async () => {
  return { hello: 'works' };
});

const filterMarkers = async (markers, filters) => {
  if (filters.includes('all')) {
    return markers;
  }
  const newMarkers = [];
  const findByNames = (markers, names) => {
    return markers.filter((marker) => marker.parameters.some((parameter) => names.some((x) => parameter.name.toLowerCase().includes(x.toLowerCase()))));
  };

  if (filters.length > 0) {
    newMarkers.push(...findByNames(markers, filters));
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
    return response.code(403).send({ success: false, needAdminKey: true });
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
    return response.code(403).send({ success: false, needAdminKey: true });
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

fastify.put('/parameter/:id', async (request, response) => {
  if (request.body.adminKey !== ADMIN_KEY) {
    return response.code(403).send({ success: false, needAdminKey: true });
  }

  if (nullOrUndefined(request.body.name) || nullOrUndefined(request.body.valueX) || nullOrUndefined(request.body.valueY)) {
    return response.code(400).send({ success: false });
  }

  const res = await dbApi.updateParameter(request.params.id, {
    name: request.body.name,
    valueX: request.body.valueX,
    valueY: request.body.valueY,
    parameterX: request.body.parameterX,
    descriptionY: request.body.descriptionY,
  });
  return { success: true };
});

fastify.delete('/parameter/:id', async (request, response) => {
  if (request.body.adminKey !== ADMIN_KEY) {
    return response.code(403).send({ success: false, needAdminKey: true });
  }
  await dbApi.deleteParameters([request.params.id]);
  return { success: true };
});

fastify.post('/parameter', async (request, response) => {
  if (request.body.adminKey !== ADMIN_KEY) {
    return response.code(403).send({ success: false, needAdminKey: true });
  }

  const insertedIds = await dbApi.createParameters([request.body.parameter]);
  await dbApi.addParameterToMarker(request.body.markerId, insertedIds[0]);

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
