
import type { FastifyInstance } from 'fastify'

async function routes(fastify: FastifyInstance, options: any) {
  fastify.get('/api', async (request, reply) => {
    return { ok: true, "message": "Fuck you"}
  })
  fastify.get('/', async (request, reply) => {
    return { ok: true, "message": "how did you get there?"}
  })
}

export default routes;
