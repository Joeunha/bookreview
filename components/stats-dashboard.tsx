import { Book } from '@/lib/types'
import { BookOpen, Star, Calendar, Library } from 'lucide-react'

interface StatsDashboardProps {
  books: Book[]
}

export function StatsDashboard({ books }: StatsDashboardProps) {
  const total = books.length
  const completed = books.filter(b => b.status === 'completed').length
  
  const currentYear = new Date().getFullYear()
  const readThisYear = books.filter(b => {
    if (b.status !== 'completed' || !b.finished_at) return false
    return new Date(b.finished_at).getFullYear() === currentYear
  }).length

  const ratedBooks = books.filter(b => b.rating !== null)
  const avgRating = ratedBooks.length > 0 
    ? (ratedBooks.reduce((acc, b) => acc + (b.rating || 0), 0) / ratedBooks.length).toFixed(1)
    : '0.0'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Library size={16} />
          <span className="text-xs font-medium">전체 도서</span>
        </div>
        <div className="text-2xl font-bold font-serif text-foreground">{total}<span className="text-sm font-normal text-muted-foreground ml-1">권</span></div>
      </div>
      
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen size={16} />
          <span className="text-xs font-medium">완독</span>
        </div>
        <div className="text-2xl font-bold font-serif text-[--color-moss]">{completed}<span className="text-sm font-normal text-muted-foreground ml-1">권</span></div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar size={16} />
          <span className="text-xs font-medium">{currentYear}년 완독</span>
        </div>
        <div className="text-2xl font-bold font-serif text-foreground">{readThisYear}<span className="text-sm font-normal text-muted-foreground ml-1">권</span></div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Star size={16} />
          <span className="text-xs font-medium">평균 별점</span>
        </div>
        <div className="text-2xl font-bold font-serif text-amber-500">{avgRating}<span className="text-sm font-normal text-muted-foreground ml-1">점</span></div>
      </div>
    </div>
  )
}
