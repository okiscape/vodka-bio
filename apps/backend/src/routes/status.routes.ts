import type { FastifyInstance } from 'fastify'

async function routes(fastify: FastifyInstance, options: any) {
  fastify.get('/api/ping', async (request, reply) => {
    return { ok: true, message: "pong" }
  })
}

export default routes;
