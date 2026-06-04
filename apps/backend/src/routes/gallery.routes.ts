import type { FastifyInstance } from 'fastify'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { readdir, unlink, stat, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'

const GALLERY_DIR = process.env.GALLERY_DIR ?? '/app/gallery'

if (!existsSync(GALLERY_DIR)) {
  mkdirSync(GALLERY_DIR, { recursive: true })
}

const METADATA_FILE = join(GALLERY_DIR, 'metadata.json')

async function readMeta(): Promise<Record<string, { caption: string }>> {
  try {
    const raw = await readFile(METADATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { }
  }
}

async function writeMeta(meta: Record<string, { caption: string }>) {
  await writeFile(METADATA_FILE, JSON.stringify(meta, null, 2))
}

async function routes(fastify: FastifyInstance, options: any) {
  fastify.get('/api/gallery', async (request, reply) => {
    const files = (await readdir(GALLERY_DIR)).filter(f => f !== 'metadata.json')
    const meta = await readMeta()

    const items = await Promise.all(
      files.map(async (filename) => {
        const info = await stat(join(GALLERY_DIR, filename))
        return {
          title: filename,
          source: `/gallery/file/${encodeURIComponent(filename)}`,
          caption: meta[filename]?.caption ?? '',
          createdAt: info.birthtime,
        }
      })
    )

    return { ok: true, items }
  })

 fastify.get<{ Params: { filename: string } }>(
    '/api/gallery/file/:filename',
    async (request, reply) => {
      const { filename } = request.params
      const filePath = join(GALLERY_DIR, filename)

      if (!existsSync(filePath)) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }

      return reply.sendFile(filename, GALLERY_DIR)
    }
  )

  fastify.post('/api/gallery', async (request, reply) => {
   const part = await request.file()
   if (!part) return reply.status(400).send({ ok: false, message: 'No file' })

   const safeName = `${Date.now()}-${part.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
   await pipeline(part.file, createWriteStream(join(GALLERY_DIR, safeName)))

   const captionField = part.fields?.caption
   const caption = captionField && !Array.isArray(captionField) && captionField.type === 'field'
     ? captionField.value as string
     : ''
   if (caption) {
     const meta = await readMeta()
     meta[safeName] = { caption: caption }
     await writeMeta(meta)
   }

   return { ok: true, saved: { title: safeName, source: `/gallery/file/${encodeURIComponent(safeName)}`, caption } }
  })

  fastify.delete<{ Params: { filename: string } }>(
    '/api/gallery/file/:filename',
    async (request, reply) => {
      const { filename } = request.params
      const filePath = join(GALLERY_DIR, filename)

      if (!existsSync(filePath)) {
        return reply.status(404).send({ ok: false, message: 'Not found' })
      }

     await unlink(filePath)

     const meta = await readMeta()
     delete meta[filename]
     await writeMeta(meta)

     return { ok: true, message: `${filename} deleted` }
    }
  )

 fastify.patch<{ Params: { filename: string }, Body: { caption: string } }>(
  '/api/gallery/file/:filename',
  async (request, reply) => {
    const { filename } = request.params
    const { caption } = request.body

    if (!existsSync(join(GALLERY_DIR, filename))) {
      return reply.status(404).send({ ok: false, message: 'Not found' })
    }

    const meta = await readMeta()
    meta[filename] = { ...meta[filename], caption }
    await writeMeta(meta)

    return { ok: true, filename, caption }
  }
)
}

export default routes
