'use client'

import { useState } from 'react'

type Props = {
  url: string
  name: string
  title: string
  alt: string

}

export default function CopyBanner({ url, name, alt, title }: Props) {
  const [copied, setCopied] = useState(false)

  function handleClick() {
    navigator.clipboard.writeText(
      `<img src="${url}" alt="${alt}" title="${name}" />`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {copied && (
        <div style={{
          position: 'absolute',
          top: '-1.8rem',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          color: '#fff',
        }}>
          copied!
        </div>
      )}
      <img
        className="userbanner oguribanner"
        src={url}
        alt={name}
        title={title}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )
}
