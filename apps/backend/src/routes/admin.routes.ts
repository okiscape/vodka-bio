import type { FastifyInstance } from 'fastify'

async function routes(fastify: FastifyInstance) {
  fastify.get('/api/admin/check', async (request, reply) => {
    const auth = request.headers['authorization']
    if (!auth || auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return reply.status(401).send({ ok: false, message: 'Unauthorized' })
    }
    return { ok: true, message: 'Authenticated' }
  })
}

export default routes
