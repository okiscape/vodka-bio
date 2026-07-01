import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Score {
  name: string
  value: number
  max: number
}

interface RatingItem {
  id: number
  title: string
  scores: Score[]
  banner: string | null
  summary: string | null
  description: string | null
  created_at: string
  updated_at: string
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isRecent(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (now.getTime() - d.getTime()) < 3 * 24 * 60 * 60 * 1000
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await fetch(`${process.env.API_BASEURL}/ratings/${id}`)
  if (!res.ok) return redirect("/404")
  const data = await res.json() as { item: RatingItem }
  const item = data.item

  return (
    <div className="rating-page">
      <Link href="/ratings" className="rating-back">
        &lt;- back to ratings
      </Link>
      <div className="rating-article">
        <div className="rating-meta">
          {item.banner && (
            <img
              src={item.banner}
              alt={item.title}
              className="rating-banner"
            />
          )}
          <div className="rating-title-row">
            <p className="rating-title">{item.title}</p>
            {isRecent(item.updated_at) && (
              <p className="rating-recent">recently updated</p>
            )}
          </div>
          <div className="rating-dates">
            <p>created {fmtDate(item.created_at)}</p>
            {item.created_at != item.updated_at && <p>updated {fmtDate(item.updated_at)}</p>}
          </div>
          {item.summary && <p className="rating-summary">{item.summary}</p>}
          {item.scores.length > 0 && (
            <div className="rating-scores">
              {item.scores.map((s, i) => (
                <div key={i}>
                  <div className="rating-score-name">{s.name}</div>
                  <div className="rating-score-value">
                    {s.value}
                    {s.max &&
                      <span className="rating-score-max">
                        <span className="sep">/</span>{s.max}
                      </span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {item.description && (
          <div
            className="rating-description"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}
      </div>
    </div>
  )
}
