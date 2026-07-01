'use client'

import { useEffect, useState } from "react"
import RatingsList from "./list.ratings"
import RatingsForm from "./editing.ratings"

interface Score {
  name: string
  value: number
  max?: number
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
  }

  function cancelEdit() {
    setEditing(null)
    setEditId(null)
  }

  async function save(data: { title: string; scores: Score[]; banner: string | null; summary: string | null; description: string | null }) {
    try {
      const method = editId ? 'PATCH' : 'POST'
      const url = editId ? `${apiBaseUrl}/ratings/${editId}` : `${apiBaseUrl}/ratings`
      const r = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(data),
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
        headers: {"Authorization": headers()["Authorization"]},
      })
      if (!r.ok) throw new Error('delete failed')
      load()
    } catch (e: any) {
      showStatus(false, e.message)
    }
  }

  if (editing) {
    return (
      <RatingsForm
        editId={editId}
        initial={{
          title: editing.title!,
          scores: editing.scores,
          banner: editing.banner ?? null,
          summary: editing.summary ?? '',
          description: editing.description ?? '',
        }}
        onSave={save}
        onCancel={cancelEdit}
      />
    )
  }

  return (
    <RatingsList
      items={items}
      onNew={newForm}
      onEdit={startEdit}
      onRemove={remove}
    />
  )
}
