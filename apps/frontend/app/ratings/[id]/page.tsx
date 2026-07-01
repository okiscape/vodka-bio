import Link from 'next/link'
import { redirect } from 'next/navigation'

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
	description: string | null
	created_at: string
	updated_at: string
}

function fmtDate(iso: string) {
	const d = new Date(iso)
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isRecent(iso: string) {
	const d = new Date(iso)
	const now = new Date()
	return (now.getTime() - d.getTime()) < 3 * 24 * 60 * 60 * 1000
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const res = await fetch(`${process.env.API_BASEURL}/ratings/${id}`)
	if (!res.ok) return redirect("/404")
	const data = await res.json() as { item: RatingItem }
	const item = data.item

	return (
	<div className="flex flex-col items-center">
		<Link href="/ratings" className="self-start mt-8 mb-4 ml-4 text-sm opacity-60 hover:opacity-100 transition-opacity">
		&lt;- back to ratings
		</Link>
		<article className="w-full px-4 pb-20 flex gap-12">
			<div className='w-96'>
				{item.banner && (
					<img
						src={item.banner}
						alt={item.title}
						className="w-xl h-64 object-cover mb-6"
					/>
				)}
				<div className="flex items-center gap-3 mb-4">
					<p className="text-5xl ">{item.title}</p>
					{isRecent(item.updated_at) && (
						<span className="text-xs shadow-yellow-300 text-yellow-400 mt-2">recently updated</span>
					)}
				</div>
				<div className="flex gap-4 text-xs opacity-40 mb-4">
					<p>created {fmtDate(item.created_at)}</p>
					<p>updated {fmtDate(item.updated_at)}</p>
				</div>
				{item.summary && <p className="text-sm opacity-70 mb-4 italic">{item.summary}</p>}
				{item.scores.length > 0 && (
					<div className="flex flex-wrap gap-5 mb-6">
						{item.scores.map((s, i) => (
							<div key={i}>
								<span className="text-sm opacity-60">{s.name}</span>
								<div className="text-xl">
									{s.value}
									{s.max &&
										<span className="text-sm opacity-40 font-normal">
											<span className='ml-2'>/</span>{s.max}
										</span>}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
			{item.description && (
				<div
					className="prose prose-invert max-w-none w-2xl"
					dangerouslySetInnerHTML={{ __html: item.description }}
				/>
			)}
		</article>
	</div>
	)
}
