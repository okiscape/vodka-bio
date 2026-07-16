import type { FastifyInstance } from 'fastify'
import { query } from '../db/index.js'

interface AboutBody {
  title?: string
  aka?: string
  contactUrl?: string,
  description?: string[]
  links?: { href: string; name: string }[]
}

const defaults = {
  title: 'not set yet',
  aka: 'not set yet',
  contactUrl: "https://google.com/",
  description: [
    'not set yet',
  ],
  links: [
    { href: 'https://github.com/', name: 'not set yet' },
  ],
}

async function routes(fastify: FastifyInstance) {
  fastify.get('/api/info', async () => {
    const result = await query('SELECT about FROM site_info WHERE id = 1')
    const about = result.rows.length > 0 ? result.rows[0].about : defaults
    return { ok: true, item: { about } }
  })

  fastify.patch('/api/info', async (request, reply) => {
    const body = request.body as { about?: AboutBody }

    const existing = await query('SELECT about FROM site_info WHERE id = 1')

    if (existing.rows.length === 0) {
      const merged = { ...defaults, ...body.about }
      const result = await query(
        `INSERT INTO site_info (about) VALUES ($1::jsonb) RETURNING about`,
        [JSON.stringify(merged)]
      )
      return { ok: true, saved: { about: result.rows[0].about } }
    }

    const cur = existing.rows[0].about
    const merged = { ...cur, ...body.about }

    const result = await query(
      `UPDATE site_info SET about = $1::jsonb, updated_at = NOW() WHERE id = 1 RETURNING about`,
      [JSON.stringify(merged)]
    )

    return { ok: true, saved: { about: result.rows[0].about } }
  })
}

export default routes
