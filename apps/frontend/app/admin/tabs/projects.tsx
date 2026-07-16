'use client'

import { useEffect, useState } from "react"
import ProjectsList from "./list.projects"
import ProjectsForm from "./editing.projects"

interface ProjectItem {
  id: number
  title: string
  description: string
  url: string | null
  created_at: string
  updated_at: string
}

export default function ProjectsTab({ apiBaseUrl, headers, showStatus }: {
  apiBaseUrl: string
  headers: () => Record<string, string>
  showStatus: (ok: boolean, text: string) => void
}) {
  const [items, setItems] = useState<ProjectItem[]>([])
  const [editing, setEditing] = useState<Partial<ProjectItem> | null>(null)
  const [editId, setEditId] = useState<number | null>(null)

  function load() {
    fetch(`${apiBaseUrl}/projects`)
      .then(r => r.json())
      .then(d => setItems(d.items))
      .catch(() => showStatus(false, 'failed to load projects'))
  }

  useEffect(load, [])

  function newForm() {
    setEditing({ title: '', description: '', url: '' })
    setEditId(null)
  }

  function startEdit(item: ProjectItem) {
    setEditing({
      title: item.title,
      description: item.description,
      url: item.url ?? '',
    })
    setEditId(item.id)
  }

  function cancelEdit() {
    setEditing(null)
    setEditId(null)
  }

  async function save(data: { title: string; description: string; url: string | null }) {
    try {
      const method = editId ? 'PATCH' : 'POST'
      const url = editId ? `${apiBaseUrl}/projects/${editId}` : `${apiBaseUrl}/projects`
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
    if (!confirm(`delete project #${id}?`)) return
    try {
      const r = await fetch(`${apiBaseUrl}/projects/${id}`, {
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
      <ProjectsForm
        editId={editId}
        initial={{
          title: editing.title ?? '',
          description: editing.description ?? '',
          url: editing.url ?? '',
        }}
        onSave={save}
        onCancel={cancelEdit}
      />
    )
  }

  return (
    <ProjectsList
      items={items}
      onNew={newForm}
      onEdit={startEdit}
      onRemove={remove}
    />
  )
}
