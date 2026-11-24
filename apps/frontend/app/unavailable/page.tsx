"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import "./unavailable.css"

export default async function Unavailable() {
  useEffect(() => {
    async function checkPing() {
      const res = await fetch("https://oki.vodka/api/ping")
      const data = await res.json()
      if (data.ok === true) {redirect("/")}
    }
    checkPing()
  }, [])

  return (
  <body>
    <div className="unavailable">
      <h1>oopsie!</h1>
      <div className="description">
        <p>looks like oki.vodka/api is <b>unavailable</b> right now!</p>
        <p>the entire website created to tandem with its api, its necessary!</p>
        <p>try to visit it again later! so sorry!</p>
      </div>
    </div>
  </body>
  )
}
