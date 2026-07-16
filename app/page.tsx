import { redirect } from 'next/navigation'
import { getBooks } from '@/lib/books'
import { BookShelf } from '@/components/book-shelf'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const books = await getBooks()

  return <BookShelf initialBooks={books} userEmail={user.email} />
}
