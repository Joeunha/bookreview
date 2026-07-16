'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } from '@/lib/auth-actions'

export function LoginForm() {
  const searchParams = useSearchParams()
  const rawMessage = searchParams.get('message')
  const [isPending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<'login' | 'signup' | 'google' | 'github' | null>(null)

  let message = ''
  let messageType: 'error' | 'success' = 'error'

  if (rawMessage) {
    if (rawMessage === 'Could not authenticate user') {
      message = '이메일 또는 비밀번호를 다시 확인해주세요.'
      messageType = 'error'
    } else if (rawMessage === 'Could not create user') {
      message = '회원 가입에 실패했습니다. 올바른 이메일 주소인지 확인해주세요.'
      messageType = 'error'
    } else if (rawMessage === 'Check email to continue sign in process') {
      message = '가입 확인 이메일이 발송되었습니다. 메일함을 확인해주세요.'
      messageType = 'success'
    } else {
      message = rawMessage
    }
  }

  const handleEmailAction = (formData: FormData, type: 'login' | 'signup') => {
    setActiveAction(type)
    startTransition(async () => {
      if (type === 'login') {
        await signInWithEmail(formData)
      } else {
        await signUpWithEmail(formData)
      }
    })
  }

  const handleOAuthAction = (provider: 'google' | 'github') => {
    setActiveAction(provider)
    startTransition(async () => {
      if (provider === 'google') {
        await signInWithGoogle()
      } else {
        await signInWithGithub()
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg border border-border">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-serif font-bold tracking-tight text-foreground">
          나의 독서 노트
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          로그인하여 나만의 독서 기록을 관리하세요
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm border ${
            messageType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {message}
        </div>
      )}

      <form className="mt-8 space-y-6">
        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label htmlFor="email-address" className="sr-only">
              이메일 주소
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              className="relative block w-full rounded-t-md border-0 py-2.5 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[--color-moss] sm:text-sm sm:leading-6 pl-3 bg-background disabled:opacity-50"
              placeholder="이메일 주소"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
              className="relative block w-full rounded-b-md border-0 py-2.5 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[--color-moss] sm:text-sm sm:leading-6 pl-3 bg-background disabled:opacity-50"
              placeholder="비밀번호"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            formAction={(formData) => handleEmailAction(formData, 'login')}
            disabled={isPending}
            className="group relative flex w-full items-center justify-center gap-2 rounded-md bg-[--color-moss] px-3 py-2.5 text-sm font-semibold text-[--color-moss-foreground] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-moss] disabled:opacity-50"
          >
            {isPending && activeAction === 'login' && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            로그인
          </button>
          <button
            formAction={(formData) => handleEmailAction(formData, 'signup')}
            disabled={isPending}
            className="group relative flex w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-muted disabled:opacity-50"
          >
            {isPending && activeAction === 'signup' && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            회원가입
          </button>
        </div>
      </form>

      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm font-medium leading-6">
          <span className="bg-card px-6 text-muted-foreground">또는 소셜 계정으로 로그인</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          onClick={() => handleOAuthAction('google')}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent disabled:opacity-50"
        >
          {isPending && activeAction === 'google' ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          ) : (
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
          )}
          <span className="text-sm font-semibold leading-6">Google</span>
        </button>

        <button
          onClick={() => handleOAuthAction('github')}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-[#24292F] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#24292F]/90 focus-visible:ring-transparent disabled:opacity-50"
        >
          {isPending && activeAction === 'github' ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
          )}
          <span className="text-sm font-semibold leading-6">GitHub</span>
        </button>
      </div>
    </div>
  )
}
