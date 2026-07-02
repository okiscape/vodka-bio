import AdminPanel from "./admin-panel"

import "./admin.css"

export default function Page() {
	if (!process.env.API_BASEURL) return (
		<p>envs again, contact me</p>
	)
  return (
    <AdminPanel apiBaseUrl={process.env.API_BASEURL} />
  )
}
