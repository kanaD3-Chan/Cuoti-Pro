<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Plus,
  Edit,
  Delete,
  MoreFilled,
  Notebook,
  ChatLineRound,
  User,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChatStore } from '@/stores/chatStore'
import type { Session } from '@/types/chat'

const props = defineProps<{
  collapsed: boolean
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'open-error-book'): void
  (e: 'open-weakness'): void
  (e: 'open-profile'): void
}>()

const store = useChatStore()
const route = useRoute()
const router = useRouter()

const creating = ref(false)
const menuId = ref<string | null>(null)

/* —— 新对话 —— */
async function newChat() {
  creating.value = true
  try {
    const s = await store.createSession()
    await router.push(`/chat/${s.id}`)
  } finally {
    creating.value = false
  }
}

/* —— 切换会话 —— */
async function selectSession(id: string) {
  await store.switchSession(id)
  await router.push(`/chat/${id}`)
}

/* —— 会话操作菜单 —— */
function onMenuToggle(id: string, visible: boolean) {
  menuId.value = visible ? id : null
}

async function renameSession(s: Session) {
  try {
    const { value } = await ElMessageBox.prompt('请输入新的会话标题', '重命名会话', {
      inputValue: s.title,
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputValidator: (v) => !!v?.trim() || '标题不能为空'
    })
    await store.renameSession(s.id, value.trim())
    ElMessage.success('已重命名')
  } catch {
    /* 取消 */
  }
}

async function deleteSession(s: Session) {
  try {
    await ElMessageBox.confirm(
      `确定删除会话「${s.title}」吗？此操作不可恢复。`,
      '删除会话',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
    await store.deleteSession(s.id)
    if (store.sessions.length) {
      await selectSession(store.sessions[0].id)
    } else {
      await router.push('/chat')
    }
    ElMessage.success('已删除')
  } catch {
    /* 取消 */
  }
}

/* —— 时间格式化 —— */
function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  const yest = new Date(now)
  yest.setDate(now.getDate() - 1)
  if (d.toDateString() === yest.toDateString()) return '昨天'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/* —— 会话分组 —— */
const sessionGroups = computed(() => {
  const today: Session[] = []
  const earlier: Session[] = []
  const now = new Date()
  for (const s of store.sessions) {
    const d = new Date(s.updated_at)
    const diff = (now.getTime() - d.getTime()) / 86400_000
    if (diff < 1) today.push(s)
    else earlier.push(s)
  }
  return [
    { label: '今天', items: today },
    { label: '更早', items: earlier }
  ].filter((g) => g.items.length)
})

const isChatRoute = computed(() => route.path.startsWith('/chat'))
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: props.collapsed }">
    <!-- 顶部：Logo + 菜单按钮 -->
    <div class="app-sidebar__header">
      <div v-if="!props.collapsed" class="brand">
        <img src="/logo.jpg" alt="智能错题Agent" class="brand__logo" />
        <span class="brand__title">智能错题Agent</span>
      </div>
      <button class="menu-toggle" @click="emit('toggle')">
        <el-icon><component :is="props.collapsed ? Expand : Fold" /></el-icon>
      </button>
    </div>

    <!-- 新对话按钮 -->
    <div class="app-sidebar__action">
      <button class="new-chat-btn" :disabled="creating" @click="newChat">
        <el-icon><Plus /></el-icon>
        <span v-if="!props.collapsed">新建对话</span>
      </button>
    </div>

    <!-- 会话列表 -->
    <div class="app-sidebar__list">
      <template v-if="!props.collapsed">
        <div v-for="group in sessionGroups" :key="group.label" class="session-group">
          <div class="session-group__label">{{ group.label }}</div>
          <div
            v-for="s in group.items"
            :key="s.id"
            class="session-item"
            :class="{ active: s.id === store.currentSessionId && isChatRoute }"
            @click="selectSession(s.id)"
          >
            <el-icon class="session-item__icon"><ChatLineRound /></el-icon>
            <div class="session-item__main">
              <div class="session-item__title cuoti-ellipsis">{{ s.title }}</div>
              <div class="session-item__sub cuoti-ellipsis">
                {{ s.last_message_preview || fmtTime(s.updated_at) }}
              </div>
            </div>
            <el-dropdown
              trigger="click"
              placement="bottom-end"
              @visible-change="(v: boolean) => onMenuToggle(s.id, v)"
              @command="(cmd: string) => cmd === 'rename' ? renameSession(s) : deleteSession(s)"
            >
              <button
                class="session-item__more"
                :class="{ visible: menuId === s.id || s.id === store.currentSessionId }"
                @click.stop
              >
                <el-icon><MoreFilled /></el-icon>
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="rename" :icon="Edit">重命名</el-dropdown-item>
                  <el-dropdown-item command="delete" :icon="Delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div v-if="!store.sessions.length" class="empty-state">
          <div class="empty-state__icon">💬</div>
          <div class="empty-state__text">还没有对话</div>
          <div class="empty-state__sub">点击「新建对话」开始</div>
        </div>
      </template>
    </div>

    <!-- 底部功能入口 -->
    <div class="app-sidebar__footer">
      <button class="footer-btn" @click="emit('open-error-book')">
        <el-icon><Notebook /></el-icon>
        <span v-if="!props.collapsed">错题本</span>
      </button>
      <button class="footer-btn" @click="emit('open-weakness')">
        <el-icon><ChatLineRound /></el-icon>
        <span v-if="!props.collapsed">薄弱点分析</span>
      </button>
      <button class="footer-btn" @click="emit('open-profile')">
        <el-icon><User /></el-icon>
        <span v-if="!props.collapsed">个人中心</span>
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.app-sidebar {
  width: var(--cuoti-sidebar-width);
  height: 100%;
  background: var(--cuoti-bg-sidebar);
  border-right: 1px solid var(--cuoti-divider);
  display: flex;
  flex-direction: column;
  transition: width var(--cuoti-transition-normal);
  overflow: hidden;

  &.collapsed {
    width: var(--cuoti-sidebar-collapsed);
  }

  &__header {
    @include flex-center;
    justify-content: space-between;
    padding: 14px 12px 10px;
    gap: var(--cuoti-gap-sm);

    .menu-toggle {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      color: var(--cuoti-text-secondary);
      @include flex-center;
      font-size: 18px;
      flex-shrink: 0;
      transition: background var(--cuoti-transition-fast);

      &:hover {
        background: var(--cuoti-bg-hover);
      }
    }

    .brand {
      @include flex-center;
      gap: var(--cuoti-gap-sm);
      min-width: 0;
      flex: 1;

      &__logo {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }

      &__title {
        font-size: 15px;
        font-weight: 600;
        color: var(--cuoti-text-primary);
      }
    }
  }

  &__action {
    padding: 4px 12px 8px;
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;
    @include scrollbar;
  }

  &__footer {
    padding: 8px 12px 12px;
    border-top: 1px solid var(--cuoti-divider);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.new-chat-btn {
  @include flex-center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-radius: var(--cuoti-radius-lg);
  background: var(--cuoti-bg-app);
  color: var(--cuoti-text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--cuoti-shadow-1);
  transition: box-shadow var(--cuoti-transition-fast), transform 0.1s;

  &:hover {
    box-shadow: var(--cuoti-shadow-2);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
}

.session-group {
  margin-bottom: var(--cuoti-gap-sm);

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: var(--cuoti-text-tertiary);
    padding: 8px 12px 4px;
  }
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--cuoti-radius-md);
  cursor: pointer;
  transition: background var(--cuoti-transition-fast);
  margin-bottom: 2px;

  &:hover {
    background: var(--cuoti-bg-hover);
  }

  &.active {
    background: var(--cuoti-bg-active);
  }

  &__icon {
    font-size: 16px;
    color: var(--cuoti-text-tertiary);
    flex-shrink: 0;
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--cuoti-text-primary);
    line-height: 1.4;
  }

  &__sub {
    font-size: 11px;
    color: var(--cuoti-text-tertiary);
    margin-top: 2px;
  }

  &__more {
    width: 26px;
    height: 26px;
    border: none;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    color: var(--cuoti-text-tertiary);
    @include flex-center;
    opacity: 0;
    transition: opacity var(--cuoti-transition-fast), background var(--cuoti-transition-fast);

    &.visible {
      opacity: 1;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.06);
    }
  }

  &:hover &__more {
    opacity: 1;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: var(--cuoti-text-tertiary);

  &__icon {
    font-size: 36px;
  }

  &__text {
    font-size: 14px;
    margin-top: 8px;
    color: var(--cuoti-text-secondary);
  }

  &__sub {
    font-size: 12px;
    margin-top: 4px;
  }
}

.footer-btn {
  @include flex-center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: var(--cuoti-radius-md);
  background: transparent;
  color: var(--cuoti-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: background var(--cuoti-transition-fast), color var(--cuoti-transition-fast);

  &:hover {
    background: var(--cuoti-bg-hover);
    color: var(--cuoti-primary);
  }
}

@include mobile {
  .app-sidebar {
    border-right: none;
  }
}
</style>
