<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage, ElDropdown } from 'element-plus'
import {
  Promotion,
  Plus,
  Close,
  Picture,
  Document,
  Upload,
  Notebook,
  ChatDotRound,
  DataLine
} from '@element-plus/icons-vue'

const props = defineProps<{
  isStreaming: boolean
}>()

const emit = defineEmits<{
  (e: 'send', text: string, files: File[]): void
  (e: 'open-error-book'): void
  (e: 'open-weakness'): void
  (e: 'open-report'): void
}>()

const text = ref('')
const files = ref<File[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const dropdownVisible = ref(false)

const MAX_SIZE = 10 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'application/pdf']
const ACCEPT_ATTR = '.jpg,.jpeg,.png,.pdf'

function validateFile(file: File): string | null {
  const typeOk = ACCEPTED.includes(file.type) || /\.(jpe?g|png|pdf)$/i.test(file.name)
  if (!typeOk) return '仅支持 JPG / PNG / PDF 格式'
  if (file.size > MAX_SIZE) return '文件超过 10MB'
  return null
}

function onPickFile() {
  fileInputRef.value?.click()
  dropdownVisible.value = false
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  for (const file of Array.from(input.files)) {
    const err = validateFile(file)
    if (err) {
      ElMessage.warning(`${file.name}：${err}`)
      continue
    }
    files.value.push(file)
  }
  input.value = ''
}

function removeFile(idx: number) {
  files.value.splice(idx, 1)
}

function fileIcon(file: File) {
  return file.type.startsWith('image/') ? Picture : Document
}

function autoGrow() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

function onInput() {
  autoGrow()
}

const canSend = computed(
  () => !props.isStreaming && (text.value.trim().length > 0 || files.value.length > 0)
)

function send() {
  if (!canSend.value) return
  emit('send', text.value, files.value.slice())
  text.value = ''
  files.value = []
  nextTick(autoGrow)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    send()
  }
}

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function handleMenuCommand(cmd: string) {
  switch (cmd) {
    case 'upload':
      onPickFile()
      break
    case 'error-book':
      emit('open-error-book')
      break
    case 'weakness':
      emit('open-weakness')
      break
    case 'report':
      emit('open-report')
      break
  }
}

function quickPrompt(prompt: string) {
  if (props.isStreaming) return
  text.value = prompt
  nextTick(autoGrow)
  nextTick(() => textareaRef.value?.focus())
}
</script>

<template>
  <div class="chat-input">
    <!-- 附件预览 -->
    <div v-if="files.length" class="chat-input__files">
      <div v-for="(f, i) in files" :key="i" class="file-tag">
        <el-icon class="file-tag__icon"><component :is="fileIcon(f)" /></el-icon>
        <span class="file-tag__name cuoti-ellipsis">{{ f.name }}</span>
        <span class="file-tag__size">{{ fmtSize(f.size) }}</span>
        <el-icon class="file-tag__close" @click="removeFile(i)"><Close /></el-icon>
      </div>
    </div>

    <!-- 输入框主体 -->
    <div class="chat-input__bar" :class="{ 'is-disabled': isStreaming }">
      <!-- Gemini 风格功能菜单 -->
      <el-dropdown
        trigger="click"
        placement="top-start"
        :disabled="isStreaming"
        @command="handleMenuCommand"
        @visible-change="(v: boolean) => (dropdownVisible = v)"
      >
        <button
          class="icon-btn menu-btn"
          type="button"
          :disabled="isStreaming"
          :class="{ active: dropdownVisible }"
          title="更多功能"
        >
          <el-icon><Plus /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="chat-menu">
            <div class="menu-section">
              <div class="menu-section-title">上传与批改</div>
              <el-dropdown-item command="upload" :icon="Upload">上传作业 / 试卷</el-dropdown-item>
            </div>
            <div class="menu-section">
              <div class="menu-section-title">学习工具</div>
              <el-dropdown-item command="error-book" :icon="Notebook">查看错题本</el-dropdown-item>
              <el-dropdown-item command="weakness" :icon="ChatDotRound">薄弱点分析</el-dropdown-item>
              <el-dropdown-item command="report" :icon="DataLine">学习报告</el-dropdown-item>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <textarea
        ref="textareaRef"
        v-model="text"
        class="chat-input__textarea"
        rows="1"
        :placeholder="isStreaming ? 'Agent 正在回复中...' : '输入消息，或上传作业让 Agent 帮你批改'"
        :disabled="isStreaming"
        @input="onInput"
        @keydown="onKeydown"
      />

      <button
        class="send-btn"
        type="button"
        :disabled="!canSend"
        :class="{ active: canSend }"
        title="发送 (Enter)"
        @click="send"
      >
        <el-icon><Promotion /></el-icon>
      </button>

      <input
        ref="fileInputRef"
        type="file"
        :accept="ACCEPT_ATTR"
        multiple
        hidden
        @change="onFileChange"
      />
    </div>

    <!-- 快捷提示词 -->
    <div class="chat-input__hint">
      <div class="quick-prompts">
        <button
          v-for="p in [
            { label: '批改作业', text: '请帮我批改这份作业' },
            { label: '查错题', text: '查看我的错题本' },
            { label: '讲薄弱点', text: '帮我分析薄弱点' }
          ]"
          :key="p.label"
          class="quick-prompt"
          :disabled="isStreaming"
          @click="quickPrompt(p.text)"
        >
          {{ p.label }}
        </button>
      </div>
      <span v-if="isStreaming" class="streaming-hint">
        <span class="dot" /> 正在输入...
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-input {
  width: 100%;

  &__files {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cuoti-gap-sm);
    margin-bottom: var(--cuoti-gap-sm);
  }

  &__bar {
    display: flex;
    align-items: flex-end;
    gap: var(--cuoti-gap-sm);
    background: var(--cuoti-bg-input);
    border: 1px solid transparent;
    border-radius: var(--cuoti-radius-xl);
    padding: 8px 8px 8px 12px;
    box-shadow: 0 1px 3px rgba(60, 64, 67, 0.06);
    transition: border-color var(--cuoti-transition-normal), background var(--cuoti-transition-normal), box-shadow var(--cuoti-transition-normal);

    &:hover {
      background: var(--cuoti-bg-card);
      border-color: var(--cuoti-primary-light);
      box-shadow: 0 0 0 1px rgba(26, 115, 232, 0.15), 0 0 18px rgba(26, 115, 232, 0.12);
    }

    &:focus-within {
      background: var(--cuoti-bg-card);
      border-color: var(--cuoti-primary);
      box-shadow: 0 0 0 1px var(--cuoti-primary), 0 0 0 4px rgba(26, 115, 232, 0.12), 0 0 24px rgba(26, 115, 232, 0.22);
    }

    &.is-disabled {
      opacity: 0.7;
    }
  }

  &__textarea {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    resize: none;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    color: var(--cuoti-text-primary);
    max-height: 200px;
    padding: 6px 0;

    &::placeholder {
      color: var(--cuoti-text-tertiary);
    }
  }

  &__hint {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding: 0 4px;
    font-size: 11px;
    color: var(--cuoti-text-tertiary);

    .streaming-hint {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--cuoti-primary);

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--cuoti-primary);
        animation: cuoti-pulse 1s ease-in-out infinite;
      }
    }
  }
}

.icon-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: var(--cuoti-text-secondary);
  cursor: pointer;
  @include flex-center;
  font-size: 18px;
  transition: background var(--cuoti-transition-fast), color var(--cuoti-transition-fast);

  &:hover {
    background: var(--cuoti-bg-hover);
    color: var(--cuoti-primary);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.menu-btn {
    color: #5f6368;

    &:hover {
      background: #e8eaed;
      color: #202124;
    }

    &.active {
      background: #e8eaed;
      color: #1a73e8;
    }
  }
}

.menu-logo-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  padding: 0;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  transition: transform var(--cuoti-transition-fast), box-shadow var(--cuoti-transition-fast);

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 0 0 3px var(--cuoti-primary-soft);
  }

  &.active {
    box-shadow: 0 0 0 3px var(--cuoti-primary-light);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.send-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: var(--cuoti-divider);
  color: #fff;
  cursor: pointer;
  @include flex-center;
  font-size: 16px;
  transition: background var(--cuoti-transition-fast), transform 0.1s;

  &.active {
    background: var(--cuoti-primary-gradient);

    &:hover {
      transform: scale(1.06);
    }
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.file-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 10px;
  background: var(--cuoti-primary-soft);
  border-radius: var(--cuoti-radius-sm);
  font-size: 12px;
  color: var(--cuoti-text-secondary);
  max-width: 240px;

  &__icon {
    color: var(--cuoti-primary);
    font-size: 14px;
  }

  &__name {
    max-width: 140px;
  }

  &__size {
    color: var(--cuoti-text-tertiary);
    font-size: 11px;
  }

  &__close {
    cursor: pointer;
    color: var(--cuoti-text-tertiary);
    border-radius: 50%;
    padding: 2px;

    &:hover {
      color: var(--cuoti-danger);
      background: rgba(217, 48, 37, 0.1);
    }
  }
}

.quick-prompts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-prompt {
  padding: 4px 10px;
  border: 1px solid var(--cuoti-border);
  border-radius: var(--cuoti-radius-full);
  background: var(--cuoti-bg-card);
  color: var(--cuoti-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--cuoti-transition-fast);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    border-color: var(--cuoti-primary);
    color: var(--cuoti-primary);
    background: var(--cuoti-primary-soft);
  }
}

@include mobile {
  .chat-input__bar {
    padding: 6px;
  }

  .chat-input__hint {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>

<style>
.chat-menu {
  width: 280px;
  padding: 6px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.04);
  border: none;
}

.chat-menu .menu-section {
  padding: 0;
}

.chat-menu .menu-section:not(:first-child) {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #f1f3f4;
}

.chat-menu .menu-section-title {
  font-size: 11px;
  font-weight: 500;
  color: #9aa0a6;
  padding: 10px 12px 4px;
  letter-spacing: 0.2px;
  line-height: 1;
}

.chat-menu .el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 400;
  color: #3c4043;
  line-height: 1.5;
  margin: 1px 0;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.chat-menu .el-dropdown-menu__item .el-icon {
  margin-right: 0;
  font-size: 18px;
  color: #5f6368;
  flex-shrink: 0;
  transition: color 0.18s ease;
}

.chat-menu .el-dropdown-menu__item:hover {
  background: #f1f3f4;
  color: #1a73e8;
}

.chat-menu .el-dropdown-menu__item:hover .el-icon {
  color: #1a73e8;
}

.chat-menu .el-dropdown-menu__item:active {
  background: #e8f0fe;
}
</style>
