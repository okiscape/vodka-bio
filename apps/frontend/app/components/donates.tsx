'use client'

import { useEffect, useMemo, useState } from "react"
import qrcode from "qrcode-generator"
import "./donates.css"

type Props = {
    apiBaseUrl: string
}

type DonateMethod = {
  id: number
  group_name: string
  method_name: string
  content: string
  qrtip: string
  description: string
}

type MethodGroup = {
  name: string
  description: string
  methods: DonateMethod[]
}

type SelectedMethod = {
  key: string
  name: string
  content: string
}

const REVEAL_STEP_MS = 14

function buildMatrix(text: string): boolean[][] | null {
  if (!text) return null
  try {
    const qr = qrcode(0, "M")
    qr.addData(text)
    qr.make()
    const count = qr.getModuleCount()
    return Array.from({ length: count }, (_, row) =>
      Array.from({ length: count }, (_, col) => qr.isDark(row, col))
    )
  } catch {
    return null
  }
}

function QrCode({ matrix, animate = false }: { matrix: boolean[][]; animate?: boolean }) {
  const size = matrix.length
  return (
    <svg
      className={`qr-code${animate ? " animated" : ""}`}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {matrix.map((row, y) =>
        row.map((dark, x) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            className={dark ? "cell color1" : "cell color2"}
            style={animate ? { animationDelay: `${x * REVEAL_STEP_MS}ms` } : undefined}
          />
        ))
      )}
    </svg>
  )
}

export default function Donates({ apiBaseUrl }: Props) {
  const [methods, setMethods] = useState<DonateMethod[]>([])
  const [selected, setSelected] = useState<SelectedMethod | null>(null)
  const [previous, setPrevious] = useState<SelectedMethod | null>(null)

  useEffect(() => {
    fetch(`${apiBaseUrl}/donates`)
      .then(r => r.json())
      .then(d => { if (d.ok) setMethods(d.items) })
      .catch(() => {})
  }, [apiBaseUrl])

  const groups = useMemo<MethodGroup[]>(() => {
    const result: MethodGroup[] = []
    const byName = new Map<string, MethodGroup>()
    for (const method of methods) {
      let group = byName.get(method.group_name)
      if (!group) {
        group = { name: method.group_name, description: method.description, methods: [] }
        byName.set(method.group_name, group)
        result.push(group)
      }
      if (!group.methods.some((m) => m.id === method.id)) {
        group.methods.push(method)
      }
      if (method.description && !group.description) {
        group.description = method.description
      }
    }
    return result
  }, [methods])

  const currentMatrix = useMemo(
    () => (selected ? buildMatrix(selected.content) : null),
    [selected]
  )
  const previousMatrix = useMemo(
    () => (previous ? buildMatrix(previous.content) : null),
    [previous]
  )

  function selectMethod(group: MethodGroup, method: DonateMethod) {
    const key = `${group.name}:${method.method_name}`
    if (selected?.key === key) return
    setPrevious(selected)
    setSelected({ key, name: method.method_name, content: method.content })
  }

  return (
    <div className="donates">
      <div className="header">
        <h1>donates!</h1>
        <p>here you can see methods, how can you send me moni</p>
      </div>
      <div className="methods-container">
        <div className="groups">
          {groups.map((group) => (
            <div className="group" key={group.name}>
              <p className="title">{group.name}</p>
              <p className="description">{group.description}</p>
              <div className="methods">
                {group.methods.map((method) => {
                  const key = `${group.name}:${method.method_name}`
                  const isSelected = selected?.key === key
                  return (
                    <button
                      type="button"
                      className={`method${isSelected ? " selected" : ""}`}
                      key={key}
                      aria-pressed={isSelected}
                      onClick={() => selectMethod(group, method)}
                    >
                      <p className="title">{method.method_name}</p>
                      <p className="content-preview">{method.content}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <aside className="qr-panel">
          <div className="stage">
            {!previous && (
              <div className="placeholder" aria-hidden="true">
                <span className="finder top-left" />
                <span className="finder top-right" />
                <span className="finder bottom-left" />
              </div>
            )}
            {selected && (
              <>
                {previousMatrix && <QrCode matrix={previousMatrix} />}
                {currentMatrix && (
                  <QrCode key={selected.key} matrix={currentMatrix} animate />
                )}
              </>
            )}
          </div>
          <p className={`caption${selected ? " active" : ""}`}>
            {selected ? `${selected.name}: ${selected.content}` : "select a method"}
          </p>
        </aside>
      </div>
    </div>
  )
}
