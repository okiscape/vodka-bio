'use client'

import { useState } from "react"

export default function ProjectsForm({ editId, initial, onSave, onCancel }: {
  editId: number | null
  initial: { title: string; description: string; url: string }
  onSave: (data: { title: string; description: string; url: string | null }) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [url, setUrl] = useState(initial.url)

  async function handleSave() {
    if (!title) return
    await onSave({
      title,
      description,
      url: url || null,
    })
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <p className="text-xl">{editId ? 'edit project' : 'new project'}</p>

      <div className="flex flex-col gap-4">
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="text-3xl font-bold px-0"
          placeholder="title" />

        <input placeholder="url" value={url} onChange={e => setUrl(e.target.value)}
          className="text-sm px-0" />

        <div className="flex flex-col gap-2">
          <span className="text-xs opacity-40">description (plain text)</span>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="min-h-32 font-mono overflow-visible resize-y text-sm px-0"
            placeholder="description..." />
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button onClick={handleSave}
          className="text-sm">{editId ? 'update' : 'create'}</button>
        <button onClick={onCancel}
          className="text-sm opacity-40 hover:opacity-100">cancel</button>
      </div>
    </div>
  )
}
