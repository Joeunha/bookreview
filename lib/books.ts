'use server'

import { createClient } from '@/lib/supabase/server'
import type { Book } from './types'

export async function getBooks(): Promise<Book[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching books:', error)
    return []
  }
  return data ?? []
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) return null
  return data
}

export async function createBook(data: Omit<Book, 'id' | 'created_at' | 'user_id'>): Promise<Book> {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data: newBook, error } = await supabase
    .from('books')
    .insert({
      ...data,
      user_id: userData.user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating book:', error)
    throw new Error('Failed to create book')
  }
  return newBook
}

export async function updateBook(id: string, data: Partial<Omit<Book, 'id' | 'created_at' | 'user_id'>>): Promise<Book | null> {
  const supabase = await createClient()
  
  const { data: updatedBook, error } = await supabase
    .from('books')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating book:', error)
    throw new Error('Failed to update book')
  }
  return updatedBook
}

export async function deleteBook(id: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) {
    console.error('Error deleting book:', error)
    return false
  }
  return true
}
