export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getRating } from '../funcs'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata | null> {
	const { id } = await params
	if (!process.env.API_BASEURL) return null
	const ratings = await getRating(process.env.API_BASEURL, id)

  if (!ratings.item) {
    return { title: 'Not found' }
	}
  const rating = ratings.item

  const title = rating.title
  const description = rating.summary ?? 'rating'
  const images = rating.banner ? [rating.banner] : []

  return {
    title: "oki: " + rating.title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  }
}

export default function RatingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
