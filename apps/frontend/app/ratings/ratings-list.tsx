'use client'

import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RatingItem } from './types'
import { getRating } from './funcs'


const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
})

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isRecent(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return (now.getTime() - d.getTime()) < 3 * 24 * 60 * 60 * 1000
}

export default function RatingsList({ apiBaseUrl }: { apiBaseUrl: string }) {
	const [apiAlive, setApiAlive] = useState<boolean | null>(null)
	const [filters, setFilters] = useState<string[]>([])
	const [allTags, setAllTags] = useState<string[]>([])
	const [fetchedRatings, setFetchedRatings] = useState<RatingItem[] | null>(null)

	async function fetchRatings() {
	  try {
	    if (!apiBaseUrl) {
	      console.error('API_BASEURL is not defined')
	      setApiAlive(false)
	      return
	    }

	    const res = await getRating(apiBaseUrl)

	    if (!res) {
	      console.error('getRating returned null/undefined')
	      setApiAlive(false)
	      return
	    }

	    const data = res.items
	    setApiAlive(true)

	    if (data) {
	      setFetchedRatings(data)
	      setAllTags(Array.from(new Set(data.flatMap((r: RatingItem) => r.tags || []))))
	    } else {
	      setFetchedRatings([])
	    }
	  } catch (e) {
	    console.error('fetchRatings failed:', e)
	    setApiAlive(false)
	  }
	}

	useEffect(() => {
		fetchRatings()
  }, [])

	function toggleFilter(tag: string) {
		setFilters((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }

	return (
		<div className="ratings-page">
      <p className="ratings-heading">ratings!</p>
      <p className="ratings-subtitle">things that.. i have opinion about</p>

      {apiAlive === null && <p className="ratings-error">loading...</p>}
      {apiAlive === false && <p className="ratings-error">API is died. Try again later on contact me, my contacts is on main page.</p>}
      {fetchedRatings !== null && <>
				{fetchedRatings.length <= 0 ? <p className="ratings-empty">That's pretty strange, either i've nothing rated yet, or the API is dead...</p> :
					<>
						<p className='mb-1'>tags</p>
						<div className='tags'>
							{allTags?.map(tag => (
	              <div
	                key={tag}
	                onClick={() => toggleFilter(tag)}
	                className={`tag ${filters.includes(tag) ? 'active' : ''}`}
	              >
	                {tag}
	              </div>
							))}
						</div>
							{fetchedRatings.filter((rating) =>
									filters.length === 0 ||
									filters.every((tag) => rating.tags?.includes(tag)))
								.length == 0 &&
									<p>no ratings was found with that filters :(</p>}
						<div className="ratings-grid">
							{fetchedRatings
								.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
								.filter((rating) =>
									filters.length === 0 ||
									filters.every((tag) => rating.tags?.includes(tag)))
								.map((item) => (
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
									{item.tags && <p className="summary">[{item.tags?.join("] [")}]</p>}

	                <div className="footer">
	                  <p>Avr. rating: {(item.scores.map((val, _, __) => (val.value))
	                    .reduce((partialSum, a) => partialSum + a, 0) / item.scores.length).toFixed(1)} </p>
	                  <p>{fmtDate(item.created_at)}</p>
	                </div>
	              </div>
	            </Link>
	          ))}
						</div>
          </>}
      </>}
    </div>
  )
}
