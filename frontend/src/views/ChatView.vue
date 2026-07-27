<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import AppSidebar from '@/components/Layout/AppSidebar.vue'
import AppHeader from '@/components/Layout/AppHeader.vue'
import ChatContainer from '@/components/Chat/ChatContainer.vue'
import ChatInput from '@/components/Chat/ChatInput.vue'
import ErrorBookDrawer from '@/components/ErrorBookDrawer.vue'
import ProfileDrawer from '@/components/ProfileDrawer.vue'

const store = useChatStore()
const route = useRoute()
const router = useRouter()

const sidebarCollapsed = ref(false)
const sidebarVisible = ref(false)
const errorBookVisible = ref(false)
const profileVisible = ref(false)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    sidebarVisible.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  store.loadSessions().then(() => {
    const sid = route.params.sessionId as string | undefined
    if (sid) {
      store.switchSession(sid)
    } else if (store.sessions.length) {
      router.replace(`/chat/${store.sessions[0].id}`)
    }
  })
})

watch(
  () => route.params.sessionId,
  (sid) => {
    if (sid && typeof sid === 'string' && sid !== store.currentSessionId) {
      store.switchSession(sid)
    }
  }
)

function onSend(text: string, files: File[]) {
  if (!store.currentSessionId) {
    store.createSession().then(() => store.sendMessage(text, files))
    return
  }
  store.sendMessage(text, files)
}

function openErrorBook() {
  errorBookVisible.value = true
}

function openWeakness() {
  onSend('帮我分析薄弱点', [])
}

function openReport() {
  onSend('给我生成一份学习报告', [])
}

function openProfile() {
  profileVisible.value = true
}

function toggleSidebar() {
  if (isMobile.value) {
    sidebarVisible.value = !sidebarVisible.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}
</script>

<template>
  <div class="chat-view">
    <!-- 桌面端侧边栏 -->
    <AppSidebar
      v-if="!isMobile"
      :collapsed="sidebarCollapsed"
      :is-mobile="false"
      @toggle="toggleSidebar"
      @open-error-book="openErrorBook"
      @open-weakness="openWeakness"
      @open-profile="openProfile"
    />

    <!-- 移动端抽屉 -->
    <el-drawer
      v-else
      v-model="sidebarVisible"
      direction="ltr"
      size="260px"
      :with-header="false"
      class="mobile-sidebar-drawer"
    >
      <AppSidebar
        :collapsed="false"
        :is-mobile="true"
        @toggle="sidebarVisible = false"
        @open-error-book="openErrorBook"
        @open-weakness="openWeakness"
        @open-profile="openProfile"
      />
    </el-drawer>

    <!-- 主内容区 -->
    <main class="chat-view__main">
      <AppHeader :is-mobile="isMobile" @toggle-sidebar="toggleSidebar" />

      <ChatContainer />

      <footer class="chat-view__footer">
        <div class="input-wrapper">
          <ChatInput
            :is-streaming="store.isStreaming"
            @send="onSend"
            @open-error-book="openErrorBook"
            @open-weakness="openWeakness"
            @open-report="openReport"
          />
          <div class="footer-tip">智学错题 Agent 可能会出错，重要信息请二次核对。</div>
        </div>
      </footer>
    </main>

    <!-- 错题本抽屉 -->
    <ErrorBookDrawer v-model:visible="errorBookVisible" />

    <!-- 个人中心抽屉 -->
    <ProfileDrawer v-model:visible="profileVisible" />
  </div>
</template>

<style scoped lang="scss">
.chat-view {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--cuoti-bg-app);
  overflow: hidden;

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
  }

  &__footer {
    flex-shrink: 0;
    padding: 0 24px 16px;
    background: var(--cuoti-bg-app);

    .input-wrapper {
      max-width: var(--cuoti-max-content-width);
      margin: 0 auto;
      width: 100%;
    }

    .footer-tip {
      text-align: center;
      font-size: 11px;
      color: var(--cuoti-text-tertiary);
      margin-top: 8px;
    }
  }
}

@include mobile {
  .chat-view__footer {
    padding: 0 12px 12px;
  }
}
</style>
