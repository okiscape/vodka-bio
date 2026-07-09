import type { FastifyInstance, FastifyRequest } from 'fastify'
import { query } from '../db/index.js'

const SHOUT_COOLDOWN_MS = Number(process.env.SHOUT_COOLDOWN_MS) || 60_000

const ipCooldowns = new Map<string, number>()
setInterval(() => {
  const cutoff = Date.now() - SHOUT_COOLDOWN_MS
  for (const [ip, ts] of ipCooldowns) {
    if (ts < cutoff) ipCooldowns.delete(ip)
  }
}, SHOUT_COOLDOWN_MS * 2)

interface ShoutBody {
  model_name?: string
  details?: string
  content: string
}

function isAdmin(request: FastifyRequest): boolean {
  const auth = request.headers['authorization']
  return !!(auth && auth === `Bearer ${process.env.ADMIN_TOKEN}`)
}

async function routes(fastify: FastifyInstance) {
  fastify.get('/api/shouts', async (request, reply) => {
    const { page = '1', limit = '50' } = request.query as { page?: string, limit?: string }
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50))
    const offset = (pageNum - 1) * limitNum
    const admin = isAdmin(request)

    const countResult = await query(
      admin
        ? 'SELECT COUNT(*) FROM shouts'
        : 'SELECT COUNT(*) FROM shouts WHERE approved = true'
    )
    const total = parseInt(countResult.rows[0].count, 10)

    const result = await query(
      admin
        ? 'SELECT id, model_name, details, content, created_at, approved FROM shouts ORDER BY created_at DESC LIMIT $1 OFFSET $2'
        : 'SELECT id, model_name, details, content, created_at FROM shouts WHERE approved = true ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limitNum, offset]
    )

    return {
      ok: true,
      items: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    }
  })

  fastify.post('/api/shouts', async (request, reply) => {
    const body = request.body as ShoutBody
    if (!body.content || !body.content.trim()) {
      return reply.status(400).send({ ok: false, message: 'content is required' })
    }

    if ((body.model_name ?? '').length > 50) return reply.status(400).send({
        ok: false,
        message: "model_name is too large"
    })
    if ((body.details ?? '').length > 50) return reply.status(400).send({
        ok: false,
        message: "details is too large"
    })
    if ((body.content ?? '').length > 250) return reply.status(400).send({
        ok: false,
        message: "content is too large"
    })

    const ip = request.ip
    const last = ipCooldowns.get(ip)
    if (last && Date.now() - last < SHOUT_COOLDOWN_MS) {
      const remaining = Math.ceil((SHOUT_COOLDOWN_MS - (Date.now() - last)) / 1000)
      return reply.status(429).send({ ok: false, message: `wait ${remaining}s before next shout` })
    }
    ipCooldowns.set(ip, Date.now())

    const result = await query(
      `INSERT INTO shouts (model_name, details, content, ip_address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, model_name, details, content, created_at`,
      [body.model_name ?? '', body.details ?? '', body.content.trim(), ip]
    )

    return { ok: true, saved: result.rows[0] }
  })

  fastify.patch<{ Params: { id: string } }>(
    '/api/shouts/:id/approve',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(
        'UPDATE shouts SET approved = true WHERE id = $1 RETURNING id, approved',
        [id]
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, saved: result.rows[0] }
    }
  )

  fastify.delete<{ Params: { id: string } }>(
    '/api/shouts/:id',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(
        'DELETE FROM shouts WHERE id = $1 RETURNING id',
        [id]
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, message: `Shout ${id} deleted` }
    }
  )
}

export default routes
