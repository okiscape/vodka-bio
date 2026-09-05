import { Metadata } from "next"
import "../globals.css"
import "./services.css"

export const metadata: Metadata = {
  title: 'okiscape: services',
}

export default function ServicesPage() {
  return (
    <div className="services">
      <div className="description">
        <video src="/videos/services.mp4" autoPlay loop className="laptopvideo"/>
        <div className="text">
          <h1>i can create and support many of things</h1>
        </div>
      </div>
    </div>
  )
}
