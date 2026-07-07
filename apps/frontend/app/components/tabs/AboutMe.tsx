'use client'

import { Montserrat } from 'next/font/google'
import { useEffect, useState } from 'react'
import ScrobbleLiveActivity from "../liveActivity"

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
})

type Props = {
  apiBaseUrl: string
}

interface SiteInfo {
    about: {
        title: string
        aka: string
        description: string[]
        links: { href: string; name: string }[]
    }
}

export default function AboutMe({ apiBaseUrl }: Props) {
  const [info, setInfo] = useState<SiteInfo | null>(null)

  useEffect(() => {
    fetch(`${apiBaseUrl}/info`)
      .then(r => r.json())
      .then(d => setInfo(d.item))
      .catch(() => {})
  }, [apiBaseUrl])

  if (!info) return <div className="textcontainer"><p className="opacity-40">loading...</p></div>

  return (
    <div>
      <h1>{info.about.title}<span className="aka">{info.about.aka}</span></h1>
      <div className={`description ${montserrat.className}`}>
        {info.about.description.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mylinks">
        {info.about.links.map((link) => (
          <a href={link.href} key={link.name} target='_blank'>
            {link.name}
          </a>
        ))}
      </div>
      <ScrobbleLiveActivity apiBaseUrl={apiBaseUrl} />
    </div>
  )
}
