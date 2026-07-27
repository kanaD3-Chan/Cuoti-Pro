/* ==========================================================================
 * 集中 Mock 数据与 Agent 回复模拟
 * 后端就绪后，chatStore 中切换为真实 WS / REST 调用即可
 * ========================================================================== */

import type {
  Session,
  CardData,
  ExerciseResultCardData,
  WrongListCardData,
  WrongQuestionItem
} from '@/types/chat'

export interface AgentReply {
  text: string
  card?: CardData
  delay?: number
}

/* ---------- 工具函数 ---------- */
const uid = (prefix = 'm') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ---------- 模拟会话列表 ---------- */
export const mockSessions: Session[] = [
  {
    id: 's-001',
    title: '2026-07-26 数学试卷批改',
    updated_at: new Date(Date.now() - 3600_000).toISOString(),
    last_message_preview: '共 5 题，正确 3 题，正确率 60%'
  },
  {
    id: 's-002',
    title: '英语完形填空专项',
    updated_at: new Date(Date.now() - 86400_000).toISOString(),
    last_message_preview: '本次正确率 72%，建议复习固定搭配'
  },
  {
    id: 's-003',
    title: '物理力学综合卷批改',
    updated_at: new Date(Date.now() - 3 * 86400_000).toISOString(),
    last_message_preview: '识别到 2 道待复核题目'
  }
]

/* ---------- 5 道数学题批改结果 ---------- */
export const mockExerciseResult: ExerciseResultCardData = {
  type: 'exercise_result',
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

/* ---------- 错题列表 ---------- */
export const mockWrongQuestions: WrongQuestionItem[] = [
  {
    id: 'w-001',
    subject: '数学',
    knowledge_point: '勾股定理',
    reason_summary: '未区分直角边与斜边，直接写成 3+4=7',
    archived_at: new Date(Date.now() - 3600_000).toISOString()
  },
  {
    id: 'w-002',
    subject: '数学',
    knowledge_point: '二次根式性质',
    reason_summary: '手写识别置信度低，待复核',
    archived_at: new Date(Date.now() - 3600_000).toISOString()
  },
  {
    id: 'w-003',
    subject: '数学',
    knowledge_point: '一元二次方程',
    reason_summary: '因式分解时符号出错',
    archived_at: new Date(Date.now() - 2 * 86400_000).toISOString()
  }
]

/* ---------- 追问讲解 ---------- */
export const mockFollowUpReply = `第 2 题考查的是**勾股定理**：直角三角形中，两直角边的平方和等于斜边的平方。

本题中两直角边分别是 3 和 4，因此斜边长应为：

√(3² + 4²) = √25 = **5**

你选的是 B，可能是把三边直接相加或把斜边当成了直角边。

**建议**：遇到“直角边/斜边”类题目时，先画图标注，再套用 a² + b² = c²。`

/* ---------- Agent 回复入口 ---------- */
export async function sendMessageToAgent(text: string, files: File[] = []): Promise<AgentReply> {
  // 模拟网络延迟 1.2 ~ 1.8s
  await delay(1200 + Math.random() * 600)

  const lower = text.toLowerCase()

  // 上传作业 / 请求批改
  if (files.length > 0 || /批改|作业|试卷|上传|改题/i.test(text)) {
    return {
      text: `已收到你的${files.length > 0 ? '作业' : '请求'}，正在识别并批改，请稍候……`,
      card: {
        ...mockExerciseResult,
        filename: files[0]?.name || mockExerciseResult.filename
      } as ExerciseResultCardData
    }
  }

  // 查看错题本
  if (/错题|错题本|weak|错误/i.test(lower)) {
    return {
      text: '以下是你最近归档的错题，点击可查看详情：',
      card: {
        type: 'wrong_list',
        items: mockWrongQuestions
      } as WrongListCardData
    }
  }

  // 追问讲解
  if (/第.*2.*题|讲解|为什么|怎么做|怎么解/i.test(text)) {
    return {
      text: mockFollowUpReply.trim()
    }
  }

  // 薄弱点 / 学习报告
  if (/薄弱点|知识点|报告|总结/i.test(text)) {
    return {
      text:
        '根据你最近的练习，当前薄弱点集中在「勾股定理」和「二次根式性质」。建议针对性复习这两个知识点，并练习相关变式题。'
    }
  }

  // 通用欢迎语
  return {
    text:
      '我是你的智能学习错题助手，可以帮你批改作业、整理错题、讲解知识点。请上传作业图片或 PDF，或直接输入问题。'
  }
}

/* ---------- 模拟本地文件上传（生成 base64 预览 URL） ---------- */
export function mockUploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      resolve(url)
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    // 图片直接读 dataURL；PDF 也尝试读 dataURL 供预览
    reader.readAsDataURL(file)
  })
}

/* ---------- 生成新会话标题 ---------- */
export function generateSessionTitle(text: string, files: File[] = []): string {
  const today = formatToday()
  const hasFile = files.length > 0

  // 1. 批改 / 上传作业
  if (hasFile || /批改|作业|试卷|上传|改题/i.test(text)) {
    if (/数学/i.test(text) || hasFile) return `${today} 数学试卷批改`
    if (/英语/i.test(text)) return `${today} 英语作业批改`
    if (/物理/i.test(text)) return `${today} 物理练习批改`
    if (/化学/i.test(text)) return `${today} 化学作业批改`
    if (/生物/i.test(text)) return `${today} 生物作业批改`
    return `${today} 作业批改`
  }

  // 2. 错题本
  if (/错题|错题本|错因/i.test(text)) {
    return '错题本查询'
  }

  // 3. 薄弱点 / 学习报告
  if (/薄弱点|知识点|学习报告|报告|总结/i.test(text)) {
    if (/报告|总结/i.test(text)) return '学习报告'
    return '薄弱点分析'
  }

  // 4. 讲解 / 追问
  if (/讲解|为什么|怎么做|怎么解|第.*题/i.test(text)) {
    return '题目讲解'
  }

  // 5. 通用：取消息前 12 个字
  const clean = text.trim().replace(/\s+/g, ' ')
  if (clean.length <= 12) return clean || '新对话'
  return clean.slice(0, 12) + '…'
}

function formatToday(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export { uid }
