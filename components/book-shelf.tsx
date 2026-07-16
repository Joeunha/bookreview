'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, BookOpen, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BookCard } from './book-card'
import { BookFormModal } from './book-form-modal'
import { BookDetailPanel } from './book-detail-panel'
import { StatsDashboard } from './stats-dashboard'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, type Book, type BookStatus } from '@/lib/types'
import {
  createBook,
  updateBook,
  deleteBook,
} from '@/lib/books'

const ALL_FILTER = 'all' as const
type Filter = typeof ALL_FILTER | BookStatus

const FILTER_TABS: { value: Filter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'reading', label: STATUS_LABELS.reading },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'want_to_read', label: STATUS_LABELS.want_to_read },
]

interface BookShelfProps {
  initialBooks: Book[]
  userEmail?: string
}

export function BookShelf({ initialBooks, userEmail }: BookShelfProps) {
  const router = useRouter()
  const supabase = createClient()
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [detailBook, setDetailBook] = useState<Book | null>(null)

  // ── Filtered + searched books ───────────────────────────────────────────────
  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase()
    return books.filter((b) => {
      const matchesFilter = filter === 'all' || b.status === filter
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [books, filter, query])

  // ── Handlers ────────────────────────────────────────────────────────────────
  function openAdd() {
    setEditingBook(null)
    setFormOpen(true)
  }

  function openEdit(book: Book) {
    setEditingBook(book)
    setFormOpen(true)
  }

  async function handleSave(data: Omit<Book, 'id' | 'created_at' | 'user_id'>) {
    try {
      if (editingBook) {
        const updated = await updateBook(editingBook.id, data)
        if (updated) {
          setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
          if (detailBook?.id === updated.id) setDetailBook(updated)
        }
      } else {
        const created = await createBook(data)
        setBooks((prev) => [created, ...prev])
      }
      setFormOpen(false)
      setEditingBook(null)
    } catch (e) {
      console.error(e)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  async function handleDelete(id: string) {
    const ok = await deleteBook(id)
    if (ok) {
      setBooks((prev) => prev.filter((b) => b.id !== id))
      setDetailBook(null)
    } else {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.refresh()
  }

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (detailBook) {
    const live = books.find((b) => b.id === detailBook.id) ?? detailBook
    return (
      <>
        <BookDetailPanel
          book={live}
          onEdit={(b) => { openEdit(b); }}
          onDelete={handleDelete}
          onBack={() => setDetailBook(null)}
        />
        {formOpen && (
          <BookFormModal
            book={editingBook}
            onSave={handleSave}
            onClose={() => { setFormOpen(false); setEditingBook(null) }}
          />
        )}
      </>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* ── Header ── */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="size-5 text-[--color-moss]" />
              <h1 className="font-serif font-bold text-xl text-foreground tracking-tight">
                나의 독서 노트
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {userEmail && (
                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                  {userEmail}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="로그아웃"
              >
                <LogOut size={18} />
              </button>
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 rounded-lg bg-[--color-moss] px-3.5 py-2 text-sm font-medium text-[--color-moss-foreground] hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">책 추가</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">
          {/* ── Stats Dashboard ── */}
          <StatsDashboard books={books} />

          {/* ── Search + Filter ── */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="제목 또는 저자로 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss]"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                    filter === tab.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filter === 'all' ? `총 ${books.length}권` : `${displayed.length}권`}
              {query && ` · "${query}" 검색 결과`}
            </p>
            <p className="text-xs text-muted-foreground">
              완독{' '}
              <span className="font-semibold text-[--color-moss]">
                {books.filter((b) => b.status === 'completed').length}
              </span>
              권
            </p>
          </div>

          {/* ── Book Grid ── */}
          {displayed.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayed.map((book) => (
                <BookCard key={book.id} book={book} onClick={setDetailBook} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <BookOpen className="size-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {query ? '검색 결과가 없어요.' : '아직 기록된 책이 없어요.'}
              </p>
              {!query && (
                <button
                  onClick={openAdd}
                  className="mt-1 rounded-lg bg-[--color-moss] px-4 py-2 text-sm font-medium text-[--color-moss-foreground] hover:opacity-90 transition-opacity"
                >
                  첫 번째 책 추가하기
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Modal ── */}
      {formOpen && (
        <BookFormModal
          book={editingBook}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditingBook(null) }}
        />
      )}
    </>
  )
}
