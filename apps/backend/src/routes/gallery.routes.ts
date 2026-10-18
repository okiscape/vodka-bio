import type { FastifyInstance } from 'fastify'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { readdir, unlink, stat, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { isSafeFilename, sendError, wrap } from '../ext/http.js'

const GALLERY_DIR = process.env.GALLERY_DIR ?? '/app/store/gallery'

if (!existsSync(GALLERY_DIR)) {
  mkdirSync(GALLERY_DIR, { recursive: true })
}

const METADATA_FILE = join(GALLERY_DIR, 'metadata.json')

type MetaEntry = { caption: string, display?: boolean }

async function readMeta(): Promise<Record<string, MetaEntry>> {
  try {
    const raw = await readFile(METADATA_FILE, 'utf-8')
    return JSON.parse(raw) as Record<string, MetaEntry>
  } catch {
    return {}
  }
}

async function writeMeta(meta: Record<string, MetaEntry>) {
  await writeFile(METADATA_FILE, JSON.stringify(meta, null, 2))
}

async function routes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { showHidden?: string } }>('/api/gallery', wrap(async (request, reply) => {
    const { showHidden } = request.query

    const entries = await readdir(GALLERY_DIR, { withFileTypes: true })
    const meta = await readMeta()

    const items: Array<{
      title: string
      source: string
      caption: string
      display: boolean
      createdAt: Date
    }> = []

    for (const entry of entries) {
      if (!entry.isFile() || entry.name === 'metadata.json') continue
      let info
      try {
        info = await stat(join(GALLERY_DIR, entry.name))
      } catch (err) {
        request.log.warn({ err }, `skip unreadable gallery item ${entry.name}`)
        continue
      }
      const entryMeta = meta[entry.name] ?? { caption: '' }
      items.push({
        title: entry.name,
        source: `/gallery/file/${encodeURIComponent(entry.name)}`,
        caption: entryMeta.caption ?? '',
        display: entryMeta.display ?? true,
        createdAt: info.birthtime,
      })
    }

    const filtered = showHidden === 'true' ? items : items.filter(i => i.display !== false)

    return { ok: true, items: filtered }
  }))

  fastify.get<{ Params: { filename: string } }>(
    '/api/gallery/file/:filename',
    wrap(async (request, reply) => {
      const { filename } = request.params
      if (!isSafeFilename(filename)) return sendError(reply, 400, 'Invalid filename')

      const filePath = join(GALLERY_DIR, filename)
      if (!existsSync(filePath)) {
        return sendError(reply, 404, 'Not found')
      }

      return reply.sendFile(filename, GALLERY_DIR)
    })
  )

  fastify.post('/api/gallery', wrap(async (request, reply) => {
    const part = await request.file()
    if (!part) return sendError(reply, 400, 'No file')

    const rawName = part.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const safeName = `${Date.now()}-${rawName}`
    if (!isSafeFilename(safeName)) {
      return sendError(reply, 400, 'Invalid filename')
    }

    const targetPath = join(GALLERY_DIR, safeName)

    try {
      await pipeline(part.file, createWriteStream(targetPath))
    } catch (err) {
      await unlink(targetPath).catch(() => {})
      request.log.warn({ err }, `upload of ${safeName} failed, cleaned up partial file`)
      throw err
    }

    const captionField = part.fields?.caption
    const caption = captionField && !Array.isArray(captionField) && captionField.type === 'field'
      ? captionField.value as string
      : ''

    const meta = await readMeta()
    meta[safeName] = { caption: caption || '', display: true }
    try {
      await writeMeta(meta)
    } catch (err) {
      await unlink(targetPath).catch(() => {})
      request.log.warn({ err }, `metadata write failed for ${safeName}, rolled back file`)
      throw err
    }

    return {
      ok: true,
      saved: {
        title: safeName,
        source: `/gallery/file/${encodeURIComponent(safeName)}`,
        caption,
      },
    }
  }))

  fastify.delete<{ Params: { filename: string } }>(
    '/api/gallery/file/:filename',
    wrap(async (request, reply) => {
      const { filename } = request.params
      if (!isSafeFilename(filename)) return sendError(reply, 400, 'Invalid filename')

      const filePath = join(GALLERY_DIR, filename)
      if (!existsSync(filePath)) {
        return sendError(reply, 404, 'Not found')
      }

      await unlink(filePath)

      const meta = await readMeta()
      delete meta[filename]
      try {
        await writeMeta(meta)
      } catch (err) {
        request.log.warn({ err }, `metadata cleanup failed after deleting ${filename}`)
      }

      return { ok: true, message: `${filename} deleted` }
    })
  )

  fastify.patch<{
    Params: { filename: string },
    Body: { caption?: string, display?: boolean }
  }>(
    '/api/gallery/file/:filename',
    wrap(async (request, reply) => {
      const { filename } = request.params
      if (!isSafeFilename(filename)) return sendError(reply, 400, 'Invalid filename')

      const body = request.body ?? {}
      const { caption, display } = body
      if (caption !== undefined && typeof caption !== 'string') return sendError(reply, 400, 'caption must be a string')
      if (display !== undefined && typeof display !== 'boolean') return sendError(reply, 400, 'display must be a boolean')

      if (!existsSync(join(GALLERY_DIR, filename))) {
        return sendError(reply, 404, 'Not found')
      }

      const meta = await readMeta()
      const existing = meta[filename] ?? { caption: '' }
      const next: MetaEntry = {
        caption: caption ?? existing.caption,
        ...(display !== undefined ? { display } : { ...(existing.display !== undefined ? { display: existing.display } : {}) }),
      }
      meta[filename] = next
      await writeMeta(meta)

      return {
        ok: true,
        filename,
        caption: next.caption,
        display: next.display ?? true,
      }
    })
  )
}

export default routes
