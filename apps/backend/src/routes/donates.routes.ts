import type { FastifyInstance } from 'fastify'
import { query } from '../db/index.js'

interface DonateMethodBody {
  group?: string
  method?: string
  content?: string
  qrtip?: string
  description?: string
}

async function routes(fastify: FastifyInstance) {
  fastify.get('/api/donates', async () => {
    const result = await query(
      `SELECT id, group_name, method_name, content, qrtip, description, created_at, updated_at
       FROM donate_methods
       ORDER BY group_name, id`
    )
    return { ok: true, items: result.rows }
  })

  fastify.get<{ Params: { id: string } }>(
    '/api/donates/:id',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(
        `SELECT id, group_name, method_name, content, qrtip, description, created_at, updated_at
         FROM donate_methods
         WHERE id = $1`,
        [id]
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, item: result.rows[0] }
    }
  )

  fastify.post('/api/donates', async (request, reply) => {
    const body = request.body as DonateMethodBody
    if (!body.group || !body.method || !body.content) {
      return reply.status(400).send({ ok: false, message: 'group, method and content are required' })
    }

    const result = await query(
      `INSERT INTO donate_methods (group_name, method_name, content, qrtip, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, group_name, method_name, content, qrtip, description, created_at, updated_at`,
      [body.group, body.method, body.content, body.qrtip ?? '', body.description ?? '']
    )

    return { ok: true, saved: result.rows[0] }
  })

  fastify.patch<{ Params: { id: string } }>(
    '/api/donates/:id',
    async (request, reply) => {
      const { id } = request.params
      const body = request.body as Partial<DonateMethodBody>

      const existing = await query(
        `SELECT id, group_name, method_name, content, qrtip, description
         FROM donate_methods
         WHERE id = $1`,
        [id]
      )
      if (existing.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }

      const cur = existing.rows[0]
      const group = body.group ?? cur.group_name
      const method = body.method ?? cur.method_name
      const content = body.content ?? cur.content
      const qrtip = body.qrtip ?? cur.qrtip
      const description = body.description ?? cur.description

      const result = await query(
        `UPDATE donate_methods
         SET group_name = $1, method_name = $2, content = $3, qrtip = $4, description = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING id, group_name, method_name, content, qrtip, description, created_at, updated_at`,
        [group, method, content, qrtip, description, id]
      )

      return { ok: true, saved: result.rows[0] }
    }
  )

  fastify.delete<{ Params: { id: string } }>(
    '/api/donates/:id',
    async (request, reply) => {
      const { id } = request.params
      const result = await query(`DELETE FROM donate_methods WHERE id = $1 RETURNING id`, [id])
      if (result.rows.length === 0) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
      return { ok: true, message: `Donation method ${id} deleted` }
    }
  )
}

export default routes
