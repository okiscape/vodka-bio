
export interface Score {
  name: string
  value: number
  max?: number
}

export interface RatingItem {
  id: number
  title: string
  scores: Score[]
  banner: string | null
	summary: string | null
  description?: string
  created_at: string
	updated_at: string
  tags?: string[]
}
