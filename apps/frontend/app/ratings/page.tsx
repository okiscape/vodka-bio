'use client'

import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {getRating, isRecent} from "./funcs"
import { RatingItem } from './types'


const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
})

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { hour: "2-digit", minute: "2-digit", day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Page() {
	const [apiAlive, setApiAlive] = useState<boolean | null>(null)
	const [filters, setFilters] = useState<string[]>([])
	const [allTags, setAllTags] = useState<string[]>([])
	const [fetchedRatings, setFetchedRatings] = useState<RatingItem[] | null>(null)

	if (!process.env.API_BASEURL) return (
		<div>
			<p>theory of consentable internet, user: i consent! dev: i consent! envs: im not!!!</p>
			<p>contact me on main page</p>
		</div>
  )

	async function fetchRatings() {
		try {
			if (!process.env.API_BASEURL) throw new Error("process.env.API_BASEURL is undefined")
			const res = await getRating(process.env.API_BASEURL)
			setApiAlive(res != null)

			const data = res.items
			if (data) {
				setFetchedRatings(data)
				setAllTags(Array.from(new Set(data.flatMap((r: RatingItem) => r.tags || []))))
			}
		}
		catch { }
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
								.sort((a, b) => new Date(a.updated_at) > new Date(b.updated_at) ? 1 : 0)
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
	                    <span className="recent" title={fmtDate(item.updated_at)}>recently updated</span>
	                  )}
	                </div>
									{item.summary && <p className={`summary ` + montserrat.className}>{item.summary}</p>}
									{item.tags && <p className="summary">[{item.tags?.join("] [")}]</p>}

	                <div className="footer">
	                  <p>Avr. rating: {(item.scores.map((val, _, __) => (val.value))
	                    .reduce((partialSum, a) => partialSum + a, 0) / item.scores.length).toFixed(1)} </p>
										<div className='text-right'>
											<p title='updated at'>{fmtDate(item.updated_at)}</p>
											<p title='created at'>{fmtDate(item.created_at)}</p>
										</div>
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
