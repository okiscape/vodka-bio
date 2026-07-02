import RatingsList from './ratings-list'

export const dynamic = 'force-dynamic'

export default function Page() {
  return <RatingsList apiBaseUrl={process.env.API_BASEURL ?? ''} />
}
