'use client'

import { useMemo, useState } from "react"
import qrcode from "qrcode-generator"
import "./donates.css"

type Props = {
    apiBaseUrl: string
}

type MethodGroup = {
  name: string
  methods: Method[]
  description: string
}
type Method = {
  name: string
  content: string
  qrtip: string
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
  const methods: MethodGroup[] = [
    {
      name: "crypto",
      description: "my crypto addresses",
      methods: [
        {
          name: "TON",
          content: "dummy",
          qrtip: "scan this code in your crypto wallet app"
        },
        {
          name: "TRC-20",
          content: "dommy",
          qrtip: "scan this code in your crypto wallet app"
        },
        {
          name: "Base",
          content: "dammy",
          qrtip: "scan this code in your crypto wallet app"
        },
      ]
    },
  ]

  const [selected, setSelected] = useState<SelectedMethod | null>(null)
  const [previous, setPrevious] = useState<SelectedMethod | null>(null)

  const currentMatrix = useMemo(
    () => (selected ? buildMatrix(selected.content) : null),
    [selected]
  )
  const previousMatrix = useMemo(
    () => (previous ? buildMatrix(previous.content) : null),
    [previous]
  )

  function selectMethod(group: MethodGroup, method: Method) {
    const key = `${group.name}:${method.name}`
    if (selected?.key === key) return
    setPrevious(selected)
    setSelected({ key, name: method.name, content: method.content })
  }

  return (
    <div className="donates">
      <div className="header">
        <h1>donates!</h1>
        <p>here you can see methods, how can you send me moni</p>
      </div>
      <div className="methods-container">
        <div className="groups">
          {methods.map((methodgroup) => (
            <div className="group" key={methodgroup.name}>
              <p className="title">{methodgroup.name}</p>
              <p className="description">{methodgroup.description}</p>
              <div className="methods">
                {methodgroup.methods.map((method) => {
                  const key = `${methodgroup.name}:${method.name}`
                  const isSelected = selected?.key === key
                  return (
                    <button
                      type="button"
                      className={`method${isSelected ? " selected" : ""}`}
                      key={key}
                      aria-pressed={isSelected}
                      onClick={() => selectMethod(methodgroup, method)}
                    >
                      <p className="title">{method.name}</p>
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
            {selected ? `${selected.content}` : "select a method"}
          </p>
        </aside>
      </div>
    </div>
  )
}
