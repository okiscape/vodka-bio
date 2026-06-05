import CopyBanner from "./copyBanner";
type Props = {
 apiBaseUrl: string
}

// todocreate badges: otoring, sewerslvt/cynthoni, zen, react
export default async function Banners({apiBaseUrl}: Props) {
 const _apiFetch = await fetch(`${apiBaseUrl}/banners`)
 const apiFetch = await _apiFetch.json()
 if (!apiFetch.items) return

 const banners: { title: string, caption?: string, source: string, href?: string }[] = apiFetch.items.map((banner: { title: string, caption?: string, source: string, href?: string }) => ({
  title: banner.title,
  source: banner.source,
  href: banner.href,
  caption: banner.caption
 }))

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
     <p>badgess whichs i find pretty ~w~</p>
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
