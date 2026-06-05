'use client'

import { useState } from "react"

type Props = {
 apiBaseUrl: string
}


export default function App({ apiBaseUrl }: Props) {
 const [hideGallery, setHideGallery] = useState<boolean>(false)
 const [shitpostGallery, setShitpostGallery] = useState<null | {title: string, source: string, caption: string}[]>(null)
 async function loadShitpostGallery() {
  const _shitpostsFetch = await fetch(`${apiBaseUrl}/gallery`)
  const galleryFetch = await _shitpostsFetch.json()
  setShitpostGallery(galleryFetch.items)
  console.log(galleryFetch.items)
 }

 return (
  <div className="shitpostgallery flex flex-col items-center">
   {shitpostGallery && <>
     <p>shitpost gallery!</p>
     <p className="cursor-pointer" onClick={() => setHideGallery(!hideGallery)}>&gt;&gt; {!hideGallery ? 'hide' : 'show'} memes &lt;&lt;</p>
   </>}
   {!shitpostGallery &&
    <p onClick={loadShitpostGallery} className="cursor-pointer">&gt;&gt; load shitpost gallery &lt;&lt;</p>}
    {shitpostGallery && !hideGallery && <div className="shitpostgallery content">
     {shitpostGallery.map((item) => (<img key={shitpostGallery.indexOf(item)} src={`${apiBaseUrl}${item.source}`} title={item.caption}/>))}
     </div>
    }
   </div>
 )
}
