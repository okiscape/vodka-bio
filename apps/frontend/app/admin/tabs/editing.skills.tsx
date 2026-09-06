'use client'

import { useState } from "react"

export default function SkillsForm({ editId, initial, onSave, onCancel }: {
  editId: number | null
  initial: { name: string; description: string; color: string }
  onSave: (data: { name: string; description: string; color: string }) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [color, setColor] = useState(initial.color)

  async function handleSave() {
    if (!name) return
    await onSave({
      name,
      description,
      color: color || '#ffffff',
    })
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <p className="text-xl">{editId ? 'edit skill' : 'new skill'}</p>

      <div className="flex flex-col gap-4">
        <input value={name} onChange={e => setName(e.target.value)}
          className="text-3xl font-bold px-0"
          placeholder="name (language/util)" />

        <div className="flex flex-col gap-2">
          <span className="text-xs opacity-40">description (what you can do)</span>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="min-h-32 font-mono overflow-visible resize-y text-sm px-0"
            placeholder="description..." />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-xs opacity-40">color</label>
          <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#ffffff'}
            onChange={e => setColor(e.target.value)}
            className="w-12 h-8 p-0 cursor-pointer" />
          <input value={color} onChange={e => setColor(e.target.value)}
            className="text-sm px-0 w-32 font-mono"
            placeholder="#ffffff" />
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