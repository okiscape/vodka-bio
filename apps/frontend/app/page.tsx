import "./globals.css";
import { Montserrat_Underline } from 'next/font/google'
import TabSelector from "./components/tabSelector"
import Banners from "./components/banners"
import Header from "./components/header";
import ShoutBox from "./components/shoutBox";
import Features from "./components/featuresDisplay"
import { UmamiScript } from "./components/umamiScript";
import Yabloko from "./components/yabloko";
import Otoring from "./components/otoring";

const montserratUnderline = Montserrat_Underline({
  subsets: ['latin'],
})

export const dynamic = 'force-dynamic'

async function App() {
 const _lastupdateFetch = await fetch(`${process.env.API_BASEURL}/last_update`, {
  next: { revalidate: 3600*6 },
 })
 const lastupdateJson = await _lastupdateFetch.json() as { ok: boolean, lastUpdates: { frontend: number, backend: number } }

 const lastUpdateProps = {
   frontend: lastupdateJson.lastUpdates.frontend,
   backend: lastupdateJson.lastUpdates.backend,
 }

 const apiBaseUrl = process.env.API_BASEURL ?? ""

 return (
  <body className={montserratUnderline.className}>
   <Header/>
   <div className="flex flex-col items-center mb-10">
    <div className="flex flex-wrap justify-center items-center gap-10">
      <video src="/videos/spinning.mp4" autoPlay loop className="spinningvideo" />
      <TabSelector lastUpdate={lastUpdateProps}
      senkoReferral={process.env.SENKODIGITAL_REFERRAL ?? ""}
      githubRepoUrl={process.env.GITHUB_REPO_URL ?? ""}
      apiBaseUrl={apiBaseUrl}
      />
    </div>
    <Otoring/>
   </div>

   <Yabloko/>

   <Features apiBaseUrl={apiBaseUrl} />

   <ShoutBox apiBaseUrl={apiBaseUrl} />

   <Banners apiBaseUrl={apiBaseUrl} />

   <UmamiScript domain={process.env.DOMAIN ?? ''} website_id={process.env.UMAMI_WEBSITE_ID ?? ''} />
  </body>
 );
}
export default App;
