import { Metadata } from "next"
import "../globals.css"
import "./services.css"
import SkillsDisplay from "./skillsDisplay"

export const metadata: Metadata = {
  title: 'okiscape: services',
}

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const apiBase = process.env.API_BASEURL ?? ''
  let contactUrl = ''
  try {
    const res = await fetch(`${apiBase}/api/info`, { next: { revalidate: 3600*6 } })
    const data = await res.json()
    contactUrl = data.item?.about?.contactUrl ?? ''
  } catch {}

  return (
    <div className="services">
      <div className="description">
        <video src="/videos/services.mp4" autoPlay loop className="laptopvideo"/>
        <div className="content">
          <div>
            <h1>i can create and support many of things</h1>
            <p>from desktop and cli apps to telegram bots and websites, let me tell you!</p>
          </div>
          <a href={contactUrl} className="contact">
            i want to work with you!
          </a>
        </div>
      </div>
      <div className="quickdate">
        <h1>i've worked with</h1>
        <SkillsDisplay apiBaseUrl={process.env.API_BASEURL ?? ''} />
      </div>
    </div>
  )
}
