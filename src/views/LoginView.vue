<template>
  <div class="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center overflow-hidden">
    <!-- 动态背景效果 -->
    <div class="absolute inset-0">
      <!-- 动态渐变背景 -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 animate-gradient"></div>
      
      <!-- 动态气泡 -->
      <div class="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div class="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-40 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <!-- 装饰线条 -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute top-0 left-0 w-full h-full bg-grid-white/10"></div>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative w-[90%] max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <!-- 登录框 -->
      <div class="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
        <!-- Logo和标题 -->
        <div class="text-center mb-6 md:mb-8">
          <div class="flex justify-center mb-4 md:mb-6">
            <div class="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-white to-white/80 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform duration-300">
              <svg class="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
          </div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 text-shadow-lg">AI Code Analysis</h1>
          <p class="text-base md:text-lg lg:text-xl text-white/90">智能代码分析，提升开发效率</p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-4 md:space-y-6">
          <!-- 邮箱输入框 -->
          <div class="group">
            <div class="relative transform transition-all duration-300 hover:translate-x-1">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border-2 border-white/10 rounded-xl md:rounded-2xl text-white placeholder-white/50 outline-none focus:border-white/30 transition-all duration-300 text-sm md:text-base"
                placeholder="输入邮箱"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- 密码输入框 -->
          <div class="group">
            <div class="relative transform transition-all duration-300 hover:translate-x-1">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border-2 border-white/10 rounded-xl md:rounded-2xl text-white placeholder-white/50 outline-none focus:border-white/30 transition-all duration-300 text-sm md:text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="输入密码"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-white/50 hover:text-white/70 transition-colors duration-200"
              >
                <svg v-if="!showPassword" class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 记住我和忘记密码 -->
          <div class="flex items-center justify-between text-xs md:text-sm mt-6 md:mt-8">
            <label class="flex items-center text-white/90 cursor-pointer group">
              <input
                type="checkbox"
                v-model="remember"
                class="w-5 h-5 rounded-lg border-2 border-white/20 bg-white/5 text-violet-500 focus:ring-offset-0 focus:ring-2 focus:ring-white/30 transition-all duration-300"
              />
              <span class="ml-3 group-hover:text-white transition-colors duration-200">记住我</span>
            </label>
            <a href="#" class="text-white/90 hover:text-white transition-colors duration-200 hover:underline">忘记密码？</a>
          </div>

          <!-- 错误消息 -->
          <div v-if="errorMessage" class="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm">
            {{ errorMessage }}
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 md:py-4 px-4 md:px-6 mt-4 md:mt-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl md:rounded-2xl text-white font-medium text-base md:text-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span v-if="!isLoading" class="flex items-center justify-center">
              登录
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </span>
            <div v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              登录中...
            </div>
          </button>

          <!-- 注册链接 -->
          <div class="text-center text-white/90 mt-6 md:mt-8 text-sm md:text-base">
            <span>还没有账号？</span>
            <a href="#" class="text-white font-medium hover:text-fuchsia-300 transition-colors duration-200 ml-1 hover:underline">立即注册</a>
          </div>

          <!-- 社交登录 -->
          <div class="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/10">
            <div class="text-center text-white/70 mb-3 md:mb-4 text-sm md:text-base">其他登录方式</div>
            <div class="flex justify-center space-x-3 md:space-x-4">
              <button class="p-2 md:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 group">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button class="p-2 md:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 group">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button class="p-2 md:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 group">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- 装饰元素 -->
      <div class="absolute -top-20 -right-20 w-32 md:w-40 lg:w-48 h-32 md:h-40 lg:h-48 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full filter blur-xl opacity-20 animate-pulse"></div>
      <div class="absolute -bottom-20 -left-20 w-32 md:w-40 lg:w-48 h-32 md:h-40 lg:h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
    </div>

    <!-- 背景装饰 -->
    <div class="hidden lg:block absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full filter blur-3xl"></div>
    <div class="hidden lg:block absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full filter blur-3xl"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// 页面加载时检查认证状态
onMounted(async () => {
  console.log('LoginView组件加载完成')
  try {
    await authStore.checkAuth()
    
    // 如果已认证，直接跳转到仪表板
    if (authStore.isAuthenticated) {
      console.log('用户已认证，跳转到仪表板')
      router.push('/dashboard')
      return
    }
    
    // 检查token是否存在但未认证
    const token = localStorage.getItem('token')
    if (token && !authStore.isAuthenticated) {
      console.log('发现token但未认证，设置基本用户数据')
      // 设置基本用户数据
      authStore.setUser({ 
        id: 'test-user-id', 
        email: 'admin@example.com',
        name: 'Test User'
      })
    }
  } catch (error) {
    console.error('检查认证状态失败:', error)
  }
})

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '请输入邮箱和密码'
    return
  }
  
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    // 使用auth store进行真实登录
    await authStore.login(email.value, password.value)
    console.log('登录成功')
    
    // 登录成功后跳转到仪表板
    router.push('/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
    errorMessage.value = error.message || '登录失败，请检查您的凭据'
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
.text-shadow-lg {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.animate-gradient {
  animation: gradient 8s linear infinite;
  background-size: 200% 200%;
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.bg-grid-white\/10 {
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
