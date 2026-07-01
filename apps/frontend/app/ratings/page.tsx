import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface RatingItem {
  id: number
  title: string
  banner: string | null
}

export default async function Page() {
	var data
	var res
	try {
		res = await fetch(`${process.env.API_BASEURL}/ratings`)
		data = await res.json() as { items: RatingItem[] }
	}
	catch {}

	return (
		<div className="flex flex-col items-center">
			<p className="mt-30 mb-5 text-4xl">ratings!</p>
			<p className="mb-10 text-lg content-center">things that.. i have opinion about</p>

			{!res && <p>API is died. Try again later on contact me, my contacts is on main page.</p>}
			{data && <>
				{data.items.length <= 0 ? <p>That's pretty strange, either i've nothing rated yet, or the API is dead...</p> :
					<div className="grid grid-cols-2 gap-6 px-4">
					{data.items.map((item) => (
						<Link
							key={item.id}
							href={`/ratings/${item.id}`}
							className="block overflow-hidden min-w-96"
						>
							{item.banner && (
								<img
								src={item.banner}
								alt={item.title}
								className="w-full h-52 object-cover"
								/>
							)}
							<div className="p-4">
								<h2 className="text-xl">{item.title}</h2>
							</div>
						</Link>
					))}
					</div>}
			</>}
		</div>
	)
}
