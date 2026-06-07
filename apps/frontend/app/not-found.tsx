import { Montserrat } from "next/font/google";
import Header from "./components/header";
import "./globals.css"

const monterrat = Montserrat({
  subsets: ['latin'],
})

export default function App() {
 return (
  <body>
   <Header/>
   <div className="flex gap-15 items-center not-found-container">
    <div className="flex flex-col items-center">
     <h1>not found???</h1>
     <a href="/" className={monterrat.className}>&lt;- return to main page</a>
    </div>
    <video src="/videos/404.1.mp4"  className="w-60" autoPlay loop/>
   </div>
  </body>)
}
