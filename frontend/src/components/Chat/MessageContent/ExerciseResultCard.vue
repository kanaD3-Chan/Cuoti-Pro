<script setup lang="ts">
import { onMounted } from 'vue'
import { Check, Close, Warning, ArrowRight } from '@element-plus/icons-vue'
import { useErrorBookStore } from '@/stores/errorBookStore'
import type { ExerciseResultCardData, ExerciseQuestion, QuestionVerdict } from '@/types/chat'

const props = defineProps<{
  data: ExerciseResultCardData
}>()

const errorBookStore = useErrorBookStore()

onMounted(() => {
  errorBookStore.archiveFromExercise(props.data.subject || '数学', props.data.questions)
})

const accuracy = Math.round((props.data.correct_count / props.data.total_count) * 100)

function verdictConfig(verdict: QuestionVerdict) {
  switch (verdict) {
    case 'correct':
      return { icon: Check, label: '正确', class: 'correct' }
    case 'wrong':
      return { icon: Close, label: '错误', class: 'wrong' }
    case 'review':
      return { icon: Warning, label: '待复核', class: 'review' }
    default:
      return { icon: Warning, label: '未知', class: '' }
  }
}

function expandedAnalysis(q: ExerciseQuestion) {
  return q.analysis || '暂无分析'
}
</script>

<template>
  <div class="exercise-result-card">
    <!-- 总体概览 -->
    <div class="exercise-result-card__summary">
      <div class="summary-title">批改结果</div>
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-value">{{ data.correct_count }}/{{ data.total_count }}</div>
          <div class="stat-label">正确/总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value accent">{{ accuracy }}%</div>
          <div class="stat-label">正确率</div>
        </div>
      </div>
      <div class="summary-text">{{ data.summary }}</div>
    </div>

    <!-- 逐题列表 -->
    <div class="question-list">
      <div
        v-for="q in data.questions"
        :key="q.id"
        class="question-item"
        :class="{ wrong: q.verdict === 'wrong', review: q.verdict === 'review' }"
      >
        <div class="question-item__header">
          <div class="question-item__index">第 {{ q.index }} 题</div>
          <div class="question-item__verdict" :class="verdictConfig(q.verdict).class">
            <el-icon><component :is="verdictConfig(q.verdict).icon" /></el-icon>
            <span>{{ verdictConfig(q.verdict).label }}</span>
          </div>
        </div>

        <div class="question-item__body">
          <div class="question-text">{{ q.question_snapshot }}</div>
          <div class="answer-row">
            <span class="answer-label">你的答案：</span>
            <span class="answer-value user">{{ q.student_answer }}</span>
            <span class="answer-label">正确答案：</span>
            <span class="answer-value correct">{{ q.correct_answer }}</span>
          </div>
          <div v-if="q.knowledge_point" class="knowledge-tag">
            {{ q.knowledge_point }}
          </div>
          <div v-if="q.analysis" class="analysis-box">
            <div class="analysis-title">
              <el-icon><ArrowRight /></el-icon> 错因分析
            </div>
            <div class="analysis-text">{{ expandedAnalysis(q) }}</div>
          </div>
          <div v-if="q.needs_review" class="review-tip">
            ⚠️ 本题识别置信度较低，未自动归档，请确认后点击「确认归档」。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.exercise-result-card {
  background: var(--cuoti-bg-card);
  border: 1px solid var(--cuoti-border);
  border-radius: var(--cuoti-radius-lg);
  padding: 20px;
  box-shadow: var(--cuoti-shadow-1);
  min-width: 300px;

  &__summary {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--cuoti-divider);
  }

  .summary-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--cuoti-text-primary);
    margin-bottom: 12px;
  }

  .summary-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 8px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--cuoti-text-primary);

    &.accent {
      color: var(--cuoti-primary);
    }
  }

  .stat-label {
    font-size: 12px;
    color: var(--cuoti-text-tertiary);
    margin-top: 2px;
  }

  .summary-text {
    font-size: 13px;
    color: var(--cuoti-text-secondary);
  }
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  border: 1px solid var(--cuoti-divider);
  border-radius: var(--cuoti-radius-md);
  padding: 14px;
  background: var(--cuoti-bg-app);
  transition: border-color var(--cuoti-transition-fast);

  &.wrong {
    border-color: rgba(217, 48, 37, 0.3);
    background: #fef6f5;
  }

  &.review {
    border-color: rgba(249, 171, 0, 0.4);
    background: #fff8e6;
  }

  &__header {
    @include flex-between;
    margin-bottom: 10px;
  }

  &__index {
    font-weight: 600;
    color: var(--cuoti-text-primary);
  }

  &__verdict {
    @include flex-center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: var(--cuoti-radius-full);

    &.correct {
      background: rgba(30, 142, 62, 0.1);
      color: var(--cuoti-success);
    }

    &.wrong {
      background: rgba(217, 48, 37, 0.1);
      color: var(--cuoti-danger);
    }

    &.review {
      background: rgba(249, 171, 0, 0.12);
      color: #b06000;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .question-text {
    font-size: 14px;
    color: var(--cuoti-text-primary);
    line-height: 1.5;
  }

  .answer-row {
    font-size: 13px;
  }

  .answer-label {
    color: var(--cuoti-text-tertiary);
  }

  .answer-value {
    font-weight: 600;
    margin-right: 12px;

    &.user {
      color: var(--cuoti-text-primary);
    }

    &.correct {
      color: var(--cuoti-success);
    }
  }

  .knowledge-tag {
    display: inline-block;
    width: fit-content;
    padding: 3px 10px;
    border-radius: var(--cuoti-radius-full);
    background: rgba(26, 115, 232, 0.1);
    color: var(--cuoti-primary);
    font-size: 12px;
  }

  .analysis-box {
    margin-top: 4px;
    padding: 10px 12px;
    border-radius: var(--cuoti-radius-sm);
    background: rgba(0, 0, 0, 0.03);

    .analysis-title {
      @include flex-center;
      justify-content: flex-start;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--cuoti-text-secondary);
      margin-bottom: 4px;
    }

    .analysis-text {
      font-size: 13px;
      color: var(--cuoti-text-secondary);
      line-height: 1.5;
    }
  }

  .review-tip {
    font-size: 12px;
    color: #b06000;
    margin-top: 4px;
  }
}
</style>
