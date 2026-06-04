import { Montserrat } from 'next/font/google'
import ScrobbleLiveActivity from "../liveActivity"

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
})

const myLinks = [
 { href: "https://github.com/okiscape", name: "github" },
 { href: "https://wakatime.com/@okiscape", name: "wakatime"},
 { href: "https://namemc.com/okiscape", name: "namemc"},
 { href: "https://last.fm/user/okiscape", name: "lastfm"},
 { href: "https://t.me/frtblessed", name: "telegramwork"},
]

type Props = {
 apiBaseUrl: string
}

export default function AboutMe({ apiBaseUrl }: Props) {

  return (
    <div>
      <h1>hello! im okiscape<span className="aka">(also neverett)</span></h1>
      <div className={`description ${montserrat.className}`}>
       <p>im self-taught fullstack developer from moscow</p>
       <p>boobs</p>
       <p>i oftenly feel like "main character" in "my" society, yk</p>
       <p>i'd love to help anyone with tech, if i know something and can help with anything</p>
       <p>i love oguricap and umamusume memes</p>
      </div>
      <div className="mylinks">
       {myLinks.map((link) => (
        <a href={link.href} key={link.name}>
         {link.name}
        </a>
       ))}
    </div>
    <ScrobbleLiveActivity apiBaseUrl={apiBaseUrl} />
    </div>
  )
}
