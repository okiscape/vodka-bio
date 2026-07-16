'use client'
import { useEffect } from 'react'

type Props = { domain: string, website_id: string }

export function UmamiScript({domain, website_id}: Props) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://umami.${domain}/metrics.js`
    script.setAttribute('data-website-id', website_id)
    script.defer = true
      document.body.appendChild(script)

    const scriptRecorder = document.createElement('script')
    script.src = `https://umami.${domain}/recorder.js`
    script.setAttribute('data-website-id', website_id)
    script.defer = true
    document.body.appendChild(script)
  }, [])

  return null
}
