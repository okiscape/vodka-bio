export const dynamic = 'force-dynamic'

import AdminPanel from "./admin-panel"

import "./admin.css"

export default function Page() {
  return (
    <AdminPanel apiBaseUrl={process.env.API_BASEURL} />
  )
}
