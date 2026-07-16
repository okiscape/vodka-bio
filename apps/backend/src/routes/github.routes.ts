import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'

const lastUpdatePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/last_update', async (request, reply) => {
    const headers = {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }

    const [frontendRes, backendRes] = await Promise.all([
      fetch(`https://api.github.com/users/${process.env.GITHUB_USERNAME}/packages/container/${process.env.GITHUB_FRONTEND_CONTAINER_NAME}/versions?per_page=1`, { headers }),
      fetch(`https://api.github.com/users/${process.env.GITHUB_USERNAME}/packages/container/${process.env.GITHUB_BACKEND_CONTAINER_NAME}/versions?per_page=1`, { headers })
    ])

    if (!frontendRes.ok || !backendRes.ok) {
      return reply.status(502).send({ error: 'GitHub Packages API error' })
    }

    const [frontendVersions, backendVersions] = await Promise.all([
      await frontendRes.json() as any[],
      await backendRes.json() as any[]
    ])

    const frontend = Math.floor(new Date(frontendVersions[0]?.updated_at).getTime() / 1000)
    const backend = Math.floor(new Date(backendVersions[0]?.updated_at).getTime() / 1000)
   return reply.send({
      ok: true,
      lastUpdates: {frontend, backend}
    })
  })
}

export default fp(lastUpdatePlugin)
