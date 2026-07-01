import { Montserrat } from 'next/font/google'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
})

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
  created_at: string
  updated_at: string
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isRecent(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (now.getTime() - d.getTime()) < 3 * 24 * 60 * 60 * 1000
}

export default async function Page() {
  var data
  var res
  try {
    res = await fetch(`${process.env.API_BASEURL}/ratings`)
    data = await res.json() as { items: RatingItem[] }
  }
  catch {}

  return (
    <div className="ratings-page">
      <p className="ratings-heading">ratings!</p>
      <p className="ratings-subtitle">things that.. i have opinion about</p>

      {!res && <p className="ratings-error">API is died. Try again later on contact me, my contacts is on main page.</p>}
      {data && <>
        {data.items.length <= 0 ? <p className="ratings-empty">That's pretty strange, either i've nothing rated yet, or the API is dead...</p> :
          <div className="ratings-grid">
            {data.items.reverse().map((item) => (
              <Link
                key={item.id}
                href={`/ratings/${item.id}`}
                className="ratings-card"
              >
              {item.banner && (
                <img
                  src={item.banner}
                  alt={item.title}
                  className="banner"
                />
              )}
              <div className="body">
                <div className="header">
                  <h2 className="title">{item.title}</h2>
                  {isRecent(item.updated_at) && (
                    <span className="recent">recently updated</span>
                  )}
                </div>
                {item.summary && <p className={`summary ` + montserrat.className}>{item.summary}</p>}
                <div className="footer">
                  <p>Avr. rating: {(item.scores.map((val, _, __) => (val.value))
                    .reduce((partialSum, a) => partialSum + a, 0) / item.scores.length).toFixed(1)} </p>
                  <p>{fmtDate(item.created_at)}</p>
                </div>
              </div>
            </Link>
          ))}
          </div>}
      </>}
    </div>
  )
}
