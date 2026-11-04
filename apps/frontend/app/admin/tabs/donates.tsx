'use client'

import { useEffect, useState } from "react"
import DonatesList from "./list.donates"
import DonatesForm from "./editing.donates"

interface DonateMethodItem {
  id: number
  group_name: string
  method_name: string
  content: string
  qrtip: string
  description: string
  created_at: string
  updated_at: string
}

export default function DonatesTab({ apiBaseUrl, headers, showStatus }: {
  apiBaseUrl: string
  headers: () => Record<string, string>
  showStatus: (ok: boolean, text: string) => void
}) {
  const [items, setItems] = useState<DonateMethodItem[]>([])
  const [editing, setEditing] = useState<Partial<DonateMethodItem> | null>(null)
  const [editId, setEditId] = useState<number | null>(null)

  function load() {
    fetch(`${apiBaseUrl}/donates`)
      .then(r => r.json())
      .then(d => { if (d.ok) setItems(d.items) })
      .catch(() => showStatus(false, 'failed to load donation methods'))
  }

  useEffect(load, [])

  function newForm() {
    setEditing({ group_name: '', method_name: '', content: '', qrtip: '', description: '' })
    setEditId(null)
  }

  function startEdit(item: DonateMethodItem) {
    setEditing({
      group_name: item.group_name,
      method_name: item.method_name,
      content: item.content,
      qrtip: item.qrtip,
      description: item.description,
    })
    setEditId(item.id)
  }

  function cancelEdit() {
    setEditing(null)
    setEditId(null)
  }

  async function save(data: { group: string; method: string; content: string; qrtip: string; description: string }) {
    try {
      const method = editId ? 'PATCH' : 'POST'
      const url = editId ? `${apiBaseUrl}/donates/${editId}` : `${apiBaseUrl}/donates`
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
    if (!confirm(`delete donation method #${id}?`)) return
    try {
      const r = await fetch(`${apiBaseUrl}/donates/${id}`, {
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
    return <DonatesForm
      editId={editId}
      initial={{
        group_name: editing.group_name ?? '',
        method_name: editing.method_name ?? '',
        content: editing.content ?? '',
        qrtip: editing.qrtip ?? '',
        description: editing.description ?? '',
      }}
      onSave={save}
      onCancel={cancelEdit}
    />
  }

  return <DonatesList items={items} onNew={newForm} onEdit={startEdit} onRemove={remove} />
}
