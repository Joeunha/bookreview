'use client'

import { useEffect, useState } from 'react'
import { X, Upload, Search, Loader2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from './star-rating'
import { STATUS_LABELS, type Book, type BookStatus } from '@/lib/types'

interface BookFormModalProps {
  book?: Book | null
  onSave: (data: Omit<Book, 'id' | 'created_at'>) => void
  onClose: () => void
}

const STATUSES: BookStatus[] = ['want_to_read', 'reading', 'completed']

const emptyForm = {
  title: '',
  author: '',
  cover_url: '',
  rating: null as number | null,
  status: 'want_to_read' as BookStatus,
  started_at: '',
  finished_at: '',
  memo: '',
}

export function BookFormModal({ book, onSave, onClose }: BookFormModalProps) {
  const supabase = createClient()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true)
        try {
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`)
          const data = await res.json()
          setSearchResults(data.items || [])
          setShowDropdown(true)
        } catch (e) {
          console.error(e)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  function handleSelectBook(item: any) {
    const info = item.volumeInfo
    setForm(prev => ({
      ...prev,
      title: info.title || '',
      author: info.authors ? info.authors.join(', ') : '',
      cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:') || prev.cover_url
    }))
    setSearchQuery('')
    setShowDropdown(false)
    setCoverFile(null)
  }

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        cover_url: book.cover_url ?? '',
        rating: book.rating,
        status: book.status,
        started_at: book.started_at ?? '',
        finished_at: book.finished_at ?? '',
        memo: book.memo ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [book])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = '제목을 입력해주세요.'
    if (!form.author.trim()) e.author = '저자를 입력해주세요.'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setUploading(true)
    let finalCoverUrl = form.cover_url

    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, coverFile)

      if (uploadError) {
        alert('이미지 업로드에 실패했습니다.')
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from('book-covers').getPublicUrl(fileName)
      finalCoverUrl = data.publicUrl
    }

    onSave({
      title: form.title.trim(),
      author: form.author.trim(),
      cover_url: finalCoverUrl.trim() || null,
      rating: form.rating,
      status: form.status,
      started_at: form.started_at || null,
      finished_at: form.finished_at || null,
      memo: form.memo.trim() || null,
    })
    setUploading(false)
  }

  function field(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card shadow-xl border border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="font-serif font-semibold text-lg text-foreground">
            {book ? '책 수정' : '책 추가'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
          
          {/* Book Search (Google Books) */}
          {!book && (
            <div className="relative flex flex-col gap-1.5 z-30">
              <label className="text-sm font-medium text-[--color-moss] flex items-center gap-1.5">
                <Search size={14} /> 책 검색으로 자동 입력
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="책 제목을 검색해보세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="w-full rounded-lg border border-[--color-moss]/30 bg-[--color-moss]/5 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss]"
                />
                {isSearching && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              
              {showDropdown && searchResults.length > 0 && (
                <ul className="absolute top-[100%] left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                  {searchResults.map((item) => {
                    const info = item.volumeInfo
                    return (
                      <li
                        key={item.id}
                        onClick={() => handleSelectBook(item)}
                        className="flex cursor-pointer items-center gap-3 border-b border-border p-3 last:border-0 hover:bg-muted"
                      >
                        {info.imageLinks?.smallThumbnail ? (
                          <img src={info.imageLinks.smallThumbnail.replace('http:', 'https:')} alt="cover" className="h-10 w-7 object-cover rounded-sm shadow-sm" />
                        ) : (
                          <div className="h-10 w-7 bg-muted rounded-sm flex items-center justify-center shrink-0">
                            <BookOpen size={12} className="text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-medium text-foreground">{info.title}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {info.authors?.join(', ') || '저자 미상'}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="책 제목을 입력하세요"
              value={form.title}
              onChange={(e) => field('title', e.target.value)}
              className={cn(
                'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss]',
                errors.title ? 'border-destructive' : 'border-border'
              )}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Author */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="author">
              저자 <span className="text-destructive">*</span>
            </label>
            <input
              id="author"
              type="text"
              placeholder="저자명을 입력하세요"
              value={form.author}
              onChange={(e) => field('author', e.target.value)}
              className={cn(
                'w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss]',
                errors.author ? 'border-destructive' : 'border-border'
              )}
            />
            {errors.author && <p className="text-xs text-destructive">{errors.author}</p>}
          </div>

          {/* Cover Image Upload / URL */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                표지 이미지 업로드
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setCoverFile(e.target.files[0])
                    setForm((prev) => ({ ...prev, cover_url: '' })) // Clear URL if file selected
                  }
                }}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
              <span className="h-px bg-border flex-1" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="cover_url">
                이미지 URL 직접 입력
              </label>
              <input
                id="cover_url"
                type="url"
                placeholder="https://..."
                value={form.cover_url}
                onChange={(e) => {
                  field('cover_url', e.target.value)
                  if (e.target.value) setCoverFile(null) // Clear file if URL entered
                }}
                disabled={!!coverFile}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">별점</span>
            <div className="flex items-center gap-3">
              <StarRating
                value={form.rating}
                onChange={(v) => setForm((prev) => ({ ...prev, rating: v === prev.rating ? null : v }))}
                size="lg"
              />
              {form.rating !== null && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rating: null }))}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="status">
              읽은 상태
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => field('status', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="started_at">
                시작일
              </label>
              <input
                id="started_at"
                type="date"
                value={form.started_at}
                onChange={(e) => field('started_at', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="finished_at">
                완독일
              </label>
              <input
                id="finished_at"
                type="date"
                value={form.finished_at}
                onChange={(e) => field('finished_at', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss]"
              />
            </div>
          </div>

          {/* Memo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="memo">
              메모
            </label>
            <textarea
              id="memo"
              rows={4}
              placeholder="감상, 인상적인 구절, 기억하고 싶은 내용을 자유롭게 적어보세요"
              value={form.memo}
              onChange={(e) => field('memo', e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-[--color-moss]/40 focus:border-[--color-moss]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 rounded-lg bg-[--color-moss] py-2.5 text-sm font-medium text-[--color-moss-foreground] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {uploading ? '저장 중...' : book ? '수정하기' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
