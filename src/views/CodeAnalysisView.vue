<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#312E81] to-[#581C87] relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
      <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
    </div>

    <!-- 导航栏 -->
    <NavBar />

    <!-- 登录提示弹窗 -->
    <LoginPrompt
      v-if="showLoginPrompt"
      @login="handleLogin"
      @close="showLoginPrompt = false"
    />

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">代码分析</h1>
        <p class="mt-2 text-gray-400">上传或粘贴代码，使用AI和规则检测潜在问题</p>
      </div>

      <!-- 项目上传组件 -->
      <ProjectUpload />

      <!-- 分析结果提示 -->
      <div v-if="hasAnalysisResults" class="mt-8 bg-white/5 rounded-lg p-5 border border-white/10">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-white">分析已完成</h3>
            <p class="text-gray-400 mt-1">您可以点击下方按钮查看详细的分析报告</p>
          </div>
          <button 
            @click="viewFullReport" 
            class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            查看报告
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import NavBar from '../components/NavBar.vue'
import ProjectUpload from '../components/analysis/ProjectUpload.vue'
import LoginPrompt from '../components/LoginPrompt.vue'

const router = useRouter()
const userStore = useUserStore()

// 检查是否有分析结果
const hasAnalysisResults = computed(() => {
  return localStorage.getItem('analysisResults') !== null
})

const showLoginPrompt = ref(false)

// 查看完整报告
const viewFullReport = () => {
  const savedResults = localStorage.getItem('analysisResults')
  if (savedResults) {
    try {
      const results = JSON.parse(savedResults)
      const taskId = results.taskId || 'report'
      router.push(`/analysis/${taskId}`)
    } catch (e) {
      console.error('解析分析结果失败:', e)
      router.push('/analysis/report')
    }
  }
}

// 处理登录
const handleLogin = () => {
  showLoginPrompt.value = false
  userStore.login({
    name: '测试用户',
    avatar: null
  })
}

// 开始分析
const startAnalysis = () => {
  if (!userStore.isLoggedIn) {
    showLoginPrompt.value = true
    return
  }
  
  // 这里添加文件上传和分析的逻辑
  router.push(`/analysis/${taskId || 'report'}`)
}
</script>

<style scoped>
/* 继承全局样式 */
</style> 