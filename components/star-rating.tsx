'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number | null
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 22,
}

export function StarRating({ value, onChange, readonly = false, size = 'md', className }: StarRatingProps) {
  const px = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-0.5', className)} role={readonly ? 'img' : 'group'} aria-label={`별점 ${value ?? 0}점`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && star <= value
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={cn(
              'transition-transform focus:outline-none',
              !readonly && 'cursor-pointer hover:scale-110 focus-visible:scale-110',
              readonly && 'cursor-default pointer-events-none'
            )}
            aria-label={readonly ? undefined : `${star}점`}
          >
            <Star
              width={px}
              height={px}
              style={filled ? { fill: 'var(--color-star)', color: 'var(--color-star)' } : undefined}
              className={cn(
                'transition-colors',
                filled ? '' : 'fill-transparent text-border'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
