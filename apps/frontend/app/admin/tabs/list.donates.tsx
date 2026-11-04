'use client'

interface DonateMethodItem {
  id: number
  group_name: string
  method_name: string
  content: string
  qrtip: string
  description: string
  created_at: string
  updated_at: string
}

export default function DonatesList({ items, onNew, onEdit, onRemove }: {
  items: DonateMethodItem[]
  onNew: () => void
  onEdit: (item: DonateMethodItem) => void
  onRemove: (id: number) => void
}) {
  return (
    <>
      <button onClick={onNew}
        className="text-sm self-start opacity-60 hover:opacity-100">
        + new method
      </button>
      <div className="admin-grid-list">
        {items.map(item => (
          <div key={item.id} className="flex flex-col gap-2">
            <p className="font-bold">{item.group_name}.{item.method_name}</p>
            {item.content && <p className="text-xs opacity-60 line-clamp-2">{item.content}</p>}
            {item.description && <p className="text-xs opacity-40">{item.description}</p>}
            <div className="flex gap-2 mt-1">
              <button onClick={() => onEdit(item)}
                className="text-xs">edit</button>
              <button onClick={() => onRemove(item.id)}
                className="text-xs">delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
