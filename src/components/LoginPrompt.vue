<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
      <div class="text-center">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-white mb-2">需要登录</h3>
        <p class="text-gray-300 mb-6">请先登录账号后再进行代码分析</p>
        <div class="flex justify-center space-x-4">
          <button
            @click="handleLogin"
            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
          >
            立即登录
          </button>
          <button
            @click="handleClose"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const emit = defineEmits(['login', 'close'])

const handleLogin = () => {
  console.log('LoginPrompt: Login button clicked')
  emit('login')
}

const handleClose = () => {
  console.log('LoginPrompt: Close button clicked')
  emit('close')
}

onMounted(() => {
  console.log('LoginPrompt component mounted')
})
</script> 