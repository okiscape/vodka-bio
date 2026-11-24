import "./globals.css";
import "./page.css";
import { Montserrat_Underline } from 'next/font/google'
import TabSelector from "./components/tabSelector"
import Banners from "./components/banners"
import Header from "./components/header";
import ShoutBox from "./components/shoutBox";
import Features from "./components/featuresDisplay"
import { UmamiScript } from "./components/umamiScript";
import Otoring from "./components/otoring";
import Donates from "./components/donates";
import { redirect } from "next/navigation";

const montserratUnderline = Montserrat_Underline({
  subsets: ['latin'],
})

export const dynamic = 'force-dynamic'

async function App() {
  let lastupdateJson: { ok: boolean, lastUpdates: { frontend: number, backend: number } } | null = null
  try {
    const _lastupdateFetch = await fetch(`${process.env.API_BASEURL}/last_update`, {
      cache: "no-store",
    })
    lastupdateJson = await _lastupdateFetch.json() as { ok: boolean, lastUpdates: { frontend: number, backend: number } }
  } catch {
    return redirect("/unavailable")
  }
  const lastUpdateProps = {
    frontend: lastupdateJson?.lastUpdates?.frontend ?? 0,
    backend: lastupdateJson?.lastUpdates?.backend ?? 0,
  }

 const apiBaseUrl = process.env.API_BASEURL ?? ""

 return (
  <body className={montserratUnderline.className}>
   <Header/>
   <div className="hero">
    <div className="content">
     <video src="/videos/spinning.mkv" autoPlay loop className="spinningvideo" />
     <TabSelector lastUpdate={lastUpdateProps}
      senkoReferral={process.env.SENKODIGITAL_REFERRAL ?? ""}
      githubRepoUrl={process.env.GITHUB_REPO_URL ?? ""}
      apiBaseUrl={apiBaseUrl}
     />
    </div>
    <Otoring/>
   </div>

   <Features apiBaseUrl={apiBaseUrl} />

   <Donates apiBaseUrl={apiBaseUrl} />

   <ShoutBox apiBaseUrl={apiBaseUrl} />

   <Banners apiBaseUrl={apiBaseUrl} />

   <UmamiScript domain={process.env.DOMAIN ?? ''} website_id={process.env.UMAMI_WEBSITE_ID ?? ''} />
  </body>
 );
}
export default App;
