import CopyBanner from "./copyBanner";
type Props = {
 apiBaseUrl: string
}

export default async function Banners({apiBaseUrl}: Props) {
 let banners: { title: string, caption?: string, source: string, href?: string }[] | null = null
 try {
  const _apiFetch = await fetch(`${apiBaseUrl}/banners`)
  const apiFetch = await _apiFetch.json()
  if (apiFetch.items) {
   banners = apiFetch.items.map((banner: { title: string, caption?: string, source: string, href?: string }) => ({
    title: banner.title,
    source: banner.source,
    href: banner.href,
    caption: banner.caption
   }))
  }
 } catch { return null }
 if (!banners) return

 const mybanners = banners ? banners.filter((item) => item.href?.includes("oki.vodka")) : null

 return (
   banners && <>
    {mybanners && <div className="flex items-center gap-1">
     <p>My banner{mybanners?.length > 1 ? "s" : "" } - </p>
     {mybanners.map((mybanner) =>
        <CopyBanner url={`${apiBaseUrl}/${mybanner.source}`} title="my banner!!! click to copy!"
         name={mybanner.caption!} alt={mybanner.caption!} key={mybanner.title}/>
       )
      }
    </div>}
    <div className="flex flex-col items-center gap-2">
     <p>badgess/banners/buttons that i find pretty</p>
     <div className="userbanner-space">
      {banners.filter((item) =>
       !item.href?.includes("https://oki.vodka/"))
       .sort((a, b) => a.href == undefined ? 1 : -1)
       .map((banner) => (
        <a href={banner.href !== "me" ? banner.href : undefined} key={banners.indexOf(banner)} target="_blank">
         <img key={banners.indexOf(banner)} className="userbanner"
          src={`${apiBaseUrl}/${banner.source}`}
          alt={banner.caption} title={banner.caption} />
        </a>
      ))}
     </div>
    </div>
   </>
 )
}
