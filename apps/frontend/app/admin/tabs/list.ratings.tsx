'use client'

interface Score {
  name: string
  value: number
  max?: number
}

interface RatingItem {
  id: number
  title: string
  scores: Score[]
  banner: string | null
  summary: string | null
  description: string | null
  created_at: string
	updated_at: string
  tags: string[]
}

export default function RatingsList({ items, onNew, onEdit, onRemove }: {
  items: RatingItem[]
  onNew: () => void
  onEdit: (item: RatingItem) => void
  onRemove: (id: number) => void
}) {
  return (
    <>
      <button onClick={onNew}
        className="text-sm self-start opacity-60 hover:opacity-100">
        + new rating
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className="flex flex-col gap-2">
            {item.banner && <img src={item.banner} className="w-full h-24 object-cover" />}
            <p className="font-bold">{item.title}</p>
            {item.summary && <p className="text-xs opacity-60">{item.summary}</p>}
            <p className="text-xs opacity-40">{item.scores.length} score(s)</p>
            <div className="flex gap-2 mt-1">
              <button onClick={() => onEdit(item)}
                className="text-xs">edit</button>
              <button onClick={() => onRemove(item.id)}
                className="text-xs opacity-40 hover:opacity-100">delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
