/* ==========================================================================
 * API 请求封装
 * 后端就绪后集中替换 baseURL、鉴权方式等
 * ========================================================================== */

import type { ApiError } from '@/types/chat'

const BASE_URL = '/api'

function getToken(): string | null {
  return localStorage.getItem('cuoti_token')
}

export async function request<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const data = await res.json()
      detail = data?.detail || data?.message || detail
    } catch {
      /* ignore */
    }
    const err: ApiError = { message: `[${res.status}] ${detail}`, code: String(res.status) }
    throw err
  }

  if (res.status === 204) {
    return undefined as T
  }
  return res.json()
}
