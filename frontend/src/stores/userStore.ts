/* ==========================================================================
 * 用户状态：登录态 + 个人信息
 * 后端就绪后替换为真实登录接口
 * ========================================================================== */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface UserProfile {
  username: string
  nickname: string
  grade?: string
  school?: string
  mainSubject?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('cuoti_token'))
  const profile = ref<UserProfile>({
    username: localStorage.getItem('cuoti_username') || '',
    nickname: localStorage.getItem('cuoti_nickname') || localStorage.getItem('cuoti_username') || '同学',
    grade: localStorage.getItem('cuoti_grade') || '高三',
    school: localStorage.getItem('cuoti_school') || '',
    mainSubject: localStorage.getItem('cuoti_mainSubject') || '数学'
  })

  const isLoggedIn = computed(() => !!token.value)

  function login(name: string, pwd: string): boolean {
    if (!name.trim() || !pwd.trim()) return false
    const fakeToken = `mock_token_${Date.now()}`
    token.value = fakeToken
    profile.value = {
      username: name.trim(),
      nickname: name.trim(),
      grade: '高三',
      school: '',
      mainSubject: '数学'
    }
    persist()
    return true
  }

  function logout() {
    token.value = null
    profile.value = { username: '', nickname: '同学' }
    localStorage.removeItem('cuoti_token')
    localStorage.removeItem('cuoti_username')
    localStorage.removeItem('cuoti_nickname')
    localStorage.removeItem('cuoti_grade')
    localStorage.removeItem('cuoti_school')
    localStorage.removeItem('cuoti_mainSubject')
  }

  function updateProfile(p: Partial<UserProfile>) {
    profile.value = { ...profile.value, ...p }
    persist()
  }

  function persist() {
    localStorage.setItem('cuoti_token', token.value || '')
    localStorage.setItem('cuoti_username', profile.value.username)
    localStorage.setItem('cuoti_nickname', profile.value.nickname)
    if (profile.value.grade) localStorage.setItem('cuoti_grade', profile.value.grade)
    if (profile.value.school) localStorage.setItem('cuoti_school', profile.value.school)
    if (profile.value.mainSubject) localStorage.setItem('cuoti_mainSubject', profile.value.mainSubject)
  }

  return { token, profile, isLoggedIn, login, logout, updateProfile }
})
