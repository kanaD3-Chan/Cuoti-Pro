<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types/chat'
import AgentReplyContent from './MessageContent/AgentReplyContent.vue'

const props = defineProps<{
  message: Message
}>()

const isStudent = computed(() => props.message.role === 'student')
const isAgent = computed(() => props.message.role === 'agent')

function fmtSize(n = 0) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function isImage(type: string) {
  return type.startsWith('image/')
}
</script>

<template>
  <div class="chat-message" :class="{ 'is-student': isStudent, 'is-agent': isAgent }">
    <!-- Agent 头像 -->
    <div v-if="isAgent" class="chat-message__avatar">
      <img src="/logo.jpg" alt="智学错题助手" class="chat-message__avatar-img" />
    </div>

    <div class="chat-message__col">
      <div class="chat-message__bubble" :class="{ streaming: message.streaming }">
        <AgentReplyContent v-if="isAgent" :message="message" />
        <div
          v-else-if="message.content"
          class="chat-message__text"
          :class="{ 'cuoti-caret': message.streaming }"
        >
          {{ message.content }}
        </div>
      </div>

      <!-- 学生附件 -->
      <div v-if="message.attachments?.length" class="chat-message__attachments">
        <div
          v-for="att in message.attachments"
          :key="att.id"
          class="att-chip"
          :class="{ 'is-error': att.status === 'error' }"
        >
          <img v-if="att.url && isImage(att.type)" :src="att.url" class="att-chip__thumb" />
          <div class="att-chip__info">
            <span class="att-chip__name cuoti-ellipsis">{{ att.name }}</span>
            <span class="att-chip__size">{{ fmtSize(att.size) }}</span>
          </div>
          <el-progress
            v-if="att.status === 'uploading'"
            :percentage="att.progress || 0"
            :stroke-width="2"
            :show-text="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-start;

  &.is-student {
    flex-direction: row-reverse;

    .chat-message__bubble {
      background: var(--cuoti-primary-gradient);
      color: var(--cuoti-text-on-primary);
      border: none;
    }

    .chat-message__text {
      color: var(--cuoti-text-on-primary);
    }

    .chat-message__attachments {
      align-items: flex-end;
    }

    .att-chip {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
    }
  }

  &__avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
    background: var(--cuoti-primary-gradient);
    @include flex-center;
    box-shadow: var(--cuoti-shadow-1);

    &-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__col {
    max-width: min(780px, 82%);
    display: flex;
    flex-direction: column;

    @include mobile {
      max-width: min(720px, 88%);
    }
  }

  &__bubble {
    padding: 12px 16px;
    border-radius: var(--cuoti-radius-lg);
    background: var(--cuoti-bg-card);
    color: var(--cuoti-text-primary);
    line-height: 1.65;
    font-size: 14px;
    word-break: break-word;
    box-shadow: var(--cuoti-shadow-1);

    &.streaming {
      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.12);
    }
  }

  &__text {
    white-space: pre-wrap;
  }

  &__attachments {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
    align-items: flex-start;
  }
}

.att-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--cuoti-primary-soft);
  border-radius: var(--cuoti-radius-sm);
  font-size: 12px;
  color: var(--cuoti-text-secondary);
  min-width: 160px;
  max-width: 300px;

  &__thumb {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: var(--cuoti-radius-sm);
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-weight: 500;
  }

  &__size {
    color: var(--cuoti-text-tertiary);
    font-size: 11px;
  }

  .el-progress {
    width: 100%;
  }

  &.is-error {
    background: #fef6f5;
    color: var(--cuoti-danger);
  }
}
</style>
