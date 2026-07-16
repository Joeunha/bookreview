export type BookStatus = 'reading' | 'completed' | 'want_to_read'

export interface Book {
  id: string
  user_id?: string
  title: string
  author: string
  cover_url: string | null
  rating: number | null // 1~5
  status: BookStatus
  started_at: string | null // ISO date string
  finished_at: string | null // ISO date string
  memo: string | null
  created_at: string // ISO timestamp
}

export const STATUS_LABELS: Record<BookStatus, string> = {
  reading: '읽는 중',
  completed: '완독',
  want_to_read: '읽고 싶음',
}

export const STATUS_COLORS: Record<BookStatus, string> = {
  reading: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
  want_to_read: 'bg-amber-100 text-amber-700',
}
