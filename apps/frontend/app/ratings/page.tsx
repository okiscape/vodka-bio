import RatingsList from './ratings-list'

export default function Page() {
  return <RatingsList apiBaseUrl={process.env.API_BASEURL ?? ''} />
}
