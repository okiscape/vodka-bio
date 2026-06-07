const roots = [
 {name: "main", href: "/"},
 {name: "gallery", href: "/gallery"},
 {name: "admin", href: "/admin"},
]

export default function Header() {
 return (
  <div className="flex gap-5 header-container">
   {roots.map((root) => (
    <a key={roots.indexOf(root)} href={root.href}>
     {root.name}
    </a>
   ))}
  </div>
 )
}
