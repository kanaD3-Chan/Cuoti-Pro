<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import type { ProposalCardData } from '@/types/chat'

defineProps<{
  data: ProposalCardData
}>()

const statusText = {
  pending: '待确认',
  running: '执行中',
  done: '已完成',
  error: '失败'
}
</script>

<template>
  <div class="proposal-card">
    <div class="proposal-card__header">
      <el-icon class="proposal-card__icon"><Loading /></el-icon>
      <span class="proposal-card__title">Agent 计划</span>
      <span class="proposal-card__status" :class="data.status || 'running'">{{ statusText[data.status || 'running'] }}</span>
    </div>
    <div class="proposal-card__body">
      <p>{{ data.description }}</p>
      <div v-if="data.tool_name" class="proposal-card__tool">
        工具：{{ data.tool_name }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.proposal-card {
  background: var(--cuoti-primary-soft);
  border: 1px solid rgba(26, 115, 232, 0.15);
  border-radius: var(--cuoti-radius-md);
  padding: 12px 14px;
  min-width: 240px;

  &__header {
    @include flex-center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__icon {
    color: var(--cuoti-primary);
    font-size: 16px;
  }

  &__title {
    font-weight: 600;
    color: var(--cuoti-text-primary);
    font-size: 13px;
  }

  &__status {
    margin-left: auto;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: var(--cuoti-radius-full);
    background: var(--cuoti-bg-hover);
    color: var(--cuoti-text-secondary);

    &.running {
      background: rgba(26, 115, 232, 0.1);
      color: var(--cuoti-primary);
    }

    &.done {
      background: rgba(30, 142, 62, 0.1);
      color: var(--cuoti-success);
    }

    &.error {
      background: rgba(217, 48, 37, 0.1);
      color: var(--cuoti-danger);
    }
  }

  &__body {
    font-size: 13px;
    color: var(--cuoti-text-secondary);
    line-height: 1.5;

    p {
      margin: 0 0 6px;
    }
  }

  &__tool {
    font-size: 11px;
    color: var(--cuoti-text-tertiary);
    font-family: monospace;
  }
}
</style>
