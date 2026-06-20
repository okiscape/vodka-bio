import 'dotenv/config'

import fastify from 'fastify'

import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import cors from '@fastify/cors'

import root from './routes/root.routes.js'
import status from './routes/status.routes.js'
import github from './routes/github.routes.js'
import gallery from './routes/gallery.routes.js'
import scrobbles from './routes/scrobbles.routes.js'
import banners from './routes/banners.routes.js'

const server = fastify()

server.addHook('preHandler', async (request, reply) => {
  const protected_routes = ['POST', 'DELETE', "PATCH"]

  if (!protected_routes.includes(request.method)) return

  const auth = request.headers['authorization']

  if (!auth || auth !== `Bearer ${process.env.API_TOKEN}`) {
    return reply.status(401).send({ ok: false, message: 'Unauthorized' })
  }
})

server.register(cors, {
 origin: ['https://oki.vodka', 'http://localhost:3000']
})
server.register(staticFiles, { root: '/data/gallery', prefix: '/api/gallery/file/' })
server.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024 // 50mb
  }
})
server.register(root)
server.register(status)
server.register(github)
server.register(gallery)
server.register(scrobbles)
server.register(banners)

server.listen({ port: Number(process.env.PORT), host: process.env.HOST ?? '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
