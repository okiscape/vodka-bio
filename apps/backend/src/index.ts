import 'dotenv/config'

import fastify from 'fastify'

import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import cors from '@fastify/cors'

import root from './routes/root.routes.js'
import status from './routes/status.routes.js'
import github from './routes/github.routes.js'
import gallery from './routes/gallery.routes.js'
import ratings from './routes/ratings.routes.js'
import scrobbles from './routes/scrobbles.routes.js'
import banners from './routes/banners.routes.js'
import admin from './routes/admin.routes.js'
import siteInfo from './routes/info.routes.js'
import shouts from './routes/shouts.routes.js'

import { initDb } from './db/index.js'

const server = fastify({ trustProxy: true })

server.setErrorHandler(async (error, request, reply) => {
  if (reply.statusCode >= 500) {
    console.error(error)
    return reply.status(500).send({ ok: false, message: 'Internal server error' })
  }
  return reply.send(error)
})

server.addHook('preHandler', async (request, reply) => {
  const protected_routes = ['POST', 'DELETE', "PATCH"]

  if (!protected_routes.includes(request.method)) return

  if (request.method === 'POST' && request.url.split('?')[0] === '/api/shouts') return

  const auth = request.headers['authorization']

  if (!auth || auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return reply.status(401).send({ ok: false, message: 'Unauthorized' })
  }
})

server.register(cors, {
  origin: ['https://oki.vodka', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
})
server.register(staticFiles, { root: '/data/gallery', prefix: '/api/gallery/file/' })
server.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024
  }
})
server.register(root)
server.register(status)
server.register(github)
server.register(gallery)
server.register(ratings)
server.register(banners)
server.register(admin)
server.register(siteInfo)
server.register(scrobbles)
server.register(shouts)

const start = async () => {
  try {
    await initDb()
  } catch (err) {
    console.error('Failed to connect to database:', err)
    console.log('Server will start without database - ratings API will be unavailable')
  }

  server.listen({ port: Number(process.env.PORT), host: process.env.HOST ?? '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}

start()
