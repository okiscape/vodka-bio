import { cache } from 'react'
import { RatingItem } from './types'

export const getRating = cache(async (id?: string) => {
  const res = await fetch(`${process.env.API_BASEURL}/ratings${id !== undefined ? "/" + id : ''}`, {
		next: {
			revalidate: 60
		}
  })
  if (!res.ok) return {ok: false, items: []}
  return await res.json() as {ok: boolean, items: RatingItem[]}
})

export function isRecent(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (now.getTime() - d.getTime()) < 6 * 60 * 60 * 1000
}
