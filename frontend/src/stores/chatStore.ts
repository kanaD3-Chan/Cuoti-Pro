/* ==========================================================================
 * Chat 状态管理
 * 职责：会话列表、当前会话、消息流、流式输出、卡片更新
 * ========================================================================== */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  USE_MOCK,
  sendMessageToAgent,
  mockUploadFile,
  mockSessions,
  generateSessionTitle,
  uid
} from '@/api'
import { sessionApi } from '@/api/chat'
import type {
  Session,
  Message,
  CardType,
  CardData,
  Attachment,
  WSEvent
} from '@/types/chat'

/* ---------- 打字机缓冲：逐字刷新，模拟流式输出 ---------- */
class TypewriterBuffer {
  private queue = ''
  private flushing = false
  private rafId: number | null = null

  constructor(private onFlush: (chunk: string) => void) {}

  push(text: string) {
    this.queue += text
    if (!this.flushing) this.start()
  }

  private start() {
    this.flushing = true
    const step = () => {
      if (!this.queue.length) {
        this.flushing = false
        return
      }
      const n = Math.min(this.queue.length, 2 + Math.floor(Math.random() * 2))
      this.onFlush(this.queue.slice(0, n))
      this.queue = this.queue.slice(n)
      this.rafId = requestAnimationFrame(step)
    }
    this.rafId = requestAnimationFrame(step)
  }

  drain() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    if (this.queue.length) {
      this.onFlush(this.queue)
      this.queue = ''
    }
    this.flushing = false
  }
}

export const useChatStore = defineStore('chat', () => {
  /* ---------- state ---------- */
  const sessions = ref<Session[]>([])
  const currentSessionId = ref<string | null>(null)
  const messages = ref<Message[]>([])
  const isStreaming = ref(false)
  const connectionState = ref<'idle' | 'connecting' | 'open' | 'closed' | 'error'>('idle')

  /* ---------- getters ---------- */
  const currentSession = computed(() =>
    sessions.value.find((s) => s.id === currentSessionId.value) || null
  )

  const visibleMessages = computed(() =>
    messages.value.filter((m) => m.role === 'student' || m.role === 'agent')
  )

  /* ---------- 会话管理 ---------- */
  async function loadSessions() {
    try {
      if (USE_MOCK) {
        sessions.value = mockSessions
      } else {
        sessions.value = await sessionApi.list()
      }
    } catch (e) {
      sessions.value = mockSessions
      ElMessage.error('加载会话失败，已使用本地数据')
    }
  }

  async function createSession(title?: string): Promise<Session> {
    const finalTitle = title || '新对话'
    const s: Session = {
      id: uid('s'),
      title: finalTitle,
      updated_at: new Date().toISOString()
    }
    sessions.value.unshift(s)
    await switchSession(s.id)
    return s
  }

  async function switchSession(id: string) {
    if (currentSessionId.value === id) return
    currentSessionId.value = id
    messages.value = []
    // Mock 阶段根据会话 id 预填充一些消息，增强演示感
    if (USE_MOCK) {
      await preloadMockMessages(id)
    }
  }

  async function preloadMockMessages(id: string) {
    if (id === 's-001') {
      messages.value = [
        {
          id: uid('stu'),
          session_id: id,
          role: 'student',
          card_type: 'text',
          content: '请帮我批改这份作业',
          attachments: [
            {
              id: uid('att'),
              name: '数学练习卷.jpg',
              size: 1024 * 1024,
              type: 'image/jpeg',
              status: 'done',
              url: 'https://placehold.co/400x300/e8f0fe/1a73e8?text=数学练习卷'
            }
          ],
          created_at: new Date(Date.now() - 3600_000).toISOString()
        },
        {
          id: uid('agent'),
          session_id: id,
          role: 'agent',
          card_type: 'text',
          content: '已收到你的作业，正在识别并批改，请稍候……',
          created_at: new Date(Date.now() - 3600_000 + 2000).toISOString()
        },
        {
          id: uid('card'),
          session_id: id,
          role: 'agent',
          card_type: 'exercise_result',
          content: '',
          card_data: {
            type: 'exercise_result',
            ...getMockExerciseResult()
          } as CardData,
          created_at: new Date(Date.now() - 3600_000 + 5000).toISOString()
        }
      ]
    }
  }

  async function renameSession(id: string, title: string) {
    const s = sessions.value.find((x) => x.id === id)
    if (!s) return
    const old = s.title
    s.title = title
    try {
      if (!USE_MOCK) {
        await sessionApi.rename(id, title)
      }
    } catch {
      s.title = old
      throw new Error('重命名失败')
    }
  }

  async function deleteSession(id: string) {
    const idx = sessions.value.findIndex((x) => x.id === id)
    if (idx < 0) return
    const backup = sessions.value[idx]
    sessions.value.splice(idx, 1)
    try {
      if (!USE_MOCK) {
        await sessionApi.remove(id)
      }
    } catch {
      sessions.value.splice(idx, 0, backup)
      throw new Error('删除失败')
    }
    if (currentSessionId.value === id) {
      currentSessionId.value = null
      messages.value = []
    }
  }

  /* ---------- 消息发送 ---------- */
  async function sendMessage(text: string, files: File[] = []) {
    if ((!text.trim() && !files.length) || isStreaming.value) return

    if (!currentSessionId.value) {
      await createSession(generateSessionTitle(text, files))
    }
    const sid = currentSessionId.value!

    // 1. 构建附件对象
    const attachments: Attachment[] = files.map((f) => ({
      id: uid('att'),
      name: f.name,
      size: f.size,
      type: f.type,
      status: 'uploading',
      progress: 0
    }))

    // 2. 乐观添加学生消息
    const studentMsg: Message = {
      id: uid('stu'),
      session_id: sid,
      role: 'student',
      card_type: 'text',
      content: text.trim(),
      attachments,
      created_at: new Date().toISOString()
    }
    messages.value.push(studentMsg)

    // 3. 模拟上传
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const att = attachments[i]
      try {
        if (USE_MOCK) {
          att.url = await mockUploadFile(file)
          att.status = 'done'
          att.progress = 100
        } else {
          // 真实上传预留
          att.url = ''
          att.status = 'done'
        }
      } catch {
        att.status = 'error'
      }
    }

    // 4. 更新当前会话预览与标题
    const s = sessions.value.find((x) => x.id === sid)
    if (s) {
      s.updated_at = new Date().toISOString()
      s.last_message_preview = text.trim() || `[附件] ${files.map((f) => f.name).join(', ')}`
      // 如果还是默认标题，根据第一条消息生成新标题
      if (s.title === '新对话') {
        s.title = generateSessionTitle(text, files)
      }
    }

    // 5. Mock Agent 回复
    if (USE_MOCK) {
      await handleMockAgentReply(text, files)
    } else {
      // 真实 WS 预留
      ElMessage.warning('真实后端模式尚未接入')
    }
  }

  async function handleMockAgentReply(text: string, files: File[]) {
    isStreaming.value = true

    // 先插入一条 streaming 的 agent 文本消息
    const agentMsg: Message = {
      id: uid('agent'),
      session_id: currentSessionId.value!,
      role: 'agent',
      card_type: 'text',
      content: '',
      streaming: true,
      created_at: new Date().toISOString()
    }
    messages.value.push(agentMsg)

    const tw = new TypewriterBuffer((chunk) => {
      agentMsg.content += chunk
    })
    ;(agentMsg as unknown as Record<string, unknown>).__tw = tw

    const reply = await sendMessageToAgent(text, files)

    // 流式输出文本
    tw.push(reply.text)

    // 文本输出完成后，结束 streaming，再追加/更新卡片
    await new Promise((resolve) => {
      const check = () => {
        if (!tw || !(agentMsg as unknown as Record<string, unknown>).__tw) {
          resolve(true)
          return
        }
        // 简单等待 400ms 让打字机基本排空
        setTimeout(() => {
          tw.drain()
          agentMsg.streaming = false
          isStreaming.value = false
          resolve(true)
        }, reply.text.length > 50 ? 600 : 300)
      }
      check()
    })

    // 如果有卡片数据，追加为新的 agent 消息
    if (reply.card) {
      messages.value.push({
        id: uid('card'),
        session_id: currentSessionId.value!,
        role: 'agent',
        card_type: reply.card.type as CardType,
        content: '',
        card_data: reply.card,
        created_at: new Date().toISOString()
      })
    }
  }

  /* ---------- WebSocket 事件处理（预留） ---------- */
  function handleIncomingEvent(event: WSEvent) {
    switch (event.type) {
      case 'session.welcome':
        connectionState.value = 'open'
        break
      case 'plan.start':
        isStreaming.value = true
        break
      case 'chat.text.delta':
        // 真实流式文本增量处理
        break
      case 'card.update':
        // 真实卡片更新处理
        break
      case 'plan.done':
        isStreaming.value = false
        break
      case 'error':
        isStreaming.value = false
        ElMessage.error((event.payload as { message: string }).message || '发生错误')
        break
    }
  }

  return {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    connectionState,
    currentSession,
    visibleMessages,
    loadSessions,
    createSession,
    switchSession,
    renameSession,
    deleteSession,
    sendMessage,
    handleIncomingEvent
  }
})

/* ---------- 从 mock.ts 复用数据，避免循环依赖 ---------- */
function getMockExerciseResult() {
  return {
    filename: '数学练习卷.jpg',
    subject: '数学',
    summary: '共5题，正确3题，错误2题，正确率60%',
    correct_count: 3,
    total_count: 5,
    questions: [
      {
        id: 'q-001',
        index: 1,
        question_snapshot: '若 x² - 5x + 6 = 0，则 x 的值为（ ）',
        student_answer: 'A',
        correct_answer: 'A',
        verdict: 'correct',
        knowledge_point: '一元二次方程求解'
      },
      {
        id: 'q-002',
        index: 2,
        question_snapshot: '直角三角形两直角边分别为 3 和 4，斜边长为（ ）',
        student_answer: 'B',
        correct_answer: 'C',
        verdict: 'wrong',
        knowledge_point: '勾股定理',
        analysis:
          '本题易错点在于未区分直角边与斜边。勾股定理中，直角边的平方和等于斜边的平方，因此斜边长应为 √(3² + 4²) = 5。'
      },
      {
        id: 'q-003',
        index: 3,
        question_snapshot: '函数 y = 2x + 1 的图像不经过第几象限？',
        student_answer: 'D',
        correct_answer: 'D',
        verdict: 'correct',
        knowledge_point: '一次函数图像'
      },
      {
        id: 'q-004',
        index: 4,
        question_snapshot: '等腰三角形顶角为 40°，则底角为（ ）',
        student_answer: 'C',
        correct_answer: 'C',
        verdict: 'correct',
        knowledge_point: '等腰三角形性质'
      },
      {
        id: 'q-005',
        index: 5,
        question_snapshot: '化简 √(a²) 的结果为（ ）',
        student_answer: 'A',
        correct_answer: 'B',
        verdict: 'review',
        needs_review: true,
        knowledge_point: '二次根式性质',
        analysis:
          '手写识别置信度较低，请确认你的原始答案。二次根式 √(a²) = |a|，若题目选项中有 |a|，则为正确答案。'
      }
    ]
  }
}
