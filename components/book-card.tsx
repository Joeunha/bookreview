'use client'

import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StarRating } from './star-rating'
import { StatusBadge } from './status-badge'
import type { Book } from '@/lib/types'

interface BookCardProps {
  book: Book
  onClick: (book: Book) => void
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <article
      onClick={() => onClick(book)}
      className={cn(
        'group relative flex flex-col rounded-xl bg-card border border-border overflow-hidden',
        'cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-[--color-moss]/30'
      )}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={`${book.title} 표지`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="size-12 text-muted-foreground/40" />
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={book.status} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3 pt-2.5">
        <h3 className="font-serif font-semibold text-foreground leading-snug line-clamp-2 text-sm">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground">{book.author}</p>
        <StarRating value={book.rating} readonly size="sm" className="mt-0.5" />
      </div>
    </article>
  )
}
