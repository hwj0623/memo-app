import { Tables } from './database'

export interface Memo {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Supabase 데이터베이스 행을 Memo 타입으로 변환하는 유틸리티 타입
export type DatabaseMemo = Tables<'memos'>

// Supabase 행을 앱의 Memo 인터페이스로 변환하는 함수
export const convertDatabaseMemoToMemo = (dbMemo: DatabaseMemo): Memo => ({
  id: dbMemo.id,
  title: dbMemo.title,
  content: dbMemo.content,
  category: dbMemo.category,
  tags: Array.isArray(dbMemo.tags) ? dbMemo.tags as string[] : [],
  createdAt: dbMemo.created_at || new Date().toISOString(),
  updatedAt: dbMemo.updated_at || new Date().toISOString(),
})

// 앱의 Memo를 Supabase Insert 타입으로 변환하는 함수
export const convertMemoToInsert = (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>): Omit<DatabaseMemo, 'id' | 'created_at' | 'updated_at'> => ({
  title: memo.title,
  content: memo.content,
  category: memo.category,
  tags: memo.tags,
})

export interface MemoFormData {
  title: string
  content: string
  category: string
  tags: string[]
}

export type MemoCategory = 'personal' | 'work' | 'study' | 'idea' | 'other'

export const MEMO_CATEGORIES: Record<MemoCategory, string> = {
  personal: '개인',
  work: '업무',
  study: '학습',
  idea: '아이디어',
  other: '기타',
}

export const DEFAULT_CATEGORIES = Object.keys(MEMO_CATEGORIES) as MemoCategory[]
