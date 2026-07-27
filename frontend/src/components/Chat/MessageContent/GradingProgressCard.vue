<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import type { GradingProgressCardData } from '@/types/chat'

defineProps<{
  data: GradingProgressCardData
}>()
</script>

<template>
  <div class="grading-progress-card">
    <div class="grading-progress-card__header">
      <el-icon class="grading-progress-card__icon"><Loading /></el-icon>
      <div class="grading-progress-card__title">正在批改</div>
    </div>
    <div class="grading-progress-card__body">
      <div class="info-row">
        <span class="info-label">文件名：</span>
        <span class="info-value">{{ data.filename }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">学科：</span>
        <span class="info-value">{{ data.subject }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">当前阶段：</span>
        <span class="info-value step">{{ data.step }}</span>
      </div>
      <el-progress
        v-if="data.progress !== undefined"
        :percentage="data.progress"
        :stroke-width="6"
        :show-text="true"
        status="success"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.grading-progress-card {
  background: var(--cuoti-bg-card);
  border: 1px solid var(--cuoti-border);
  border-radius: var(--cuoti-radius-md);
  padding: 16px;
  min-width: 280px;
  box-shadow: var(--cuoti-shadow-1);

  &__header {
    @include flex-center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__icon {
    color: var(--cuoti-primary);
    font-size: 18px;
    animation: cuoti-spin 1s linear infinite;
  }

  &__title {
    font-weight: 600;
    color: var(--cuoti-text-primary);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .info-row {
    font-size: 13px;
  }

  .info-label {
    color: var(--cuoti-text-tertiary);
  }

  .info-value {
    color: var(--cuoti-text-primary);
    font-weight: 500;

    &.step {
      color: var(--cuoti-primary);
    }
  }
}

@keyframes cuoti-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
