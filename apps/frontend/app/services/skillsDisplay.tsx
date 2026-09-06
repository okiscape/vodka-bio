'use client'

import { useEffect, useState } from "react"

interface SkillItem {
  id: number
  name: string
  description: string
  color: string
}

export default function SkillsDisplay({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [loading, setLoading] = useState(true)
  const [apiDead, setApiDead] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`${apiBaseUrl}/skills`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        if (d.ok && Array.isArray(d.items)) {
          setSkills(d.items)
          setApiDead(d.items.length === 0)
        } else {
          setApiDead(true)
        }
      })
      .catch(() => { if (!cancelled) setApiDead(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [apiBaseUrl])

  if (loading) return <p className="skilldisplay-status">loading skills...</p>
  if (apiDead || skills.length === 0) return <p className="skilldisplay-status">no skills yet, i need to add em here soon...</p>

  return (
    <div className="skilldisplay">
      {skills.map((skill, i) => (
        <div
          key={`${skill.id}-${i}`}
          className="skillcard"
          style={{ '--skill-color': skill.color } as React.CSSProperties}
        >
          <h2 className="name">{skill.name}</h2>
          <div>
            <p className="description">{skill.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
