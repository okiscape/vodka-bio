'use client'

import { useEffect, useState } from "react"
import { Montserrat } from 'next/font/google'

type Props = {
 apiBaseUrl: string
}

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
})

export default function App({ apiBaseUrl }: Props) {
 const [nowPlaying, setNowPlaying] = useState<{title: string, artist: string, cover: string, url: string} | null>(null)
 async function fetchState() {
  const _apiFetch = await fetch(`${apiBaseUrl}/scrobbles/nowplaying`)
  const apiFetch = await _apiFetch.json()
  if (!apiFetch.track) return

  setNowPlaying({
   title: apiFetch.track.name,
   artist: apiFetch.track.artist.name,
   cover: apiFetch.track.image,
   url: apiFetch.track.url
  })
  console.log(apiFetch)
 }

 useEffect(() => {
   fetchState()
   const interval = setInterval(fetchState, 15000)
   return () => clearInterval(interval)
 }, [])

 return (
  <div>
   {nowPlaying &&
    <a className="nowplaying-container" href={nowPlaying.url}>
     <img src={nowPlaying.cover} className="cover" />
     <div className="meta">
      <p className={`artist ${montserrat.className} mb-2`}>now playing</p>
      <p className="title">{nowPlaying.title}</p>
      <p className={`artist ${montserrat.className}`}>{nowPlaying.artist}</p>
     </div>
    </a>}
   </div>
 )
}
