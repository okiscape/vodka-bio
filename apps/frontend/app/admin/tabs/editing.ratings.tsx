'use client'

import { useState } from "react"

interface Score {
  name: string
  value: number
  max?: number
}

export default function RatingsForm({ editId, initial, onSave, onCancel }: {
  editId: number | null
  initial: { title: string; scores: Score[]; banner: string | null; summary: string; description: string }
  onSave: (data: { title: string; scores: Score[]; banner: string | null; summary: string | null; description: string | null }) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)
  const [descPreview, setDescPreview] = useState(false)

  function addScore() {
    setForm({ ...form, scores: [...form.scores, { name: '', value: 0 }] })
  }

  function updateScore(i: number, field: keyof Score, val: string) {
    const scores = [...form.scores]
    if (field === 'name') scores[i] = { ...scores[i], name: val }
    else scores[i] = { ...scores[i], [field]: val === '' ? 0 : Number(val) }
    setForm({ ...form, scores })
  }

  function removeScore(i: number) {
    setForm({ ...form, scores: form.scores.filter((_, idx) => idx !== i) })
  }

  async function handleSave() {
    if (!form.title) return
    await onSave({
      title: form.title,
      scores: form.scores,
      banner: form.banner || null,
      summary: form.summary || null,
      description: form.description || null,
    })
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <p className="text-xl">{editId ? 'edit rating' : 'new rating'}</p>

			<div className="flex gap-16 min-h-96 justify-center">
				<div className="flex flex-col">
					{form.banner && (
        		<img src={form.banner} className="w-full h-48 object-cover" />
      		)}

		      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
		        className="text-3xl font-bold px-0"
		        placeholder="title" />

		      <input placeholder="banner image URL" value={form.banner || ''} onChange={e =>
		        setForm({ ...form, banner: e.target.value || null })}
		        className="text-sm px-0" />

		      <input placeholder="summary" value={form.summary || ''} onChange={e =>
		        setForm({ ...form, summary: e.target.value })}
		        className="text-sm px-0 opacity-60" />

		      <div className="flex flex-col gap-3">
		        <div className="flex items-center justify-between">
		          <span className="text-xs opacity-40">scores</span>
		          <button onClick={addScore}
		            className="text-xs opacity-40 hover:opacity-100">+ add score</button>
		        </div>
		        {form.scores.map((s, i) => (
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
          <div className="min-h-32 w-170"
            dangerouslySetInnerHTML={{ __html: form.description || '' }} />
        ) : (
          <textarea value={form.description || ''} onChange={e =>
            setForm({ ...form, description: e.target.value })}
            className="min-h-64 w-170 font-mono overflow-visible resize-y text-sm px-0"
            placeholder="<p>html here...</p>" />
        )}
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
