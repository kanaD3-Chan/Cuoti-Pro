<script setup lang="ts">
import { useChatStore } from '@/stores/chatStore'

const store = useChatStore()

const suggestions = [
  { icon: '📝', title: '批改作业', desc: '上传试卷图片，AI 自动识别并批改', prompt: '帮我批改这份作业' },
  { icon: '🔍', title: '查错题', desc: '查看所有错题，按知识点归纳', prompt: '查看我的错题本' },
  { icon: '💡', title: '薄弱点讲解', desc: '针对错题给出详细知识点讲解', prompt: '帮我讲解勾股定理' },
  { icon: '📊', title: '学习报告', desc: '生成本周学习情况总结', prompt: '给我生成一份学习报告' }
]

const emit = defineEmits<{
  (e: 'use-suggestion', prompt: string): void
}>()
</script>

<template>
  <div class="chat-welcome">
    <div class="chat-welcome__hero">
      <img src="/logo.jpg" alt="智学错题助手" class="chat-welcome__logo" />
      <h1 class="chat-welcome__title">你好，我是智学错题助手</h1>
      <p class="chat-welcome__subtitle">上传作业让我批改 · 查询错题 · 获取薄弱点讲解</p>
    </div>

    <div class="chat-welcome__suggestions">
      <button
        v-for="s in suggestions"
        :key="s.title"
        class="suggestion-card"
        :disabled="store.isStreaming"
        @click="emit('use-suggestion', s.prompt)"
      >
        <span class="suggestion-card__icon">{{ s.icon }}</span>
        <span class="suggestion-card__title">{{ s.title }}</span>
        <span class="suggestion-card__desc">{{ s.desc }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-welcome {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  max-width: var(--cuoti-max-content-width);
  margin: 0 auto;

  &__hero {
    text-align: center;
    margin-bottom: 40px;
  }

  &__logo {
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
    border-radius: 20px;
    object-fit: cover;
    box-shadow: 0 8px 24px rgba(26, 115, 232, 0.35);
  }

  &__title {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px;
    background: var(--cuoti-primary-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subtitle {
    font-size: 14px;
    color: var(--cuoti-text-secondary);
    margin: 0;
  }

  &__suggestions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    max-width: 720px;
    width: 100%;
  }
}

.suggestion-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  flex: 0 1 220px;
  min-width: 200px;
  border: 1px solid var(--cuoti-border);
  border-radius: var(--cuoti-radius-md);
  background: var(--cuoti-bg-card);
  cursor: pointer;
  text-align: left;
  transition: all var(--cuoti-transition-fast);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    border-color: var(--cuoti-primary);
    background: var(--cuoti-primary-soft);
    transform: translateY(-2px);
    box-shadow: var(--cuoti-shadow-2);
  }

  &__icon {
    font-size: 22px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--cuoti-text-primary);
  }

  &__desc {
    font-size: 12px;
    color: var(--cuoti-text-tertiary);
  }
}

@include mobile {
  .chat-welcome__title {
    font-size: 22px;
  }

  .chat-welcome__suggestions {
    flex-direction: column;
    align-items: stretch;

    .suggestion-card {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
}
</style>
