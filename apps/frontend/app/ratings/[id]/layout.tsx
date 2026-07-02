// app/ratings/[id]/layout.tsx
import type { Metadata } from 'next'
import { getRating } from '../funcs'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const ratings = await getRating(params.id)

  if (ratings.items.length <= 0) {
    return { title: 'Not found' }
	}
  const rating = ratings.items[0]

  const title = rating.title
  const description = rating.summary ?? 'rating'
  const images = rating.banner ? [rating.banner] : []

  return {
    title,
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
