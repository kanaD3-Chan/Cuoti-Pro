/* ==========================================================================
 * 会话相关 API（预留，后端就绪后实现）
 * ========================================================================== */

import { request } from './request'
import type { Session, Message, WSEvent } from '@/types/chat'

export const sessionApi = {
  create(title = '新对话'): Promise<Session> {
    return request<Session>('/agent/sessions', 'POST', { title })
  },

  list(): Promise<Session[]> {
    return request<Session[]>('/agent/sessions')
  },

  rename(id: string, title: string): Promise<Session> {
    return request<Session>(`/agent/sessions/${id}`, 'PATCH', { title })
  },

  remove(id: string): Promise<void> {
    return request<void>(`/agent/sessions/${id}`, 'DELETE')
  },

  history(id: string): Promise<Message[]> {
    return request<Message[]>(`/agent/sessions/${id}/messages`)
  },

  replay(id: string, sinceStepId?: string): Promise<WSEvent[]> {
    const qs = sinceStepId ? `?since=${encodeURIComponent(sinceStepId)}` : ''
    return request<WSEvent[]>(`/agent/sessions/${id}/replay${qs}`)
  }
}
