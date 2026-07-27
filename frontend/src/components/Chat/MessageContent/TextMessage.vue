<script setup lang="ts">
defineProps<{
  content: string
  streaming?: boolean
}>()
</script>

<template>
  <div class="text-message" :class="{ 'cuoti-caret': streaming && content }">
    <pre v-if="content">{{ content }}</pre>
    <div v-else-if="streaming" class="thinking-dots">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.text-message {
  pre {
    margin: 0;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .thinking-dots {
    display: inline-flex;
    gap: 4px;
    padding: 2px 0;

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--cuoti-text-tertiary);
      animation: cuoti-pulse 1.2s ease-in-out infinite;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}
</style>
