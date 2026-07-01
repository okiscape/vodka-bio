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
	description: string | null
	created_at: string
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
			<div className='w-4xs'>
				{item.banner && (
					<img
						src={item.banner}
						alt={item.title}
						className="w-full h-64 object-cover mb-6"
					/>
				)}
				<p className="text-5xl mb-4">{item.title}</p>
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
					className="prose prose-invert max-w-none w-96"
					dangerouslySetInnerHTML={{ __html: item.description }}
				/>
			)}
		</article>
	</div>
	)
}
