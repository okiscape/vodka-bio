import { cache } from 'react'
import { RatingItem } from './types'

export const getRating = cache(async (apiurl: string, id?: string) => {
  if (!apiurl) {
    console.error('API_BASEURL is not defined')
    return { ok: false, items: [] } as { ok: boolean; items: RatingItem[] }
  }
  try {
    const res = await fetch(`${apiurl}/ratings${id !== undefined ? "/" + id : ''}`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) return { ok: false, items: [] }
    return await res.json() as { ok: boolean; items: RatingItem[] }
  } catch (err) {
    console.error('getRating failed:', err)
    return { ok: false, items: [] } as { ok: boolean; items: RatingItem[] }
  }})

export function isRecent(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (now.getTime() - d.getTime()) < 6 * 60 * 60 * 1000
}
