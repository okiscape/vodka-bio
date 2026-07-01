import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Score {
	name: string
	value: number
	max: number
}

interface RatingItem {
	id: number
	title: string
	scores: Score[]
	banner: string | null
	summary: string | null
	created_at: string
	updated_at: string
}

function fmtDate(iso: string) {
	const d = new Date(iso)
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isRecent(iso: string) {
	const d = new Date(iso)
	const now = new Date()
	return (now.getTime() - d.getTime()) < 3 * 24 * 60 * 60 * 1000
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
						{data.items.reverse().map((item) => (
							<Link
								key={item.id}
								href={`/ratings/${item.id}`}
								className="block overflow-hidden min-w-96 max-w-96"
							>
							{item.banner && (
								<img
									src={item.banner}
									alt={item.title}
									className="w-full h-52 object-cover"
								/>
							)}
							<div className="p-4">
								<div className="flex items-center gap-3 mb-1">
									<h2 className="text-xl">{item.title}</h2>
									{isRecent(item.updated_at) && (
										<span className="text-xs text-yellow-400 px-2 py-0.5">recently updated</span>
									)}
								</div>
								{item.summary && <p className="text-sm opacity-60 mb-2">{item.summary}</p>}
								<div className='w-1/1 justify-between flex opacity-50 text-xs'>
									<p>Avr. rating: {(item.scores.map((val, _, __) => (val.value))
										.reduce((partialSum, a) => partialSum + a, 0) / item.scores.length).toFixed(1)} </p>
									<p>{fmtDate(item.created_at)}</p>
								</div>
							</div>
						</Link>
					))}
					</div>}
			</>}
		</div>
	)
}
