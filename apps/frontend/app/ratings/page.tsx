import type { Metadata } from 'next'
import RatingsList from './ratings-list'
import "./list.css"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'okiscape: ratings',
}

export default function Page() {
  return <RatingsList apiBaseUrl={process.env.API_BASEURL ?? ''} />
}