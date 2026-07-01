'use client'

import { useEffect, useState } from "react"

interface BannerItem {
  title: string
  source: string
  caption?: string
  href?: string
  createdAt: string
}

export default function BannersTab({ apiBaseUrl, headers, showStatus }: {
  apiBaseUrl: string
  headers: () => Record<string, string>
  showStatus: (ok: boolean, text: string) => void
}) {
  const [items, setItems] = useState<BannerItem[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [href, setHref] = useState('')
  const [editing, setEditing] = useState<Record<string, { caption: string, href: string }>>({})
  const [loading, setLoading] = useState(false)

  function load() {
    fetch(`${apiBaseUrl}/banners`)
      .then(r => r.json())
      .then(d => setItems(d.items))
      .catch(() => showStatus(false, 'failed to load banners'))
  }

  useEffect(load, [])

  async function upload() {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (caption) fd.append('caption', caption)
    if (href) fd.append('href', href)
    try {
      const r = await fetch(`${apiBaseUrl}/banners`, {
        method: 'POST',
        headers: { 'Authorization': headers()['Authorization'] },
        body: fd,
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message) }
      showStatus(true, 'uploaded')
      setFile(null)
      setCaption('')
      setHref('')
      load()
    } catch (e: any) {
      showStatus(false, e.message || 'upload failed')
    }
    setLoading(false)
  }

  async function update(filename: string) {
    const data = editing[filename]
    if (!data) return
    try {
      const r = await fetch(`${apiBaseUrl}/banners/${encodeURIComponent(filename)}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(data),
      })
      if (!r.ok) throw new Error('update failed')
      setEditing(prev => { const n = { ...prev }; delete n[filename]; return n })
      load()
    } catch (e: any) {
      showStatus(false, e.message)
    }
  }

  async function remove(filename: string) {
    if (!confirm(`delete ${filename}?`)) return
    try {
      const r = await fetch(`${apiBaseUrl}/banners/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: headers(),
      })
      if (!r.ok) throw new Error('delete failed')
      load()
    } catch (e: any) {
      showStatus(false, e.message)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)}
          className="text-sm" />
        <input placeholder="caption (alt text, optional)" value={caption} onChange={e => setCaption(e.target.value)}
          className="px-3 py-2 text-sm" />
        <input placeholder="href (URL, optional)" value={href} onChange={e => setHref(e.target.value)}
          className="px-3 py-2 text-sm" />
        <button disabled={!file || loading} onClick={upload}
          className="disabled:opacity-20 text-sm self-start opacity-60 hover:opacity-100">
          {loading ? 'uploading...' : 'upload'}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {items.map(item => (
          <div key={item.title} className="flex flex-col gap-1 w-32">
            <img src={`${apiBaseUrl}/${item.source}`} className="w-32 h-10 object-contain" />
            <p className="text-xs truncate opacity-50">{item.title}</p>
            {editing[item.title] ? (
              <div className="flex flex-col gap-1">
                <input value={editing[item.title].caption} onChange={e =>
                  setEditing(prev => ({ ...prev, [item.title]: { ...prev[item.title], caption: e.target.value } }))}
                  className="px-1 py-0.5 text-xs"
                  placeholder="caption"
                />
                <input value={editing[item.title].href} onChange={e =>
                  setEditing(prev => ({ ...prev, [item.title]: { ...prev[item.title], href: e.target.value } }))}
                  className="px-1 py-0.5 text-xs"
                  placeholder="href"
                />
                <div className="flex gap-2">
                  <button onClick={() => update(item.title)}
                    className="text-xs">save</button>
                  <button onClick={() => setEditing(prev => { const n = { ...prev }; delete n[item.title]; return n })}
                    className="text-xs opacity-40">cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5" onDoubleClick={() =>
                setEditing(prev => ({ ...prev, [item.title]: { caption: item.caption || '', href: item.href || '' } }))}>
                <p className="text-xs truncate">{item.caption || <span className="opacity-30">no caption</span>}</p>
                <p className="text-xs truncate opacity-40">{item.href || <span className="opacity-30">no href</span>}</p>
              </div>
            )}
            <button onClick={() => remove(item.title)}
              className="text-xs opacity-40 hover:opacity-100 self-start">delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
