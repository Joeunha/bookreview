'use client'

import Image from 'next/image'
import { ArrowLeft, BookOpen, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { StarRating } from './star-rating'
import { StatusBadge } from './status-badge'
import type { Book } from '@/lib/types'

interface BookDetailPanelProps {
  book: Book
  onEdit: (book: Book) => void
  onDelete: (id: string) => void
  onBack: () => void
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function BookDetailPanel({ book, onEdit, onDelete, onBack }: BookDetailPanelProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-sm px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          <span>목록으로</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(book)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Pencil size={14} />
            수정
          </button>
          <button
            onClick={() => {
              if (confirm(`"${book.title}" 을 삭제하시겠습니까?`)) {
                onDelete(book.id)
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-card px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-7">
          {/* Cover */}
          <div className="shrink-0">
            <div className="relative mx-auto w-36 sm:w-44 aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-md">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={`${book.title} 표지`}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="size-12 text-muted-foreground/40" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={book.status} />
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-foreground leading-snug text-balance">
              {book.title}
            </h1>
            <p className="text-base text-muted-foreground">{book.author}</p>
            <StarRating value={book.rating} readonly size="lg" />

            {/* Dates */}
            {(book.started_at || book.finished_at) && (
              <div className="flex flex-col gap-1.5 mt-1">
                {book.started_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays size={14} className="shrink-0" />
                    <span>시작: {formatDate(book.started_at)}</span>
                  </div>
                )}
                {book.finished_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays size={14} className="shrink-0" />
                    <span>완독: {formatDate(book.finished_at)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Memo */}
        {book.memo && (
          <section className="mt-8">
            <h2 className="font-serif font-semibold text-base text-foreground mb-3 flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 bg-[--color-moss] rounded-full" />
              나의 메모
            </h2>
            <div className="rounded-xl border border-border bg-[--color-paper] px-5 py-4">
              <p className="text-sm leading-relaxed text-[--color-paper-foreground] whitespace-pre-wrap">
                {book.memo}
              </p>
            </div>
          </section>
        )}

        {/* Added date */}
        <p className="mt-6 text-xs text-muted-foreground text-right">
          기록일: {formatDate(book.created_at.slice(0, 10))}
        </p>
      </main>
    </div>
  )
}
