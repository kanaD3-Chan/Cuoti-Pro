<script setup lang="ts">
import type { Message } from '@/types/chat'
import TextMessage from './TextMessage.vue'
import ProposalCard from './ProposalCard.vue'
import GradingProgressCard from './GradingProgressCard.vue'
import ExerciseResultCard from './ExerciseResultCard.vue'
import WrongListCard from './WrongListCard.vue'
import UploadErrorCard from './UploadErrorCard.vue'

const props = defineProps<{
  message: Message
}>()

const cardData = props.message.card_data
</script>

<template>
  <div class="agent-reply-content">
    <!-- 纯文本或流式文本 -->
    <TextMessage
      v-if="message.card_type === 'text'"
      :content="message.content"
      :streaming="message.streaming"
    />

    <!-- 工具调用提案 -->
    <ProposalCard v-else-if="message.card_type === 'proposal' && cardData" :data="cardData as any" />

    <!-- 批改中 -->
    <GradingProgressCard
      v-else-if="message.card_type === 'grading_progress' && cardData"
      :data="cardData as any"
    />

    <!-- 批改结果 -->
    <ExerciseResultCard
      v-else-if="message.card_type === 'exercise_result' && cardData"
      :data="cardData as any"
    />

    <!-- 错题列表 -->
    <WrongListCard v-else-if="message.card_type === 'wrong_list' && cardData" :data="cardData as any" />

    <!-- 上传失败 -->
    <UploadErrorCard v-else-if="message.card_type === 'upload_error' && cardData" :data="cardData as any" />

    <!-- 兜底 -->
    <TextMessage v-else :content="message.content" :streaming="message.streaming" />
  </div>
</template>

<style scoped lang="scss">
.agent-reply-content {
  width: 100%;
}
</style>
