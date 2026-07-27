<script setup lang="ts">
import { ref, watch } from 'vue'
import { User, School } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const router = useRouter()
const userStore = useUserStore()

const nickname = ref(userStore.profile.nickname)
const grade = ref(userStore.profile.grade || '')
const school = ref(userStore.profile.school || '')
const mainSubject = ref(userStore.profile.mainSubject || '数学')
const fontSize = ref(14)
const darkMode = ref(false)

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      nickname.value = userStore.profile.nickname
      grade.value = userStore.profile.grade || ''
      school.value = userStore.profile.school || ''
      mainSubject.value = userStore.profile.mainSubject || '数学'
    }
  }
)

function save() {
  userStore.updateProfile({
    nickname: nickname.value,
    grade: grade.value,
    school: school.value,
    mainSubject: mainSubject.value
  })
  ElMessage.success('个人资料已保存')
  emit('update:visible', false)
}

function logout() {
  userStore.logout()
  emit('update:visible', false)
  router.push('/login')
}

function close() {
  emit('update:visible', false)
}
</script>

<template>
  <el-drawer
    v-model="props.visible"
    title="个人中心"
    direction="rtl"
    size="380px"
    class="profile-drawer"
    @closed="close"
  >
    <div class="profile">
      <!-- 头像 -->
      <div class="profile__header">
        <div class="avatar">
          <el-icon><User /></el-icon>
        </div>
        <div class="info">
          <div class="name">{{ userStore.profile.nickname }}</div>
          <div class="meta">{{ userStore.profile.grade }} · {{ userStore.profile.mainSubject }}</div>
        </div>
      </div>

      <!-- 表单 -->
      <div class="profile__section">
        <div class="section-title">基本信息</div>
        <div class="form-item">
          <label>昵称</label>
          <input v-model="nickname" type="text" class="form-input" />
        </div>
        <div class="form-item">
          <label>年级</label>
          <input v-model="grade" type="text" class="form-input" placeholder="如：高三" />
        </div>
        <div class="form-item">
          <label>学校</label>
          <div class="input-with-icon">
            <el-icon><School /></el-icon>
            <input v-model="school" type="text" class="form-input" placeholder="选填" />
          </div>
        </div>
        <div class="form-item">
          <label>主要学科</label>
          <select v-model="mainSubject" class="form-input">
            <option value="数学">数学</option>
            <option value="英语">英语</option>
            <option value="物理">物理</option>
            <option value="化学">化学</option>
            <option value="语文">语文</option>
          </select>
        </div>
      </div>

      <!-- 偏好设置 -->
      <div class="profile__section">
        <div class="section-title">偏好设置</div>
        <div class="form-item row">
          <label>字号</label>
          <div class="font-size-control">
            <span>A</span>
            <el-slider v-model="fontSize" :min="12" :max="18" :step="1" class="slider" />
            <span class="large">A</span>
          </div>
        </div>
        <div class="form-item row">
          <label>深色模式</label>
          <el-switch v-model="darkMode" disabled />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="profile__actions">
        <button class="save-btn" @click="save">保存设置</button>
        <button class="logout-btn" @click="logout">
          退出登录
        </button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__header {
    @include flex-center;
    justify-content: flex-start;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--cuoti-divider);

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--cuoti-primary-gradient);
      color: #fff;
      @include flex-center;
      font-size: 24px;
    }

    .info {
      .name {
        font-size: 18px;
        font-weight: 600;
        color: var(--cuoti-text-primary);
      }

      .meta {
        font-size: 13px;
        color: var(--cuoti-text-secondary);
        margin-top: 4px;
      }
    }
  }

  &__section {
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--cuoti-text-secondary);
      margin-bottom: 12px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: auto;
  }
}

.form-item {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }

  &.row {
    @include flex-center;
    justify-content: space-between;
    gap: 16px;
  }

  label {
    display: block;
    font-size: 12px;
    color: var(--cuoti-text-tertiary);
    margin-bottom: 6px;
  }

  .input-with-icon {
    @include flex-center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--cuoti-border);
    border-radius: var(--cuoti-radius-md);
    background: var(--cuoti-bg-app);

    .el-icon {
      color: var(--cuoti-text-tertiary);
    }
  }
}

.form-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--cuoti-text-primary);
  padding: 0;

  &::placeholder {
    color: var(--cuoti-text-tertiary);
  }
}

select.form-input {
  padding: 10px 12px;
  border: 1px solid var(--cuoti-border);
  border-radius: var(--cuoti-radius-md);
  background: var(--cuoti-bg-app);
}

.font-size-control {
  @include flex-center;
  gap: 10px;
  flex: 1;

  .slider {
    flex: 1;
  }

  .large {
    font-size: 16px;
  }
}

.save-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--cuoti-radius-md);
  background: var(--cuoti-primary-gradient);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.92;
  }
}

.logout-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--cuoti-border);
  border-radius: var(--cuoti-radius-md);
  background: transparent;
  color: var(--cuoti-text-secondary);
  font-size: 14px;
  cursor: pointer;
  @include flex-center;
  gap: 6px;

  &:hover {
    color: var(--cuoti-danger);
    border-color: var(--cuoti-danger);
    background: #fef6f5;
  }
}
</style>
