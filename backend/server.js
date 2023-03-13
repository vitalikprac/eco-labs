import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import { dbApi, startDb } from './mongodb.js';

const fastify = Fastify({ logger: false });

fastify.register(FastifyCors, {
  origin: '*',
  methods: ['GET', 'POST'],
});

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

fastify.get('/markers', async (request, reply) => {
  return dbApi.getMarkers();
});

fastify.get('/marker/:id', async (request, reply) => {
  return dbApi.getMarkerById(request.params.id);
});

const start = async () => {
  try {
    await startDb();
    await fastify.listen({ port: 4000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
