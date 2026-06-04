import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
})

type Props = {
 lastUpdate: { backend: number, frontend: number },
 senkoReferral: string,
 githubRepoUrl: string
}
function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function AboutSite({ lastUpdate, senkoReferral, githubRepoUrl }: Props) {
  return (
    <div>
      <h1>about this site</h1>
      <div className={`description ${montserrat.className}`}>
        <p>this website written using next.js and react</p>
        <p>i have a LOT of ideas for this website, but i have a paws yk(itll be veryverysoon!)</p>
        <p>and holy god, its fully automatized with github actions, watchtower and docker with custom packages</p>
        <p>this is my first project with THAT automatization. i feel so proud of it</p>
        <a className="my-1.5" href={githubRepoUrl}>gh repo</a>
        <p>last frontend update: {formatDate(lastUpdate.frontend)}</p>
        <p>last backend update: {formatDate(lastUpdate.backend)}</p>
        <p className="mt-1.5">powerdby <a href={senkoReferral} className="lmaowhat">senko.digital</a></p>
      </div>
    </div>
  )
}
