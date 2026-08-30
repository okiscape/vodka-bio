const roots = [
 {name: "main", href: "/"},
 {name: "gallery", href: "/gallery"},
 {name: "ratings", href: "/ratings"},
 {name: "services", href: "/services"},
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
