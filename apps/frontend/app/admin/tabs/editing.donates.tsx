'use client'

import { useState } from "react"

export default function DonatesForm({ editId, initial, onSave, onCancel }: {
  editId: number | null
  initial: {
    group_name: string
    method_name: string
    content: string
    qrtip: string
    description: string
  }
  onSave: (data: { group: string; method: string; content: string; qrtip: string; description: string }) => Promise<void>
  onCancel: () => void
}) {
  const [group, setGroup] = useState(initial.group_name)
  const [method, setMethod] = useState(initial.method_name)
  const [content, setContent] = useState(initial.content)
  const [qrtip, setQrtip] = useState(initial.qrtip)
  const [description, setDescription] = useState(initial.description)

  async function handleSave() {
    if (!group || !method || !content) return
    await onSave({
      group,
      method,
      content,
      qrtip,
      description,
    })
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <p className="text-xl">{editId ? 'edit donation method' : 'new donation method'}</p>

      <div className="flex flex-col gap-4">
        <input value={group} onChange={e => setGroup(e.target.value)}
          className="admin-h1 font-bold px-0"
          placeholder="group" />

        <input value={method} onChange={e => setMethod(e.target.value)}
          className="admin-h1 font-bold px-0"
          placeholder="method" />

        <input value={content} onChange={e => setContent(e.target.value)}
          className="text-sm px-0"
          placeholder="content (wallet address / url)" />

        <input value={qrtip} onChange={e => setQrtip(e.target.value)}
          className="text-sm px-0"
          placeholder="qrtip" />

        <input value={description} onChange={e => setDescription(e.target.value)}
          className="text-sm px-0"
          placeholder="description" />

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave}
            className="text-sm">{editId ? 'update' : 'create'}</button>
          <button onClick={onCancel}
            className="text-sm opacity-60 hover:opacity-100">cancel</button>
        </div>
      </div>
    </div>
  )
}
