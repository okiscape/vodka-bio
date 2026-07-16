'use client'

import { useEffect, useState } from "react"

interface LinkItem {
  name: string
  href: string
}

export default function MainTab({ apiBaseUrl, headers, showStatus }: {
  apiBaseUrl: string
  headers: () => Record<string, string>
  showStatus: (ok: boolean, text: string) => void
}) {
  const [title, setTitle] = useState('')
  const [aka, setAka] = useState('')
  const [contactUrl, setContactUrl] = useState('')
  const [descriptionText, setDescriptionText] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${apiBaseUrl}/info`)
      .then(r => r.json())
      .then(d => {
        const item = d.item
        setTitle(item.about.title)
        setAka(item.about.aka)
        setContactUrl(item.about.contactUrl)
        setDescriptionText((item.about.description || []).join('\n'))
        setLinks(item.about.links || [])
        setLoaded(true)
      })
      .catch(() => showStatus(false, 'failed to load site info'))
  }, [])

  function addLink() {
    setLinks([...links, { name: '', href: '' }])
  }

  function updateLink(i: number, field: 'name' | 'href', val: string) {
    const next = [...links]
    next[i] = { ...next[i], [field]: val }
    setLinks(next)
  }

  function removeLink(i: number) {
    setLinks(links.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    try {
      const r = await fetch(`${apiBaseUrl}/info`, {
        method: 'PATCH',
        headers: headers(),
          body: JSON.stringify({
              about: {
                  title: title,
                  aka: aka,
                  contactUrl: contactUrl || undefined,
                  description: descriptionText.split('\n').filter(p => p.trim()),
                  links: links.filter(l => l.name && l.href),
              }
        }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message) }
      showStatus(true, 'saved')
    } catch (e: any) {
      showStatus(false, e.message || 'save failed')
    }
  }

  if (!loaded) return <p className="opacity-40">loading...</p>

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6">
      <p className="text-xl">main page settings</p>

      <input
        placeholder="title"
        defaultValue={title}
        onChange={e => setTitle(e.target.value)}
        className="text-3xl font-bold px-0"
      />

      <input
        placeholder="aka (text in parentheses)"
        defaultValue={aka}
        onChange={e => setAka(e.target.value)}
        className="text-sm px-0 opacity-60"
      />

      <div className="flex flex-col gap-2">
        <span className="text-xs opacity-40">description (one paragraph per line)</span>
        <textarea
          defaultValue={descriptionText}
          onChange={e => setDescriptionText(e.target.value)}
          className="min-h-32 font-mono text-sm px-0"
          rows={8}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs opacity-40">links</span>
          <button onClick={addLink}
            className="text-xs opacity-40 hover:opacity-100">+ add link</button>
        </div>
        {links.map((link, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              placeholder="name"
              value={link.name}
              onChange={e => updateLink(i, 'name', e.target.value)}
              className="px-0 py-1 text-sm flex-1"
            />
            <input
              placeholder="url"
              value={link.href}
              onChange={e => updateLink(i, 'href', e.target.value)}
              className="px-0 py-1 text-sm flex-[2]"
            />
            <button onClick={() => removeLink(i)}
              className="text-xs opacity-40 hover:opacity-100">x</button>
          </div>
        ))}
      </div>

      <input
        placeholder="contact url"
        defaultValue={contactUrl}
        onChange={e => setContactUrl(e.target.value)}
        className="text-sm px-0 opacity-60"
      />

      <div className="flex gap-4 pt-2">
        <button onClick={handleSave}
          className="text-sm">save</button>
      </div>
    </div>
  )
}
