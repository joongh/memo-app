import { Memo } from '@/types/memo'
import { supabase } from '@/lib/supabase'

export const supabaseUtils = {
  // 모든 메모 가져오기
  getMemos: async (): Promise<Memo[]> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading memos from Supabase:', error)
        return []
      }

      // Supabase의 UUID id를 string으로, 그리고 날짜를 ISO string으로 변환
      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags || [],
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error loading memos from Supabase:', error)
      return []
    }
  },

  // 메모 추가
  addMemo: async (memo: Memo): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .insert([
          {
            id: memo.id,
            title: memo.title,
            content: memo.content,
            category: memo.category,
            tags: memo.tags,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding memo to Supabase:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error adding memo to Supabase:', error)
      return null
    }
  },

  // 메모 업데이트
  updateMemo: async (updatedMemo: Memo): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .update({
          title: updatedMemo.title,
          content: updatedMemo.content,
          category: updatedMemo.category,
          tags: updatedMemo.tags,
        })
        .eq('id', updatedMemo.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating memo in Supabase:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error updating memo in Supabase:', error)
      return null
    }
  },

  // 메모 삭제
  deleteMemo: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('memos').delete().eq('id', id)

      if (error) {
        console.error('Error deleting memo from Supabase:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting memo from Supabase:', error)
      return false
    }
  },

  // 메모 검색
  searchMemos: async (query: string): Promise<Memo[]> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .or(
          `title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching memos in Supabase:', error)
        return []
      }

      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags || [],
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error searching memos in Supabase:', error)
      return []
    }
  },

  // 카테고리별 메모 필터링
  getMemosByCategory: async (category: string): Promise<Memo[]> => {
    try {
      let query = supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error filtering memos by category in Supabase:', error)
        return []
      }

      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags || [],
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error filtering memos by category in Supabase:', error)
      return []
    }
  },

  // 특정 메모 가져오기
  getMemoById: async (id: string): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error getting memo by ID from Supabase:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error getting memo by ID from Supabase:', error)
      return null
    }
  },

  // 모든 메모 삭제 (테스트용)
  clearMemos: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('memos').delete().neq('id', '')

      if (error) {
        console.error('Error clearing memos from Supabase:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error clearing memos from Supabase:', error)
      return false
    }
  },
}