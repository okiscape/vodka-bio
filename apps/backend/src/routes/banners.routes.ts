import type { FastifyInstance } from 'fastify'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { readdir, unlink, stat, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'

const BANNERS_DIR = process.env.BANNERS_DIR ?? '/app/store/banners'

if (!existsSync(BANNERS_DIR)) {
  mkdirSync(BANNERS_DIR, { recursive: true })
}

const METADATA_FILE = join(BANNERS_DIR, 'metadata.json')

async function readMeta(): Promise<Record<string, { caption: string, href: string }>> {
  try {
    const raw = await readFile(METADATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { }
  }
}

async function writeMeta(meta: Record<string, { caption: string, href: string }>) {
  await writeFile(METADATA_FILE, JSON.stringify(meta, null, 2))
}

async function routes(fastify: FastifyInstance, options: any) {
   fastify.get('/api/banners', async (request, reply) => {
    const files = (await readdir(BANNERS_DIR)).filter(f => f !== 'metadata.json')
    const meta = await readMeta()
    const items = await Promise.all(
      files.map(async (filename) => {
        const info = await stat(join(BANNERS_DIR, filename))
        return {
          title: filename,
          source: `banners/${encodeURIComponent(filename)}`,
          caption: meta[filename]?.caption ?? undefined,
          href: meta[filename]?.href ?? undefined,
          createdAt: info.birthtime,
        }
      })
    )
    return { ok: true, items }
  })

fastify.post('/api/banners', async (request, reply) => {
  const part = await request.file()
  if (!part) return reply.status(400).send({ ok: false, message: 'No file' })

  const safeName = `${Date.now()}-${part.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  await pipeline(part.file, createWriteStream(join(BANNERS_DIR, safeName)))

  const captionField = part.fields?.caption
  const caption = captionField && !Array.isArray(captionField) && captionField.type === 'field'
    ? captionField.value as string
    : ''

  const hrefField = part.fields?.href
  const href = hrefField && !Array.isArray(hrefField) && hrefField.type === 'field'
    ? hrefField.value as string
    : ''

  const meta = await readMeta()
  meta[safeName] = { caption, href }
  await writeMeta(meta)

  return {
    ok: true,
    saved: {
      title: safeName,
      source: `banners/${encodeURIComponent(safeName)}`,
      caption,
      href, // ✅
    }
  }
})

fastify.patch<{
  Params: { filename: string },
  Body: { caption?: string, href?: string }
}>(
  '/api/banners/:filename',
  async (request, reply) => {
    const { filename } = request.params
    const { caption, href } = request.body

    if (!existsSync(join(BANNERS_DIR, filename))) {
      return reply.status(404).send({ ok: false, message: 'Not found' })
    }

    const meta = await readMeta()
    const existing = meta[filename] ?? { caption: '', href: '' }

    meta[filename] = {
      caption: caption ?? existing.caption,
      href: href ?? existing.href,
    }

    await writeMeta(meta)

    return { ok: true, filename, caption: meta[filename].caption, href: meta[filename].href }
  }
 )
 fastify.get<{ Params: { filename: string } }>(
     '/api/banners/:filename',
     async (request, reply) => {
       const { filename } = request.params
       const filePath = join(BANNERS_DIR, filename)
       if (!existsSync(filePath)) {
         return reply.status(404).send({ ok: false, message: 'Not found' })
       }
       return reply.sendFile(filename, BANNERS_DIR)
     }
   )
  fastify.delete<{ Params: { filename: string } }>(
    '/api/banners/:filename',
    async (request, reply) => {
      const { filename } = request.params
      const filePath = join(BANNERS_DIR, filename)
      if (!existsSync(filePath)) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }
     await unlink(filePath)
     const meta = await readMeta()
     delete meta[filename]
     await writeMeta(meta)
     return { ok: true, message: `${filename} deleted`}
    }
  )
}

export default routes
