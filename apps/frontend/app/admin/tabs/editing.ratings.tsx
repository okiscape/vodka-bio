'use client'

import { useState } from "react"

interface Score {
  name: string
  value: number
  max?: number
}

interface FormScore {
  name: string
  value: string
  max: string
}

function sanitizeNumber(value: string) {
  let v = value.replace(/[^0-9.]/g, '')
  const parts = v.split('.')
  if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('')
  return v
}

export default function RatingsForm({ editId, initial, onSave, onCancel }: {
  editId: number | null
	initial: { title: string; scores: Score[]; banner: string | null; summary: string; description: string; tags?: string[] }
	onSave: (data: { title: string; scores: Score[]; banner: string | null; summary: string | null; description: string | null; tags?: string[]}) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial.title)
  const [banner, setBanner] = useState(initial.banner ?? '')
  const [summary, setSummary] = useState(initial.summary)
  const [tags, setTags] = useState<string | undefined>(initial.tags?.join(" "))
  const [scores, setScores] = useState<FormScore[]>(
    initial.scores.map(s => ({ name: s.name, value: String(s.value ?? ''), max: String(s.max ?? '') }))
  )
  const [description, setDescription] = useState(initial.description)
  const [descPreview, setDescPreview] = useState(false)

  function addScore() {
    setScores([...scores, { name: '', value: '', max: '' }])
  }

  function updateScore(i: number, field: keyof FormScore, val: string) {
    const next = [...scores]
    next[i] = { ...next[i], [field]: val }
    setScores(next)
  }

  function updateScoreNumeric(i: number, field: 'value' | 'max', val: string) {
    updateScore(i, field, sanitizeNumber(val))
  }

  function removeScore(i: number) {
    setScores(scores.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!title) return
    await onSave({
      title,
      scores: scores.filter((score) => score.name && score.value).map(s => ({
        name: s.name,
        value: s.value === '' ? 0 : Number(s.value),
        ...(s.max !== '' ? { max: Number(s.max) } : {}),
      })),
      banner: banner || null,
			summary: summary || null,
      tags: tags === undefined ? undefined : tags.split(" "),
      description: description || null,
    })
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <p className="text-xl">{editId ? 'edit rating' : 'new rating'}</p>

      <div className="flex gap-16 min-h-96 justify-center">
        <div className="flex flex-col">
          {banner && (
            <img src={banner} className="w-full h-48 object-cover" />
          )}

          <input value={title} onChange={e => setTitle(e.target.value)}
            className="text-3xl font-bold px-0"
            placeholder="title" />

          <input placeholder="banner image URL" value={banner} title="banner image URL" onChange={e => setBanner(e.target.value)}
            className="text-sm px-0" />

          <input placeholder="summary" value={summary} title="summary" onChange={e => setSummary(e.target.value)}
            className="text-sm px-0 opacity-60" />

          <input placeholder="tags(divide by space)" value={tags} title="tags(divide by space)" onChange={e => setTags(e.target.value)}
            className="text-sm px-0 opacity-60" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-40">scores</span>
              <button onClick={addScore}
                className="text-xs opacity-40 hover:opacity-100">+ add score</button>
            </div>
            {scores.map((s, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input placeholder="name" value={s.name} onChange={e => updateScore(i, 'name', e.target.value)}
                  className="px-0 py-1 text-sm flex-1" />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={s.value}
                  onChange={e => updateScoreNumeric(i, 'value', e.target.value)}
                  className="px-0 py-1 text-sm w-12 text-center"
                />
                <span className="text-xs opacity-40">/</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="__"
                  value={s.max}
                  onChange={e => updateScoreNumeric(i, 'max', e.target.value)}
                  className="px-0 py-1 text-sm w-12 text-center"
                />
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
            <div className="min-h-32 w-170 font-montserrat"
              dangerouslySetInnerHTML={{ __html: description }} />
          ) : (
            <textarea value={description} onChange={e => setDescription(e.target.value)}
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
