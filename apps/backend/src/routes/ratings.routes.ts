import type { FastifyInstance } from 'fastify'
import { query } from '../db/index.js'

interface RatingBody {
  title?: string
  scores?: { name: string; value: number; max?: number }[]
  banner?: string
  summary?: string
  description?: string
}

async function routes(fastify: FastifyInstance) {
  fastify.get('/api/ratings', async (request, reply) => {
    const result = await query(
      'SELECT id, title, scores, banner, summary, description, created_at, updated_at FROM ratings ORDER BY created_at DESC'
    )
    return { ok: true, items: result.rows }
  })

  fastify.get<{ Params: { id: string } }>(
    '/api/ratings/:id',
    async (request, reply) => {
      const { id } = request.params
    const result = await query(
      'SELECT id, title, scores, banner, summary, description, created_at, updated_at FROM ratings WHERE id = $1',
      [id]
    )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, item: result.rows[0] }
    }
  )

  fastify.post('/api/ratings', async (request, reply) => {
    const body = request.body as RatingBody
    if (!body.title) {
      return reply.status(400).send({ ok: false, message: 'title is required' })
    }

    const result = await query(
      `INSERT INTO ratings (title, scores, banner, summary, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, scores, banner, summary, description, created_at, updated_at`,
      [body.title, JSON.stringify(body.scores ?? []), body.banner ?? null, body.summary ?? null, body.description ?? null]
    )

    return { ok: true, saved: result.rows[0] }
  })

  fastify.patch<{ Params: { id: string } }>(
    '/api/ratings/:id',
    async (request, reply) => {
      const { id } = request.params
      const body = request.body as RatingBody

      const existing = await query(
        'SELECT id, title, scores, banner, summary, description FROM ratings WHERE id = $1',
        [id]
      )
      if (existing.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }

      const cur = existing.rows[0]
      const title = body.title ?? cur.title
      const scores = JSON.stringify(body.scores ?? cur.scores)
      const banner = body.banner !== undefined ? body.banner : cur.banner
      const summary = body.summary !== undefined ? body.summary : cur.summary
      const description = body.description !== undefined ? body.description : cur.description

      const result = await query(
        `UPDATE ratings SET title = $1, scores = $2, banner = $3, summary = $4, description = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING id, title, scores, banner, summary, description, created_at, updated_at`,
        [title, scores, banner, summary, description, id]
      )

      return { ok: true, saved: result.rows[0] }
    }
  )

  fastify.delete<{ Params: { id: string } }>(
    '/api/ratings/:id',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(
        'DELETE FROM ratings WHERE id = $1 RETURNING id',
        [id]
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, message: `Rating ${id} deleted` }
    }
  )
}

export default routes
