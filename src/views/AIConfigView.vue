<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#312E81] to-[#581C87] relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
      <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
    </div>

    <!-- 导航栏 -->
    <NavBar />

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">AI 配置</h1>
        <p class="mt-2 text-gray-400">自定义 AI 分析模型和规则</p>
      </div>

      <!-- 配置内容 -->
      <div class="space-y-6">
        <!-- AI 模型设置 -->
        <div class="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 class="text-xl font-semibold text-white mb-4">AI 模型设置</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">选择模型</h3>
                <p class="text-sm text-gray-400">选择用于代码分析的 AI 模型</p>
              </div>
              <select
                v-model="selectedModel"
                class="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-2">Claude 2</option>
              </select>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">温度设置</h3>
                <p class="text-sm text-gray-400">控制 AI 输出的创造性（0-1）</p>
              </div>
              <div class="flex items-center space-x-4">
                <input
                  type="range"
                  v-model="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                >
                <span class="text-white w-8">{{ temperature }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">最大令牌数</h3>
                <p class="text-sm text-gray-400">单次分析的最大输出长度</p>
              </div>
              <input
                type="number"
                v-model="maxTokens"
                min="100"
                max="4000"
                step="100"
                class="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-32"
              >
            </div>
          </div>
        </div>

        <!-- 分析规则配置 -->
        <div class="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 class="text-xl font-semibold text-white mb-4">分析规则配置</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">代码复杂度阈值</h3>
                <p class="text-sm text-gray-400">设置圈复杂度的警告阈值</p>
              </div>
              <input
                type="number"
                v-model="complexityThreshold"
                min="1"
                max="50"
                class="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-24"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">代码重复率阈值</h3>
                <p class="text-sm text-gray-400">设置代码重复率的警告阈值（%）</p>
              </div>
              <input
                type="number"
                v-model="duplicationThreshold"
                min="0"
                max="100"
                class="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-24"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">性能评分阈值</h3>
                <p class="text-sm text-gray-400">设置性能评分的警告阈值</p>
              </div>
              <input
                type="number"
                v-model="performanceThreshold"
                min="0"
                max="100"
                class="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-24"
              >
            </div>
          </div>
        </div>

        <!-- 自定义规则 -->
        <div class="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 class="text-xl font-semibold text-white mb-4">自定义规则</h2>
          <div class="space-y-4">
            <div v-for="(rule, index) in customRules" :key="index" class="flex items-start space-x-4">
              <div class="flex-1">
                <input
                  type="text"
                  v-model="rule.pattern"
                  placeholder="规则模式"
                  class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                >
                <input
                  type="text"
                  v-model="rule.message"
                  placeholder="警告信息"
                  class="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
              </div>
              <button
                @click="removeRule(index)"
                class="text-red-400 hover:text-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <button
              @click="addRule"
              class="text-purple-400 hover:text-purple-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              添加规则
            </button>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end">
          <button
            @click="saveConfig"
            class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            保存配置
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'

// AI 模型设置
const selectedModel = ref('gpt-4')
const temperature = ref(0.7)
const maxTokens = ref(2000)

// 分析规则配置
const complexityThreshold = ref(10)
const duplicationThreshold = ref(20)
const performanceThreshold = ref(80)

// 自定义规则
const customRules = ref([
  { pattern: '', message: '' }
])

// 添加规则
const addRule = () => {
  customRules.value.push({ pattern: '', message: '' })
}

// 删除规则
const removeRule = (index) => {
  customRules.value.splice(index, 1)
}

// 保存配置
const saveConfig = () => {
  const config = {
    model: {
      name: selectedModel.value,
      temperature: temperature.value,
      maxTokens: maxTokens.value
    },
    thresholds: {
      complexity: complexityThreshold.value,
      duplication: duplicationThreshold.value,
      performance: performanceThreshold.value
    },
    customRules: customRules.value.filter(rule => rule.pattern && rule.message)
  }
  
  localStorage.setItem('aiConfig', JSON.stringify(config))
  // TODO: 显示保存成功提示
}

// 加载配置
onMounted(() => {
  const savedConfig = localStorage.getItem('aiConfig')
  if (savedConfig) {
    const config = JSON.parse(savedConfig)
    selectedModel.value = config.model.name
    temperature.value = config.model.temperature
    maxTokens.value = config.model.maxTokens
    complexityThreshold.value = config.thresholds.complexity
    duplicationThreshold.value = config.thresholds.duplication
    performanceThreshold.value = config.thresholds.performance
    customRules.value = config.customRules.length ? config.customRules : [{ pattern: '', message: '' }]
  }
})
</script>

<style>
/* 添加全局过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* 添加阴影效果 */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 添加渐变文字效果 */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* 添加滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 添加模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
