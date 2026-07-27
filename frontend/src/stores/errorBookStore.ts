/* ==========================================================================
 * 错题本状态管理
 * 支持从批改结果自动归档、按科目分类、查看详情
 * ========================================================================== */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { mockWrongQuestions } from '@/api/mock'
import type { ExerciseQuestion, WrongQuestionItem } from '@/types/chat'

export interface WrongQuestionDetail {
  id: string
  subject: string
  knowledge_point: string
  reason_summary: string
  archived_at: string
  question_snapshot: string
  student_answer: string
  standard_answer: string
  status: 'active' | 'confirmed' | 'review'
}

export const useErrorBookStore = defineStore('errorBook', () => {
  const items = ref<WrongQuestionItem[]>([...mockWrongQuestions])
  const details = ref<Record<string, WrongQuestionDetail>>({})

  const subjects = computed(() => {
    const set = new Set(items.value.map((i) => i.subject))
    return Array.from(set).sort()
  })

  function archiveFromExercise(subject: string, questions: ExerciseQuestion[]) {
    let added = 0
    for (const q of questions) {
      if (q.verdict !== 'correct') {
        const exists = items.value.some((item) => item.id === q.id)
        if (!exists) {
          items.value.unshift({
            id: q.id,
            subject,
            knowledge_point: q.knowledge_point || '未识别知识点',
            reason_summary: q.analysis || (q.needs_review ? '识别置信度低，待复核' : '自动归档'),
            archived_at: new Date().toISOString()
          })
          details.value[q.id] = {
            id: q.id,
            subject,
            knowledge_point: q.knowledge_point || '未识别知识点',
            reason_summary: q.analysis || (q.needs_review ? '识别置信度低，待复核' : '自动归档'),
            archived_at: new Date().toISOString(),
            question_snapshot: q.question_snapshot,
            student_answer: q.student_answer,
            standard_answer: q.correct_answer,
            status: q.needs_review ? 'review' : 'active'
          }
          added++
        }
      }
    }
    if (added > 0) {
      ElMessage.success(`已自动归档 ${added} 道错题`)
    }
  }

  function confirmArchive(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (item) {
      item.reason_summary = item.reason_summary.replace('，待复核', '').replace('待复核', '已确认归档')
    }
    const d = details.value[id]
    if (d) {
      d.status = 'confirmed'
      d.reason_summary = d.reason_summary.replace('，待复核', '').replace('待复核', '已确认归档')
    }
  }

  function getDetail(id: string): WrongQuestionDetail | null {
    return details.value[id] || null
  }

  function ensureDetail(id: string): WrongQuestionDetail | null {
    const item = items.value.find((i) => i.id === id)
    if (!item) return null
    if (!details.value[id]) {
      details.value[id] = {
        id,
        subject: item.subject,
        knowledge_point: item.knowledge_point,
        reason_summary: item.reason_summary,
        archived_at: item.archived_at,
        question_snapshot: '原题快照（后端就绪后返回完整内容）',
        student_answer: '—',
        standard_answer: '—',
        status: item.reason_summary.includes('复核') ? 'review' : 'active'
      }
    }
    return details.value[id]
  }

  return {
    items,
    subjects,
    archiveFromExercise,
    confirmArchive,
    getDetail,
    ensureDetail
  }
})
