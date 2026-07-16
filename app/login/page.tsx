import { Suspense } from 'react'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg border border-border flex flex-col items-center justify-center min-h-[350px]">
          <h2 className="text-xl font-serif font-bold text-foreground">로그인 페이지 로딩 중...</h2>
          <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-moss]" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
