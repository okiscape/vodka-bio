'use client'

import { useEffect, useState } from "react"

interface Score {
  name: string
  value: number
  max: number
}

interface RatingItem {
  id: number
  title: string
  scores: Score[]
  banner: string | null
  summary: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export default function RatingsTab({ apiBaseUrl, headers, showStatus }: {
  apiBaseUrl: string
  headers: () => Record<string, string>
  showStatus: (ok: boolean, text: string) => void
}) {
  const [items, setItems] = useState<RatingItem[]>([])
  const [editing, setEditing] = useState<Partial<RatingItem> & { scores: Score[] } | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [descPreview, setDescPreview] = useState(false)

  function load() {
    fetch(`${apiBaseUrl}/ratings`)
      .then(r => r.json())
      .then(d => setItems(d.items))
      .catch(() => showStatus(false, 'failed to load ratings'))
  }

  useEffect(load, [])

  function newForm() {
    setEditing({ title: '', scores: [], banner: null, summary: '', description: '' })
    setEditId(null)
    setDescPreview(false)
  }

  function startEdit(item: RatingItem) {
    setEditing({
      title: item.title,
      scores: item.scores.map(s => ({ ...s })),
      banner: item.banner,
      summary: item.summary || '',
      description: item.description || '',
    })
    setEditId(item.id)
    setDescPreview(false)
  }

  function cancelEdit() {
    setEditing(null)
    setEditId(null)
  }

  function addScore() {
    if (!editing) return
    setEditing({ ...editing, scores: [...editing.scores, { name: '', value: 0, max: 10 }] })
  }

  function updateScore(i: number, field: keyof Score, val: string) {
    if (!editing) return
    const scores = [...editing.scores]
    if (field === 'name') scores[i] = { ...scores[i], name: val }
    else scores[i] = { ...scores[i], [field]: val === '' ? 0 : Number(val) }
    setEditing({ ...editing, scores })
  }

  function removeScore(i: number) {
    if (!editing) return
    setEditing({ ...editing, scores: editing.scores.filter((_, idx) => idx !== i) })
  }

  async function save() {
    if (!editing || !editing.title) return showStatus(false, 'title is required')
    const body: Record<string, any> = {
      title: editing.title,
      scores: editing.scores,
      banner: editing.banner || null,
      summary: editing.summary || null,
      description: editing.description || null,
    }

    try {
      const method = editId ? 'PATCH' : 'POST'
      const url = editId ? `${apiBaseUrl}/ratings/${editId}` : `${apiBaseUrl}/ratings`
      const r = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(body),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message) }
      showStatus(true, editId ? 'updated' : 'created')
      cancelEdit()
      load()
    } catch (e: any) {
      showStatus(false, e.message || 'save failed')
    }
  }

  async function remove(id: number) {
    if (!confirm(`delete rating #${id}?`)) return
    try {
      const r = await fetch(`${apiBaseUrl}/ratings/${id}`, {
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
      {!editing && (
        <>
          <button onClick={newForm}
            className="text-sm self-start opacity-60 hover:opacity-100">
            + new rating
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map(item => (
              <div key={item.id} className="flex flex-col gap-2">
                {item.banner && <img src={item.banner} className="w-full h-24 object-cover" />}
                <p className="font-bold">{item.title}</p>
                {item.summary && <p className="text-xs opacity-60">{item.summary}</p>}
                <p className="text-xs opacity-40">{item.scores.length} score(s)</p>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => startEdit(item)}
                    className="text-xs">edit</button>
                  <button onClick={() => remove(item.id)}
                    className="text-xs opacity-40 hover:opacity-100">delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {editing && (
        <div className="w-full max-w-3xl flex flex-col gap-6">
          <p className="text-xl">{editId ? 'edit rating' : 'new rating'}</p>

          {editing.banner && (
            <img src={editing.banner} className="w-full h-48 object-cover" />
          )}

          <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
            className="text-3xl font-bold px-0"
            placeholder="title" />

          <input placeholder="banner image URL" value={editing.banner || ''} onChange={e =>
            setEditing({ ...editing, banner: e.target.value || null })}
            className="text-sm px-0" />

          <input placeholder="summary" value={editing.summary || ''} onChange={e =>
            setEditing({ ...editing, summary: e.target.value })}
            className="text-sm px-0 opacity-60" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-40">scores</span>
              <button onClick={addScore}
                className="text-xs opacity-40 hover:opacity-100">+ add score</button>
            </div>
            {editing.scores.map((s, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input placeholder="name" value={s.name} onChange={e => updateScore(i, 'name', e.target.value)}
                  className="px-0 py-1 text-sm flex-1" />
                <input type="number" placeholder="0" value={s.value} onChange={e => updateScore(i, 'value', e.target.value)}
                  className="px-0 py-1 text-sm w-12 text-center" />
                <span className="text-xs opacity-40">/</span>
                <input type="number" placeholder="10" value={s.max} onChange={e => updateScore(i, 'max', e.target.value)}
                  className="px-0 py-1 text-sm w-12 text-center" />
                <button onClick={() => removeScore(i)}
                  className="text-xs opacity-40 hover:opacity-100">x</button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-40">description (html)</span>
              <button onClick={() => setDescPreview(!descPreview)}
                className="text-xs opacity-40 hover:opacity-100">
                {descPreview ? 'edit' : 'preview'}
              </button>
            </div>
            {descPreview ? (
              <div className="min-h-32"
                dangerouslySetInnerHTML={{ __html: editing.description || '' }} />
            ) : (
              <textarea value={editing.description || ''} onChange={e =>
                setEditing({ ...editing, description: e.target.value })}
                className="min-h-64 font-mono text-sm resize-y px-0"
                placeholder="<p>html here...</p>" />
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={save}
              className="text-sm">{editId ? 'update' : 'create'}</button>
            <button onClick={cancelEdit}
              className="text-sm opacity-40 hover:opacity-100">cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
