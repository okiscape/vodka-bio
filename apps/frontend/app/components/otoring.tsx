export default async function Otoring() {
 let prev: { name?: string; url?: string } | null = null
 let next: { name?: string; url?: string } | null = null

 try {
  const res = await fetch(`https://webring.otomir23.me/${process.env.OTORING_SLUG}/data`, {
   next: { revalidate: 3600 * 6 },
  })
  if (res.ok) {
   const data = await res.json()
   prev = data?.prev ?? null
   next = data?.next ?? null
  }
 } catch { }

 return (
  <div className="gap-5 flex opacity-55 otoring-container">
   <a href={prev?.url}>{prev?.name || '[not found]'}</a>
   <a href="https://webring.otomir23.me/">otoring</a>
   <a href={next?.url}>{next?.name || '[not found]'}</a>
  </div>
 )
}
