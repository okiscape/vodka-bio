import type { FastifyInstance } from 'fastify'
import { query } from '../db/index.js'

interface ProjectBody {
  title?: string
  description?: string
  url?: string
}

async function routes(fastify: FastifyInstance) {
  fastify.get('/api/projects', async (request, reply) => {
    const result = await query(
      'SELECT id, title, description, url, created_at, updated_at FROM projects ORDER BY created_at DESC'
    )
    return { ok: true, items: result.rows }
  })

  fastify.get<{ Params: { id: string } }>(
    '/api/projects/:id',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(
        'SELECT id, title, description, url, created_at, updated_at FROM projects WHERE id = $1',
        [id]
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, item: result.rows[0] }
    }
  )

  fastify.post('/api/projects', async (request, reply) => {
    const body = request.body as ProjectBody
    if (!body.title) {
      return reply.status(400).send({ ok: false, message: 'title is required' })
    }

    const result = await query(
      `INSERT INTO projects (title, description, url)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, url, created_at, updated_at`,
      [body.title, body.description ?? '', body.url ?? null]
    )

    return { ok: true, saved: result.rows[0] }
  })

  fastify.patch<{ Params: { id: string } }>(
    '/api/projects/:id',
    async (request, reply) => {
      const { id } = request.params
      const body = request.body as ProjectBody

      const existing = await query(
        'SELECT id, title, description, url FROM projects WHERE id = $1',
        [id]
      )
      if (existing.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }

      const cur = existing.rows[0]
      const title = body.title ?? cur.title
      const description = body.description !== undefined ? body.description : cur.description
      const url = body.url !== undefined ? body.url : cur.url

      const result = await query(
        `UPDATE projects SET title = $1, description = $2, url = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, title, description, url, created_at, updated_at`,
        [title, description, url, id]
      )

      return { ok: true, saved: result.rows[0] }
    }
  )

  fastify.delete<{ Params: { id: string } }>(
    '/api/projects/:id',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(
        'DELETE FROM projects WHERE id = $1 RETURNING id',
        [id]
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, message: `Project ${id} deleted` }
    }
  )
}

export default routes
