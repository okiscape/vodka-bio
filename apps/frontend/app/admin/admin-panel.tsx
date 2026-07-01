'use client'

import { useEffect, useState } from "react"
import GalleryTab from "./tabs/gallery-tab"
import BannersTab from "./tabs/banners-tab"
import RatingsTab from "./tabs/ratings-tab"

type Props = {
  apiBaseUrl: string
}

const STORAGE_KEY = 'admin_token'

export default function AdminPanel({ apiBaseUrl }: Props) {
  const [tab, setTab] = useState<'gallery' | 'banners' | 'ratings'>('gallery')
  const [token, setToken] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean, text: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setToken(saved)
  }, [])

  async function saveToken() {
    if (!tokenInput) return
    try {
      const r = await fetch(`${apiBaseUrl}/admin/check`, {
        headers: { 'Authorization': `Bearer ${tokenInput}` },
      })
      if (!r.ok) throw new Error('Invalid token')
      localStorage.setItem(STORAGE_KEY, tokenInput)
      setToken(tokenInput)
    } catch {
      setStatusMsg({ ok: false, text: 'invalid token or api unreachable' })
      setTimeout(() => setStatusMsg(null), 3000)
    }
  }

  function clearToken() {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    setTokenInput('')
  }

  function headers() {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  function showStatus(ok: boolean, text: string) {
    setStatusMsg({ ok, text })
    setTimeout(() => setStatusMsg(null), 3000)
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center mt-30 gap-4">
        <p className="text-2xl">admin panel</p>
        <input
          className="px-4 py-2 w-80 text-sm font-mono text-center"
          type="password"
          placeholder="token"
          value={tokenInput}
          onChange={e => setTokenInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveToken()}
        />
        <button className="text-sm opacity-60 hover:opacity-100" onClick={saveToken}>login</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center mt-30 w-full max-w-5xl px-4 self-center">
      <div className="w-full flex items-center justify-between mb-6">
        <p className="text-2xl">admin panel</p>
        <button className="text-xs opacity-40 hover:opacity-100" onClick={clearToken}>logout</button>
      </div>

      {statusMsg && (
        <p className={`mb-4 text-sm ${statusMsg.ok ? 'opacity-60' : 'opacity-40'}`}>{statusMsg.text}</p>
      )}

      <div className="flex gap-4 mb-8">
        {(['gallery', 'banners', 'ratings'] as const).map(t => (
          <button
            key={t}
            className={`px-6 py-1 ${tab === t ? 'text-xl' : 'opacity-40 hover:opacity-100'}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'gallery' && <GalleryTab apiBaseUrl={apiBaseUrl} headers={headers} showStatus={showStatus} />}
      {tab === 'banners' && <BannersTab apiBaseUrl={apiBaseUrl} headers={headers} showStatus={showStatus} />}
      {tab === 'ratings' && <RatingsTab apiBaseUrl={apiBaseUrl} headers={headers} showStatus={showStatus} />}
    </div>
  )
}
