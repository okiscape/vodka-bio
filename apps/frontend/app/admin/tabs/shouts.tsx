'use client'

import { useEffect, useState } from "react"

interface ShoutItem {
  id: number
  model_name: string
  cosmetics: string
  content: string
  created_at: string
  approved: boolean
}

export default function ShoutsTab({ apiBaseUrl, headers, showStatus }: {
  apiBaseUrl: string
  headers: () => Record<string, string>
  showStatus: (ok: boolean, text: string) => void
}) {
  const [items, setItems] = useState<ShoutItem[]>([])
  const [loading, setLoading] = useState(false)

  function load() {
    setLoading(true)
    fetch(`${apiBaseUrl}/shouts?limit=100`, {
      headers: headers(),
    })
      .then(r => r.json())
      .then(d => { if (d.ok) setItems(d.items) })
      .catch(() => showStatus(false, 'failed to load shouts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function accept(id: number) {
    try {
      const r = await fetch(`${apiBaseUrl}/shouts/${id}/approve`, {
        method: 'PATCH',
        headers: {"Authorization": headers()["Authorization"]},
      })
      if (!r.ok) throw new Error('accept failed')
      showStatus(true, 'accepted')
      load()
    } catch (e: any) {
      showStatus(false, e.message)
    }
  }

  async function remove(id: number) {
    if (!confirm(`delete shout #${id}?`)) return
    try {
      const r = await fetch(`${apiBaseUrl}/shouts/${id}`, {
        method: 'DELETE',
        headers: {"Authorization": headers()["Authorization"]},
      })
      if (!r.ok) throw new Error('delete failed')
      load()
    } catch (e: any) {
      showStatus(false, e.message)
    }
  }

  const unapproved = items.filter(i => !i.approved)
  const approved = items.filter(i => i.approved)

  return (
    <div className="w-full flex flex-col gap-4">
      {loading && items.length === 0 ? (
        <p className="opacity-40">loading...</p>
      ) : items.length === 0 ? (
        <p className="opacity-40">no shouts yet</p>
      ) : (
        <>
          {unapproved.length > 0 && (
            <div>
              <p className="text-sm opacity-40 mb-2">pending approval ({unapproved.length})</p>
              <div className="flex flex-col gap-2">
                {unapproved.map(s => (
                  <div key={s.id} className="border border-[#fff1] p-3 flex flex-col gap-2">
                    <div className="flex justify-between text-xs opacity-50">
                      <span>{s.model_name || 'anonymous'}{s.cosmetics ? ` (${s.cosmetics})` : ''}</span>
                      <span>{new Date(s.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{s.content}</p>
                    <div className="flex gap-3">
                      <button onClick={() => accept(s.id)}
                        className="text-xs opacity-60 hover:opacity-100">accept</button>
                      <button onClick={() => remove(s.id)}
                        className="text-xs opacity-40 hover:opacity-100">delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {approved.length > 0 && (
            <div>
              <p className="text-sm opacity-40 mb-2">approved ({approved.length})</p>
              <div className="flex flex-col gap-2">
                {approved.map(s => (
                  <div key={s.id} className="border border-[#fff1] p-3 flex flex-col gap-2">
                    <div className="flex justify-between text-xs opacity-50">
                      <span>{s.model_name || 'anonymous'}{s.cosmetics ? ` (${s.cosmetics})` : ''}</span>
                      <span>{new Date(s.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{s.content}</p>
                    <div className="flex gap-3">
                      <button onClick={() => remove(s.id)}
                        className="text-xs opacity-40 hover:opacity-100">delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
