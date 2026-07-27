import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import LoginView from '@/views/LoginView.vue'
import ChatView from '@/views/ChatView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { public: true }
    },
    {
      path: '/chat',
      name: 'Chat',
      component: ChatView
    },
    {
      path: '/chat/:sessionId',
      name: 'ChatSession',
      component: ChatView
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/chat'
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  if (!to.meta.public && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/chat')
  } else {
    next()
  }
})

export default router
