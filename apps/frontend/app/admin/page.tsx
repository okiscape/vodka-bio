import type { Metadata } from 'next'
import AdminPanel from "./admin-panel"

import "./admin.css"

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <AdminPanel apiBaseUrl={process.env.API_BASEURL ?? ''} />
  )
}
