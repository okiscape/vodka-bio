export const dynamic = 'force-dynamic'

import "./globals.css";
import { Montserrat_Underline } from 'next/font/google'
import TabSelector from "./components/tabSelector"
import ShitpostGallery from "./components/shitpostGallery"
import Banners from "./components/banners"
import Header from "./components/header";

const montserratUnderline = Montserrat_Underline({
  subsets: ['latin'],
})

async function App() {
 console.log('OTORING_SLUG:', process.env.OTORING_SLUG)

 const _otoringFetch = await fetch(`https://webring.otomir23.me/${process.env.OTORING_SLUG}/data`, {
  next: { revalidate: 3600*6 },
 })
 console.log('fetch status:', _otoringFetch?.status)
 let otoringFetch = null
 try {
  otoringFetch = _otoringFetch ? await _otoringFetch.json() : null
 } catch { }

 const _lastupdateFetch = await fetch(`${process.env.API_BASEURL}/last_update`, {
  next: { revalidate: 3600*6 },
 })
 const lastupdateJson = await _lastupdateFetch.json() as { ok: boolean, lastUpdates: { frontend: number, backend: number } }

 const lastUpdateProps = {
   frontend: lastupdateJson.lastUpdates.frontend,
   backend: lastupdateJson.lastUpdates.backend,
 }


 return (
  <body className={montserratUnderline.className}>
   <Header/>
   <div className="flex flex-wrap justify-center items-center gap-10">
    <video src="/videos/spinning.mp4" autoPlay loop className="spinningvideo" />
    <TabSelector lastUpdate={lastUpdateProps}
     senkoReferral={process.env.SENKODIGITAL_REFERRAL!}
     githubRepoUrl={process.env.GITHUB_REPO_URL!}
     apiBaseUrl={process.env.API_BASEURL!}
    />
   </div>

   <Banners apiBaseUrl={process.env.API_BASEURL!} />
   <div className="gap-5 flex opacity-55">
    <a href={otoringFetch?.prev?.url}> {otoringFetch?.prev?.name || '[not found]'} </a>
    <a href="https://webring.otomir23.me/"> otoring </a>
    <a href={otoringFetch?.next?.url}> {otoringFetch?.next?.name || '[not found]'} </a>
   </div>
  </body>
 );
}
export default App;
