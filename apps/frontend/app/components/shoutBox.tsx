'use client'
import { useEffect, useState } from "react"
import './shoutBox.css'

type Shout = {
  id: number
  model_name: string
  cosmetics: string
  content: string
  created_at: string
}

type Props = {
  apiBaseUrl: string
}

export default function ShoutBox({ apiBaseUrl }: Props) {
    const [modelname, setModelname] = useState('')
    const [cosmetics, setCosmetics] = useState('')
    const [shoutContent, setShoutContent] = useState('')
    const [shouts, setShouts] = useState<Shout[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    async function fetchShouts() {
      try {
        setLoading(true)
        const r = await fetch(`${apiBaseUrl}/shouts?page=${page}&limit=20`)
        const json = await r.json()
        if (json.ok) {
          setShouts(json.items)
          setTotalPages(json.pagination.totalPages)
        }
      } catch {} finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      fetchShouts()
    }, [page])

    async function createShout() {
        if (!shoutContent.trim()) return
      try {
        const r = await fetch(`${apiBaseUrl}/shouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model_name: modelname,
            cosmetics,
            content: shoutContent,
          }),
        })
        const json = await r.json()
        if (json.ok) {
          setShoutContent('')
          setModelname('')
          setCosmetics('')
          setPage(1)
          await fetchShouts()
        } else {
            if (r.status == 429) {
                alert("you already had shouted recently! try again later")
            }
            if (r.status == 401) {
                alert("bad request, dont you forget to enter something or dont you trying to overflow my db?")
            }
        }
      } catch {}
    }

    return (
        <>
            <p>shoutbox!</p>
            <div className="shoutbox">
                <div className="inputs">
                    <input type="text" value={modelname}
                        placeholder="model-name-w-opts"
                        onChange={e => setModelname(e.target.value)} />
                    <input type="text" value={cosmetics}
                        placeholder="cosmetics (optional)"
                        onChange={e => setCosmetics(e.target.value)} />
                    <textarea value={shoutContent}
                        placeholder="output (required)"
                        onChange={e => setShoutContent(e.target.value)} />
                    <p className="text-center opacity-50">your shout will be displayed after approval</p>
                    <button onClick={createShout}>shout!</button>
                </div>
                <div className="list">
                  {loading ? (
                    <p className="opacity-40">loading...</p>
                  ) : shouts.length === 0 ? (
                    <p className="opacity-40">no shouts yet</p>
                  ) : (
                      <>
                        <>
                      {shouts.map(s => (
                        <div key={s.id} className="item">
                          <div className="meta">
                            <span className="author">
                              {s.model_name || 'anonymous'}
                              {s.cosmetics ? ` (${s.cosmetics})` : ''}
                            </span>
                            <span className="date">
                              {new Date(s.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="content">{s.content}</div>
                        </div>
                      ))}</>
                      {totalPages > 1 && (
                        <div className="pagination">
                          <button disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}>prev</button>
                          <span>{page} / {totalPages}</span>
                          <button disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}>next</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
            </div>
        </>
    )
}
