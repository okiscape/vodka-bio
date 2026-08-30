'use client'

import { useEffect, useState } from "react"

type Props = {
 apiBaseUrl: string
}

export default function App({ apiBaseUrl }: Props) {
 const [nowPlaying, setNowPlaying] = useState<{title: string, artist: string, cover: string, url: string} | null>(null)
 async function fetchState() {
  const _apiFetch = await fetch(`${apiBaseUrl}/scrobbles/nowplaying`)
  const apiFetch = await _apiFetch.json()
  if (!apiFetch.track || !apiFetch.track.nowplaying) return

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
    <a className="nowplaying-container" href={nowPlaying.url} target="_blank">
     {nowPlaying.cover && <img src={nowPlaying.cover} className="cover" />}
     <div className="meta">
      <p className="artist mb-2 font-montserrat">now playing</p>
      <p className="title">{nowPlaying.title}</p>
      <p className="artist font-montserrat">{nowPlaying.artist}</p>
     </div>
    </a>}
   </div>
 )
}
