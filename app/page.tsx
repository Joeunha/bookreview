import { redirect } from 'next/navigation'
import { getBooks } from '@/lib/books'
import { BookShelf } from '@/components/book-shelf'
import { createClient } from '@/lib/supabase/server'

const AUTH_ENABLED = false // true로 바꾸면 로그인 다시 활성화됨

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (AUTH_ENABLED && !user) {
    redirect('/login')
  }

  const books = await getBooks()

  return <BookShelf initialBooks={books} userEmail={user?.email ?? 'guest@example.com'} />
}
