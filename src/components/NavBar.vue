<template>
  <!-- 顶部导航栏 -->
  <nav class="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center">
            <img src="/logo.svg" alt="Logo" class="h-8 w-8">
            <span class="ml-2 text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">AI Code Analysis</span>
          </router-link>
        </div>

        <!-- 导航链接 -->
        <div class="hidden md:block">
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <router-link
                to="/dashboard"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                :class="{ 'text-white': $route.name === 'dashboard' }"
              >
                <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                仪表盘
              </router-link>
              <router-link
                to="/analysis"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                :class="{ 'text-white': $route.name === 'analysis' }"
              >
                <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                代码分析
              </router-link>
              <router-link
                to="/rules"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                :class="{ 'text-white': $route.name === 'rules' }"
              >
                <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                规则管理
              </router-link>
              <router-link
                to="/settings"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                :class="{ 'text-white': $route.name === 'settings' }"
              >
                <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                设置
              </router-link>
            </template>
            <template v-else>
              <router-link
                to="/"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                :class="{ 'text-white': $route.name === 'home' }"
              >
                <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                首页
              </router-link>
            </template>
          </div>
        </div>

        <!-- 用户菜单 -->
        <div class="flex items-center">
          <template v-if="authStore.isAuthenticated">
            <span class="mr-4 text-gray-300">{{ authStore.user?.username || '用户' }}</span>
            <button
              @click="handleLogout"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              退出登录
            </button>
          </template>
          <template v-else>
            <button
              @click="handleLogin"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              登录
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const showUserMenu = ref(false)

// 检查用户登录状态
onMounted(async () => {
  console.log('导航栏组件加载，开始检查认证状态')
  try {
    await authStore.checkAuth()
    console.log('认证状态检查完成:', { 
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user
    })
  } catch (error) {
    console.error('认证状态检查失败:', error)
  }
})

// 监听路由变化，重新检查认证状态
watch(() => router.currentRoute.value, async () => {
  console.log('路由变化，重新检查认证状态')
  await authStore.checkAuth()
}, { immediate: true })

// 处理登录
const handleLogin = () => {
  router.push('/login')
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
/* 导航链接激活状态样式 */
.router-link-active {
  @apply text-white bg-white/10;
}

/* 导航链接悬停状态样式 */
.router-link-active:hover {
  @apply bg-white/15;
}
</style> 