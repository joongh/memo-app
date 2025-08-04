'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Memo, MemoFormData } from '@/types/memo'
import { supabaseUtils } from '@/utils/supabaseUtils'
import { seedSupabaseData } from '@/utils/seedSupabaseData'

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 메모 로드
  useEffect(() => {
    const loadMemos = async () => {
      setLoading(true)
      try {
        // 샘플 데이터 시딩 (기존 데이터가 없을 때만)
        await seedSupabaseData()
        const loadedMemos = await supabaseUtils.getMemos()
        setMemos(loadedMemos)
      } catch (error) {
        console.error('Failed to load memos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMemos()
  }, [])

  // 메모 생성
  const createMemo = useCallback(async (formData: MemoFormData): Promise<Memo | null> => {
    const newMemo: Memo = {
      id: uuidv4(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const createdMemo = await supabaseUtils.addMemo(newMemo)
      if (createdMemo) {
        setMemos(prev => [createdMemo, ...prev])
        return createdMemo
      }
      return null
    } catch (error) {
      console.error('Failed to create memo:', error)
      return null
    }
  }, [])

  // 메모 업데이트
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<void> => {
      const existingMemo = memos.find(memo => memo.id === id)
      if (!existingMemo) return

      const updatedMemo: Memo = {
        ...existingMemo,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      try {
        const result = await supabaseUtils.updateMemo(updatedMemo)
        if (result) {
          setMemos(prev => prev.map(memo => (memo.id === id ? result : memo)))
        }
      } catch (error) {
        console.error('Failed to update memo:', error)
      }
    },
    [memos]
  )

  // 메모 삭제
  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    try {
      const success = await supabaseUtils.deleteMemo(id)
      if (success) {
        setMemos(prev => prev.filter(memo => memo.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete memo:', error)
    }
  }, [])

  // 메모 검색
  const searchMemos = useCallback(async (query: string): Promise<void> => {
    setSearchQuery(query)
    
    // 빈 검색어인 경우 모든 메모 다시 로드
    if (!query.trim()) {
      try {
        const allMemos = await supabaseUtils.getMemos()
        setMemos(allMemos)
      } catch (error) {
        console.error('Failed to load all memos:', error)
      }
      return
    }

    // 검색 수행
    try {
      const searchResults = await supabaseUtils.searchMemos(query)
      setMemos(searchResults)
    } catch (error) {
      console.error('Failed to search memos:', error)
    }
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback(async (category: string): Promise<void> => {
    setSelectedCategory(category)
    
    try {
      const filteredMemos = await supabaseUtils.getMemosByCategory(category)
      setMemos(filteredMemos)
      // 검색 쿼리 초기화 (카테고리 필터링 시)
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to filter memos by category:', error)
    }
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    async (id: string): Promise<Memo | null> => {
      // 먼저 현재 상태에서 찾기
      const existingMemo = memos.find(memo => memo.id === id)
      if (existingMemo) {
        return existingMemo
      }

      // 상태에 없으면 Supabase에서 가져오기
      try {
        const memo = await supabaseUtils.getMemoById(id)
        return memo
      } catch (error) {
        console.error('Failed to get memo by ID:', error)
        return null
      }
    },
    [memos]
  )

  // 필터링된 메모 목록 (클라이언트 사이드 필터링은 더 이상 사용하지 않음)
  const filteredMemos = useMemo(() => {
    return memos
  }, [memos])

  // 모든 메모 삭제
  const clearAllMemos = useCallback(async (): Promise<void> => {
    try {
      const success = await supabaseUtils.clearMemos()
      if (success) {
        setMemos([])
        setSearchQuery('')
        setSelectedCategory('all')
      }
    } catch (error) {
      console.error('Failed to clear all memos:', error)
    }
  }, [])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    // 상태
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    clearAllMemos,
  }
}