import type { FastifyInstance } from 'fastify'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { readdir, unlink, stat, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { isSafeFilename, sendError, wrap } from '../ext/http.js'

const BANNERS_DIR = process.env.BANNERS_DIR ?? '/app/store/banners'

if (!existsSync(BANNERS_DIR)) {
  mkdirSync(BANNERS_DIR, { recursive: true })
}

const METADATA_FILE = join(BANNERS_DIR, 'metadata.json')

type MetaEntry = { caption?: string, href?: string }

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
  fastify.get('/api/banners', wrap(async (request, reply) => {
    const entries = await readdir(BANNERS_DIR, { withFileTypes: true })
    const meta = await readMeta()

    const items: Array<{
      title: string
      source: string
      caption: string | undefined
      href: string | undefined
      createdAt: Date
    }> = []

    for (const entry of entries) {
      if (!entry.isFile() || entry.name === 'metadata.json') continue
      let info
      try {
        info = await stat(join(BANNERS_DIR, entry.name))
      } catch (err) {
        request.log.warn({ err }, `skip unreadable banner ${entry.name}`)
        continue
      }
      items.push({
        title: entry.name,
        source: `banners/${encodeURIComponent(entry.name)}`,
        caption: meta[entry.name]?.caption,
        href: meta[entry.name]?.href,
        createdAt: info.birthtime,
      })
    }

    return { ok: true, items }
  }))

  fastify.post('/api/banners', wrap(async (request, reply) => {
    const part = await request.file()
    if (!part) return sendError(reply, 400, 'No file')

    const safeName = part.filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    if (!isSafeFilename(safeName)) {
      return sendError(reply, 400, 'Invalid filename')
    }

    const targetPath = join(BANNERS_DIR, safeName)

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
      : undefined

    const hrefField = part.fields?.href
    const href = hrefField && !Array.isArray(hrefField) && hrefField.type === 'field'
      ? hrefField.value as string
      : undefined

    if (href || caption) {
      const meta = await readMeta()
      meta[safeName] = {
        ...(caption !== undefined ? { caption } : {}),
        ...(href !== undefined ? { href } : {}),
      }
      try {
        await writeMeta(meta)
      } catch (err) {
        await unlink(targetPath).catch(() => {})
        request.log.warn({ err }, `metadata write failed for ${safeName}, rolled back file`)
        throw err
      }
    }

    return {
      ok: true,
      saved: {
        title: safeName,
        source: `banners/${encodeURIComponent(safeName)}`,
        caption: caption ?? null,
        href: href ?? null,
      },
    }
  }))

  fastify.patch<{
    Params: { filename: string },
    Body: { caption?: string, href?: string }
  }>(
    '/api/banners/:filename',
    wrap(async (request, reply) => {
      const { filename } = request.params
      if (!isSafeFilename(filename)) return sendError(reply, 400, 'Invalid filename')

      const body = request.body ?? {}
      const { caption, href } = body
      if (caption !== undefined && typeof caption !== 'string') return sendError(reply, 400, 'caption must be a string')
      if (href !== undefined && typeof href !== 'string') return sendError(reply, 400, 'href must be a string')

      if (!existsSync(join(BANNERS_DIR, filename))) {
        return sendError(reply, 404, 'Not found')
      }

      const meta = await readMeta()
      const existing = meta[filename] ?? {}
      const next: MetaEntry = {}
      if (caption !== undefined) next.caption = caption
      else if (existing.caption !== undefined) next.caption = existing.caption
      if (href !== undefined) next.href = href
      else if (existing.href !== undefined) next.href = existing.href
      meta[filename] = next

      await writeMeta(meta)

      return {
        ok: true,
        filename,
        caption: next.caption ?? null,
        href: next.href ?? null,
      }
    })
  )

  fastify.get<{ Params: { filename: string } }>(
    '/api/banners/:filename',
    wrap(async (request, reply) => {
      const { filename } = request.params
      if (!isSafeFilename(filename)) return sendError(reply, 400, 'Invalid filename')

      const filePath = join(BANNERS_DIR, filename)
      if (!existsSync(filePath)) {
        return sendError(reply, 404, 'Not found')
      }
      return reply.sendFile(filename, BANNERS_DIR)
    })
  )

  fastify.delete<{ Params: { filename: string } }>(
    '/api/banners/:filename',
    wrap(async (request, reply) => {
      const { filename } = request.params
      if (!isSafeFilename(filename)) return sendError(reply, 400, 'Invalid filename')

      const filePath = join(BANNERS_DIR, filename)
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
}

export default routes
