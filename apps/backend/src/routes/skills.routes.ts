import type { FastifyInstance } from 'fastify'
import { query } from '../db/index.js'

interface SkillBody {
  name?: string
  description?: string
  color?: string
}

async function routes(fastify: FastifyInstance) {
  fastify.get('/api/skills', async (request, reply) => {
    const result = await query(
      'SELECT id, name, description, color, created_at, updated_at FROM skills ORDER BY id ASC'
    )
    return { ok: true, items: result.rows }
  })

  fastify.get<{ Params: { id: string } }>(
    '/api/skills/:id',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(
        'SELECT id, name, description, color, created_at, updated_at FROM skills WHERE id = $1',
        [id]
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, item: result.rows[0] }
    }
  )

  fastify.post('/api/skills', async (request, reply) => {
    const body = request.body as SkillBody
    if (!body.name) {
      return reply.status(400).send({ ok: false, message: 'name is required' })
    }

    const result = await query(
      `INSERT INTO skills (name, description, color)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, color, created_at, updated_at`,
      [body.name, body.description ?? '', body.color ?? '#ffffff']
    )

    return { ok: true, saved: result.rows[0] }
  })

  fastify.patch<{ Params: { id: string } }>(
    '/api/skills/:id',
    async (request, reply) => {
      const { id } = request.params
      const body = request.body as SkillBody

      const existing = await query(
        'SELECT id, name, description, color FROM skills WHERE id = $1',
        [id]
      )
      if (existing.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }

      const cur = existing.rows[0]
      const name = body.name ?? cur.name
      const description = body.description !== undefined ? body.description : cur.description
      const color = body.color ?? cur.color

      const result = await query(
        `UPDATE skills SET name = $1, description = $2, color = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, description, color, created_at, updated_at`,
        [name, description, color, id]
      )

      return { ok: true, saved: result.rows[0] }
    }
  )

  fastify.delete<{ Params: { id: string } }>(
    '/api/skills/:id',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(
        'DELETE FROM skills WHERE id = $1 RETURNING id',
        [id]
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, message: `Skill ${id} deleted` }
    }
  )
}

export default routes