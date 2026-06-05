'use client'

import { useState } from 'react'
import AboutMe from './tabs/AboutMe'
import AboutSite from './tabs/AboutSite'

type Props = {
 lastUpdate: { backend: number, frontend: number }
 senkoReferral: string, githubRepoUrl: string
 apiBaseUrl: string
}

export default function TabSelector({ lastUpdate, senkoReferral, githubRepoUrl, apiBaseUrl }: Props) {
  const [active, setActive] = useState('me')

  const tabs = [
   { id: 'me', label: 'me', component: <AboutMe apiBaseUrl={apiBaseUrl} /> },
   {
    id: 'site', label: 'website', component: <AboutSite lastUpdate={lastUpdate} senkoReferral={senkoReferral}
     githubRepoUrl={githubRepoUrl} />
   },
  ]

return (
  <div className="textcontainer">
    <div className="contentselector">
      <p className='opacity-70'>about: </p>
      {tabs.map((tab) => (
        <p
          key={tab.id}
          onClick={() => setActive(tab.id)}
          style={{ cursor: 'pointer', opacity: active === tab.id ? 1 : 0.5 }}
        >
          {tab.label}
        </p>
      ))}
    </div>
    {tabs.map((tab) => (
      <div key={tab.id} style={{ display: active === tab.id ? 'contents' : 'none' }}>
        {tab.component}
      </div>
    ))}
  </div>
)}
