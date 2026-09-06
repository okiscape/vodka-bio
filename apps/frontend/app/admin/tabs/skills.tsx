'use client'

import { useEffect, useState } from "react"
import SkillsList from "./list.skills"
import SkillsForm from "./editing.skills"

interface SkillItem {
  id: number
  name: string
  description: string
  color: string
  created_at: string
  updated_at: string
}

export default function SkillsTab({ apiBaseUrl, headers, showStatus }: {
  apiBaseUrl: string
  headers: () => Record<string, string>
  showStatus: (ok: boolean, text: string) => void
}) {
  const [items, setItems] = useState<SkillItem[]>([])
  const [editing, setEditing] = useState<Partial<SkillItem> | null>(null)
  const [editId, setEditId] = useState<number | null>(null)

  function load() {
    fetch(`${apiBaseUrl}/skills`)
      .then(r => r.json())
      .then(d => { if (d.ok && Array.isArray(d.items)) setItems(d.items) })
      .catch(() => showStatus(false, 'failed to load skills'))
  }

  useEffect(load, [])

  function newForm() {
    setEditing({ name: '', description: '', color: '#ffffff' })
    setEditId(null)
  }

  function startEdit(item: SkillItem) {
    setEditing({
      name: item.name,
      description: item.description,
      color: item.color,
    })
    setEditId(item.id)
  }

  function cancelEdit() {
    setEditing(null)
    setEditId(null)
  }

  async function save(data: { name: string; description: string; color: string }) {
    try {
      const method = editId ? 'PATCH' : 'POST'
      const url = editId ? `${apiBaseUrl}/skills/${editId}` : `${apiBaseUrl}/skills`
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
    if (!confirm(`delete skill #${id}?`)) return
    try {
      const r = await fetch(`${apiBaseUrl}/skills/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": headers()["Authorization"] },
      })
      if (!r.ok) throw new Error('delete failed')
      load()
    } catch (e: any) {
      showStatus(false, e.message)
    }
  }

  if (editing) {
    return (
      <SkillsForm
        editId={editId}
        initial={{
          name: editing.name ?? '',
          description: editing.description ?? '',
          color: editing.color || '#ffffff',
        }}
        onSave={save}
        onCancel={cancelEdit}
      />
    )
  }

  return (
    <SkillsList
      items={items}
      onNew={newForm}
      onEdit={startEdit}
      onRemove={remove}
    />
  )
}