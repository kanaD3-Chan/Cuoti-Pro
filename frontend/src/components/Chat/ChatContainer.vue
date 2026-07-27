<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import ChatMessage from './ChatMessage.vue'
import ChatWelcome from './ChatWelcome.vue'

const store = useChatStore()
const containerRef = ref<HTMLElement | null>(null)
const shouldScrollBottom = ref(true)

const hasMessages = computed(() => store.visibleMessages.length > 0)

function scrollToBottom() {
  nextTick(() => {
    const el = containerRef.value
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth'
    })
  })
}

function onScroll() {
  const el = containerRef.value
  if (!el) return
  const threshold = 60
  shouldScrollBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

watch(
  () => store.visibleMessages.length,
  () => {
    if (shouldScrollBottom.value) scrollToBottom()
  }
)

watch(
  () => store.visibleMessages.map((m) => m.content + (m.card_data ? JSON.stringify(m.card_data) : '')).join(''),
  () => {
    if (store.isStreaming && shouldScrollBottom.value) {
      scrollToBottom()
    }
  }
)

function useSuggestion(prompt: string) {
  store.sendMessage(prompt, [])
}
</script>

<template>
  <div ref="containerRef" class="chat-container" @scroll="onScroll">
    <ChatWelcome v-if="!hasMessages" @use-suggestion="useSuggestion" />

    <div v-else class="chat-container__messages">
      <ChatMessage
        v-for="msg in store.visibleMessages"
        :key="msg.id"
        :message="msg"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 0;
  @include scrollbar;

  &__messages {
    max-width: var(--cuoti-max-content-width);
    margin: 0 auto;
    padding: 0 24px;

    @include mobile {
      padding: 0 16px;
    }
  }
}
</style>
