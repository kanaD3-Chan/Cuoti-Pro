<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

function login() {
  if (!username.value.trim() || !password.value.trim()) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  setTimeout(() => {
    const ok = userStore.login(username.value, password.value)
    if (ok) {
      ElMessage.success('登录成功')
      router.push('/chat')
    } else {
      ElMessage.error('登录失败')
    }
    loading.value = false
  }, 500)
}
</script>

<template>
  <div class="login-view">
    <div class="login-card">
      <div class="login-card__brand">
        <img src="/logo.jpg" alt="智能错题 Agent" class="brand-logo" />
        <h1 class="brand-title">智能错题 Agent</h1>
        <p class="brand-subtitle">登录后开始你的 AI 学习助手</p>
      </div>

      <div class="login-form">
        <div class="form-item">
          <el-icon class="form-icon"><User /></el-icon>
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            class="form-input"
            @keydown.enter="login"
          />
        </div>
        <div class="form-item">
          <el-icon class="form-icon"><Lock /></el-icon>
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            class="form-input"
            @keydown.enter="login"
          />
        </div>
        <button class="login-btn" :disabled="loading" @click="login">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </div>

      <div class="login-tip">
        Mock 模式：任意非空用户名密码均可登录
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-view {
  width: 100%;
  height: 100%;
  @include flex-center;
  background: var(--cuoti-bg-app);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--cuoti-bg-card);
  border-radius: var(--cuoti-radius-lg);
  box-shadow: var(--cuoti-shadow-3);
  padding: 40px 32px;

  &__brand {
    text-align: center;
    margin-bottom: 32px;
  }
}

.brand-logo {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  border-radius: 20px;
  object-fit: cover;
  display: block;
  box-shadow: 0 8px 24px rgba(26, 115, 232, 0.35);
}

.brand-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--cuoti-text-primary);
  margin: 0 0 6px;
}

.brand-subtitle {
  font-size: 14px;
  color: var(--cuoti-text-secondary);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--cuoti-border);
  border-radius: var(--cuoti-radius-md);
  background: var(--cuoti-bg-app);
  transition: border-color var(--cuoti-transition-fast);

  &:focus-within {
    border-color: var(--cuoti-primary);
  }
}

.form-icon {
  color: var(--cuoti-text-tertiary);
  font-size: 18px;
}

.form-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--cuoti-text-primary);

  &::placeholder {
    color: var(--cuoti-text-tertiary);
  }
}

.login-btn {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: var(--cuoti-radius-md);
  background: var(--cuoti-primary-gradient);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--cuoti-transition-fast), transform 0.1s;

  &:hover {
    opacity: 0.92;
  }

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
}

.login-tip {
  text-align: center;
  font-size: 12px;
  color: var(--cuoti-text-tertiary);
  margin-top: 20px;
}

@include mobile {
  .login-card {
    padding: 32px 24px;
  }
}
</style>
