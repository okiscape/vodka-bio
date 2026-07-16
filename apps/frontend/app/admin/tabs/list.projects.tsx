'use client'

interface ProjectItem {
  id: number
  title: string
  description: string
  url: string | null
  created_at: string
  updated_at: string
}

export default function ProjectsList({ items, onNew, onEdit, onRemove }: {
  items: ProjectItem[]
  onNew: () => void
  onEdit: (item: ProjectItem) => void
  onRemove: (id: number) => void
}) {
  return (
    <>
      <button onClick={onNew}
        className="text-sm self-start opacity-60 hover:opacity-100">
        + new project
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className="flex flex-col gap-2">
            <p className="font-bold">{item.title}</p>
            {item.description && <p className="text-xs opacity-60 line-clamp-2">{item.description}</p>}
            {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs opacity-40 hover:opacity-100 truncate">{item.url}</a>}
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
