'use client'

import { useEffect, useState } from "react"
import "./featuresDisplay.css"

type Props = {
    apiBaseUrl: string
}

interface Project {
    title: string
    description: string
    url: string
}

export default function FeaturesDisplay({apiBaseUrl}: Props) {
    const [projects, setProjects] = useState<Project[]>([])
    const [contactUrl, setContactUrl] = useState<string>('')
    const [loading, setLoading] = useState(true)

    async function fetchProjects() {
      try {
        setLoading(true)
        const [projectsRes, infoRes] = await Promise.all([
          fetch(`${apiBaseUrl}/projects`),
          fetch(`${apiBaseUrl}/info`),
        ])
        const projectsJson = await projectsRes.json()
        const infoJson = await infoRes.json()
        if (projectsJson.ok) {
          setProjects(projectsJson.items)
        }
        if (infoJson.ok) {
          setContactUrl(infoJson.item?.about?.contactUrl || '')
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    useEffect(() => {
        fetchProjects();
    }, [])

    return (
        <div className="featdisplay">
            <div className="item">
                <video src="/videos/anvil.mp4" autoPlay loop
                    className="preview" />
                <div className="content">
                    <h1>My projects</h1>
                    <p>i also like to host something</p>
                    <div className="buttons">
                        {loading && <p>trying to load projects...</p>}
                        {!loading && projects.map(
                            (project) =>
                                <a href={project.url} key={projects.indexOf(project)}>
                                    <div className="meta">
                                        <p>{project.title}</p>
                                        <p className="description">{project.description}</p>
                                    </div>
                                </a>
                        )}
                    </div>
                    {contactUrl && <p>you want me to work with you? <a href={contactUrl}><u>please, contact me!</u></a></p>}
                </div>
            </div>
        </div>
    )
}
