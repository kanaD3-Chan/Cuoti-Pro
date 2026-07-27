<script setup lang="ts">
import { computed } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chatStore'

const props = defineProps<{
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const store = useChatStore()

const currentTitle = computed(() => store.currentSession?.title || '智能错题 Agent')

const statusClass = computed(() => {
  switch (store.connectionState) {
    case 'open':
      return 'ok'
    case 'connecting':
      return 'connecting'
    case 'error':
    case 'closed':
      return 'err'
    default:
      return 'idle'
  }
})

const statusText = computed(() => {
  switch (store.connectionState) {
    case 'open':
      return '已连接'
    case 'connecting':
      return '连接中...'
    case 'error':
      return '连接异常'
    case 'closed':
      return '未连接'
    default:
      return 'Mock 模式'
  }
})
</script>

<template>
  <header class="app-header">
    <div class="app-header__left">
      <button v-if="props.isMobile" class="icon-btn" @click="emit('toggle-sidebar')">
        <el-icon><MoreFilled /></el-icon>
      </button>
      <span class="app-header__title cuoti-ellipsis">{{ currentTitle }}</span>
    </div>

    <div class="app-header__right">
      <div class="connection-status">
        <span class="connection-status__dot" :class="statusClass" />
        <span class="connection-status__text">{{ statusText }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  height: var(--cuoti-header-height);
  flex-shrink: 0;
  @include flex-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--cuoti-divider);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);

  &__left {
    @include flex-center;
    gap: var(--cuoti-gap-sm);
    min-width: 0;
    flex: 1;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--cuoti-text-primary);
  }

  &__right {
    @include flex-center;
    gap: var(--cuoti-gap-md);
  }
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: var(--cuoti-text-secondary);
  @include flex-center;
  font-size: 18px;
  transition: background var(--cuoti-transition-fast);

  &:hover {
    background: var(--cuoti-bg-hover);
  }
}

.connection-status {
  @include flex-center;
  gap: 6px;
  font-size: 12px;
  color: var(--cuoti-text-tertiary);

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--cuoti-text-tertiary);

    &.ok {
      background: var(--cuoti-success);
      box-shadow: 0 0 0 3px rgba(30, 142, 62, 0.15);
    }

    &.connecting {
      background: var(--cuoti-warning);
      animation: cuoti-pulse 1s ease-in-out infinite;
    }

    &.err {
      background: var(--cuoti-danger);
    }
  }
}

@include mobile {
  .app-header {
    padding: 0 16px;
  }
}
</style>
