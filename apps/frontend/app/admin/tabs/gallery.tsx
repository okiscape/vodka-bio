'use client'

import { useEffect, useState } from "react"

interface GalleryItem {
  title: string
  source: string
  caption: string
  display: boolean
  createdAt: string
}

export default function GalleryTab({ apiBaseUrl, headers, showStatus }: {
  apiBaseUrl: string
  headers: () => Record<string, string>
  showStatus: (ok: boolean, text: string) => void
}) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [editingCaption, setEditingCaption] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function load() {
    fetch(`${apiBaseUrl}/gallery?showHidden=true`)
      .then(r => r.json())
      .then(d => setItems(d.items))
      .catch(() => showStatus(false, 'failed to load gallery'))
  }

  useEffect(load, [])

  async function upload() {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (caption) fd.append('caption', caption)
    try {
      const r = await fetch(`${apiBaseUrl}/gallery`, {
        method: 'POST',
        headers: { 'Authorization': headers()['Authorization'] },
        body: fd,
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message) }
      showStatus(true, 'uploaded')
      setFile(null)
      setCaption('')
      load()
    } catch (e: any) {
      showStatus(false, e.message || 'upload failed')
    }
    setLoading(false)
  }

  async function updateCaption(filename: string) {
    const newCaption = editingCaption[filename]
    if (newCaption === undefined) return
    try {
      const r = await fetch(`${apiBaseUrl}/gallery/file/${encodeURIComponent(filename)}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ caption: newCaption }),
      })
      if (!r.ok) throw new Error('update failed')
      setEditingCaption(prev => { const n = { ...prev }; delete n[filename]; return n })
      load()
    } catch (e: any) {
      showStatus(false, e.message)
    }
  }

  async function toggleDisplay(item: GalleryItem) {
    try {
      const r = await fetch(`${apiBaseUrl}/gallery/file/${encodeURIComponent(item.title)}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ display: !item.display }),
      })
      if (!r.ok) throw new Error('toggle failed')
      load()
    } catch (e: any) {
      showStatus(false, e.message)
    }
  }

  async function remove(filename: string) {
    if (!confirm(`delete ${filename}?`)) return
    try {
      const r = await fetch(`${apiBaseUrl}/gallery/file/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: { 'Authorization': headers()['Authorization'] },
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
        <input placeholder="caption (optional)" value={caption} onChange={e => setCaption(e.target.value)}
          className="px-3 py-2 text-sm" />
        <button disabled={!file || loading} onClick={upload}
          className="disabled:opacity-20 text-sm self-start opacity-60 hover:opacity-100">
          {loading ? 'uploading...' : 'upload'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(item => (
          <div key={item.title} className="overflow-hidden h-min">
            <img src={`${apiBaseUrl}${item.source}`} className="w-full object-cover" />
            <div className="pt-2 flex flex-col gap-1">
              <p className="text-xs truncate opacity-50">{item.title}</p>
              {editingCaption[item.title] !== undefined ? (
                <div className="flex gap-1">
                  <input value={editingCaption[item.title]} onChange={e =>
                    setEditingCaption(prev => ({ ...prev, [item.title]: e.target.value }))}
                    className="px-2 py-0.5 text-xs flex-1"
                    onKeyDown={e => e.key === 'Enter' && updateCaption(item.title)}
                  />
                  <button onClick={() => updateCaption(item.title)}
                    className="text-xs">save</button>
                </div>
              ) : (
                <p className="text-xs truncate"
                  onClick={() => setEditingCaption(prev => ({ ...prev, [item.title]: item.caption }))}>
                  {item.caption || <span className="opacity-30">no caption</span>}
                </p>
              )}
              <div className="flex gap-2 mt-1">
                <button onClick={() => toggleDisplay(item)}
                  className={`text-xs ${item.display ? 'opacity-60' : 'opacity-30 line-through'}`}>
                  {item.display ? 'visible' : 'hidden'}
                </button>
                <button onClick={() => remove(item.title)}
                  className="text-xs opacity-40 hover:opacity-100 button-delete">delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
