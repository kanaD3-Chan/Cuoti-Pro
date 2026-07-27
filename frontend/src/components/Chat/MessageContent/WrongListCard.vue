<script setup lang="ts">
import { Calendar, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { WrongListCardData, WrongQuestionItem } from '@/types/chat'

defineProps<{
  data: WrongListCardData
}>()

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function viewDetail(item: WrongQuestionItem) {
  ElMessage.info(`查看错题详情：${item.knowledge_point}（后端就绪后调 /api/wrong-questions/${item.id}）`)
}
</script>

<template>
  <div class="wrong-list-card">
    <div class="wrong-list-card__header">
      <span class="title">我的错题本</span>
      <span class="count">共 {{ data.items.length }} 题</span>
    </div>

    <div class="wrong-list">
      <div
        v-for="item in data.items"
        :key="item.id"
        class="wrong-item"
        @click="viewDetail(item)"
      >
        <div class="wrong-item__main">
          <div class="wrong-item__subject">{{ item.subject }}</div>
          <div class="wrong-item__knowledge cuoti-ellipsis">{{ item.knowledge_point }}</div>
          <div class="wrong-item__reason">{{ item.reason_summary }}</div>
          <div class="wrong-item__time">
            <el-icon><Calendar /></el-icon>
            {{ fmtDate(item.archived_at) }}
          </div>
        </div>
        <el-icon class="wrong-item__arrow"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrong-list-card {
  background: var(--cuoti-bg-card);
  border: 1px solid var(--cuoti-border);
  border-radius: var(--cuoti-radius-lg);
  padding: 16px;
  box-shadow: var(--cuoti-shadow-1);
  min-width: 280px;

  &__header {
    @include flex-between;
    margin-bottom: 12px;

    .title {
      font-size: 15px;
      font-weight: 600;
      color: var(--cuoti-text-primary);
    }

    .count {
      font-size: 12px;
      color: var(--cuoti-text-tertiary);
    }
  }
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wrong-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--cuoti-divider);
  border-radius: var(--cuoti-radius-md);
  background: var(--cuoti-bg-app);
  cursor: pointer;
  transition: all var(--cuoti-transition-fast);

  &:hover {
    border-color: var(--cuoti-primary);
    background: var(--cuoti-primary-soft);
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__subject {
    font-size: 11px;
    color: var(--cuoti-primary);
    font-weight: 600;
    width: fit-content;
  }

  &__knowledge {
    font-size: 14px;
    font-weight: 600;
    color: var(--cuoti-text-primary);
  }

  &__reason {
    font-size: 12px;
    color: var(--cuoti-text-secondary);
    line-height: 1.4;
  }

  &__time {
    @include flex-center;
    justify-content: flex-start;
    gap: 4px;
    font-size: 11px;
    color: var(--cuoti-text-tertiary);
  }

  &__arrow {
    color: var(--cuoti-text-tertiary);
    font-size: 16px;
  }
}
</style>
