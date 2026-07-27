/* ==========================================================================
 * 错题本 API（预留，后端就绪后实现）
 * ========================================================================== */

import { request } from './request'
import type { WrongQuestionItem } from '@/types/chat'

export interface WrongQuestionDetail {
  id: string
  subject: string
  knowledge_point: string
  reason_summary: string
  archived_at: string
  question_snapshot: string
  student_answer: string
  standard_answer: string
}

export const wrongQuestionApi = {
  list(): Promise<WrongQuestionItem[]> {
    return request<WrongQuestionItem[]>('/wrong-questions')
  },

  detail(id: string): Promise<WrongQuestionDetail> {
    return request<WrongQuestionDetail>(`/wrong-questions/${id}`)
  },

  feedback(id: string, action: 'confirm' | 'dispute', note?: string): Promise<void> {
    return request<void>(`/questions/${id}/feedback`, 'POST', { action, note })
  }
}
