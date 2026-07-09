export const dynamic = 'force-dynamic'

export default async function App(props: { searchParams: Promise<{ showHidden?: string }> }) {
 const searchParams = await props.searchParams
 const qs = searchParams.showHidden === 'true' ? '?showHidden=true' : ''
 const _shitpostsFetch = await fetch(`${process.env.API_BASEURL}/gallery${qs}`)
 const galleryFetch = await _shitpostsFetch.json() as {items:{source: string, caption: string, display?: boolean}[]}

 return (
  <div className="flex flex-col items-center">
   <p className="mt-30 mb-5 text-4xl">my shitpost gallery!</p>
   <p className="mb-10 text-lg content-center">here i "post" any pictures that i found funny asf of decided it to place here</p>
    {galleryFetch && <div className="shitpostgallery content">
     {galleryFetch.items.map((item, i) => (<img key={i} src={`${process.env.API_BASEURL}${item.source}`} title={item.caption}/>))}
     </div>
    }
   </div>
 )
}
