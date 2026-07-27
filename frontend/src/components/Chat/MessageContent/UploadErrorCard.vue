<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'
import type { UploadErrorCardData, UploadErrorCode } from '@/types/chat'

defineProps<{
  data: UploadErrorCardData
}>()

const codeMap: Record<UploadErrorCode, string> = {
  FILE_TOO_LARGE: '文件过大',
  PAGE_TOO_MANY: '页数过多',
  FORMAT_UNSUPPORTED: '格式不支持',
  UNKNOWN: '未知错误'
}
</script>

<template>
  <div class="upload-error-card">
    <div class="upload-error-card__header">
      <el-icon class="upload-error-card__icon"><Warning /></el-icon>
      <span class="upload-error-card__title">上传失败</span>
    </div>
    <div class="upload-error-card__body">
      <div class="info-row">
        <span class="info-label">文件名：</span>
        <span class="info-value">{{ data.filename }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">原因：</span>
        <span class="info-value reason">{{ data.reason }}</span>
      </div>
      <div v-if="data.code" class="error-code">错误码：{{ codeMap[data.code] || data.code }}</div>
      <div class="advice">建议：请检查文件格式与大小后重新上传，或换一张清晰的作业照片。</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.upload-error-card {
  background: #fef6f5;
  border: 1px solid rgba(217, 48, 37, 0.25);
  border-radius: var(--cuoti-radius-md);
  padding: 14px;
  min-width: 260px;

  &__header {
    @include flex-center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__icon {
    color: var(--cuoti-danger);
    font-size: 18px;
  }

  &__title {
    font-weight: 600;
    color: var(--cuoti-danger);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .info-row {
    font-size: 13px;
  }

  .info-label {
    color: var(--cuoti-text-tertiary);
  }

  .info-value {
    color: var(--cuoti-text-primary);

    &.reason {
      color: var(--cuoti-danger);
      font-weight: 500;
    }
  }

  .error-code {
    font-size: 11px;
    color: var(--cuoti-text-tertiary);
  }

  .advice {
    font-size: 12px;
    color: var(--cuoti-text-secondary);
    line-height: 1.5;
    margin-top: 4px;
  }
}
</style>
