/* ==========================================================================
 * 智学错题 Agent · 类型定义
 * 覆盖：会话、消息、附件、卡片、WebSocket 事件
 * ========================================================================== */

/** 会话 */
export interface Session {
  id: string
  title: string
  updated_at: string
  created_at?: string
  /** 最后一条消息摘要，用于会话列表预览 */
  last_message_preview?: string
}

/** 消息角色 */
export type MessageRole = 'student' | 'agent' | 'system'

/** 卡片类型（决定 Agent 消息渲染哪种富组件） */
export type CardType =
  | 'text'           // 纯文本（默认）
  | 'proposal'       // 工具调用提案
  | 'grading_progress' // 批改中
  | 'exercise_result' // 练习/作业批改结果
  | 'upload_error'   // 上传失败
  | 'wrong_list'     // 错题列表

/** 附件 */
export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url?: string
  progress?: number
  status?: 'uploading' | 'done' | 'error'
}

/** 消息 */
export interface Message {
  id: string
  session_id: string
  role: MessageRole
  card_type: CardType
  content: string
  attachments?: Attachment[]
  card_data?: CardData
  streaming?: boolean
  created_at: string
}

/* ==========================================================================
 * 卡片数据结构
 * ========================================================================== */

/** 工具调用提案 */
export interface ProposalCardData {
  type: 'proposal'
  tool_name: string
  description: string
  args?: Record<string, unknown>
  status?: 'pending' | 'running' | 'done' | 'error'
}

/** 批改中 */
export type GradingStep = '正在识别...' | '正在批改...' | '正在归档...'

export interface GradingProgressCardData {
  type: 'grading_progress'
  filename: string
  subject: string
  step: GradingStep
  progress?: number
}

/** 判定结果 */
export type QuestionVerdict = 'correct' | 'wrong' | 'review'

/** 单题 */
export interface ExerciseQuestion {
  id: string
  index: number
  question_snapshot: string
  student_answer: string
  correct_answer: string
  verdict: QuestionVerdict
  needs_review?: boolean
  knowledge_point?: string
  analysis?: string
}

/** 练习结果 */
export interface ExerciseResultCardData {
  type: 'exercise_result'
  filename?: string
  subject?: string
  summary: string
  correct_count: number
  total_count: number
  questions: ExerciseQuestion[]
}

/** 上传失败 */
export type UploadErrorCode = 'FILE_TOO_LARGE' | 'PAGE_TOO_MANY' | 'FORMAT_UNSUPPORTED' | 'UNKNOWN'

export interface UploadErrorCardData {
  type: 'upload_error'
  filename: string
  reason: string
  code?: UploadErrorCode
}

/** 错题列表项 */
export interface WrongQuestionItem {
  id: string
  subject: string
  knowledge_point: string
  reason_summary: string
  archived_at: string
}

/** 错题列表 */
export interface WrongListCardData {
  type: 'wrong_list'
  items: WrongQuestionItem[]
}

/** 卡片数据联合类型 */
export type CardData =
  | ProposalCardData
  | GradingProgressCardData
  | ExerciseResultCardData
  | UploadErrorCardData
  | WrongListCardData

/* ==========================================================================
 * WebSocket 事件（与后端契约对齐，本期仅渲染部分）
 * ========================================================================== */

export type WSEventType =
  | 'session.welcome'
  | 'plan.start'
  | 'plan.step.tool_call'
  | 'chat.text.delta'
  | 'card.update'
  | 'plan.done'
  | 'error'

export interface WSEvent {
  type: WSEventType
  step_id?: string
  payload: unknown
}

/* ==========================================================================
 * 上行消息
 * ========================================================================== */

export interface OutgoingChatMessage {
  type: 'chat.message'
  payload: {
    text: string
    attachments?: string[]
  }
}

/* ==========================================================================
 * API 通用类型
 * ========================================================================== */

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiError {
  message: string
  code?: string
}
