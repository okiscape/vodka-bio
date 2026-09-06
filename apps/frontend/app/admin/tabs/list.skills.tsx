'use client'

interface SkillItem {
  id: number
  name: string
  description: string
  color: string
  created_at: string
  updated_at: string
}

export default function SkillsList({ items, onNew, onEdit, onRemove }: {
  items: SkillItem[]
  onNew: () => void
  onEdit: (item: SkillItem) => void
  onRemove: (id: number) => void
}) {
  return (
    <>
      <button onClick={onNew}
        className="text-sm self-start opacity-60 hover:opacity-100">
        + new skill
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: item.color }} />
              <p className="font-bold">{item.name}</p>
            </div>
            {item.description && <p className="text-xs opacity-60 line-clamp-2">{item.description}</p>}
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