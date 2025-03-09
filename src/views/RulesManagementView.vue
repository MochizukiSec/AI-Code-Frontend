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
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">规则管理</h1>
        <p class="mt-2 text-gray-400">管理代码分析规则，自定义分析标准</p>
        
        <!-- 添加刷新按钮 -->
        <div class="mt-4 flex items-center justify-between">
          <button 
            @click="fetchRules" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white flex items-center transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新规则列表
          </button>
          
          <label class="flex items-center text-gray-400 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="autoSync" 
              class="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-700 focus:ring-blue-500"
            >
            <span class="ml-2 text-sm">自动同步 ({{ syncInterval }}秒)</span>
          </label>
        </div>
      </div>

      <!-- 错误和成功消息 -->
      <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {{ successMessage }}
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- 规则统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">总规则数</p>
              <h3 class="text-2xl font-bold text-white mt-1">{{ stats.totalRules }}</h3>
            </div>
            <div class="p-3 bg-blue-500/20 rounded-full">
              <svg class="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">活跃规则</p>
              <h3 class="text-2xl font-bold text-white mt-1">{{ stats.activeRules }}</h3>
            </div>
            <div class="p-3 bg-green-500/20 rounded-full">
              <svg class="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">规则触发次数</p>
              <h3 class="text-2xl font-bold text-white mt-1">{{ stats.totalTriggers }}</h3>
            </div>
            <div class="p-3 bg-yellow-500/20 rounded-full">
              <svg class="w-6 h-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400">平均检测率</p>
              <h3 class="text-2xl font-bold text-white mt-1">{{ stats.avgDetectionRate.toFixed(1) }}%</h3>
            </div>
            <div class="p-3 bg-purple-500/20 rounded-full">
              <svg class="w-6 h-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 规则列表 -->
      <div class="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <!-- 过滤和排序控件 -->
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-300">状态：</label>
            <select
              v-model="filterStatus"
              class="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部</option>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-300">分类：</label>
            <select
              v-model="filterCategory"
              class="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部</option>
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-300">排序：</label>
            <select
              v-model="sortBy"
              class="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="priority">按优先级</option>
              <option value="name">按名称</option>
              <option value="usage">按使用次数</option>
              <option value="detection">按检出率</option>
            </select>
          </div>
        </div>
        
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-white">分析规则</h2>
          <button
            @click="showAddRuleModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
          >
            <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            添加规则
          </button>
        </div>
        
        <!-- 规则列表 -->
        <div class="space-y-4">
          <div
            v-for="rule in filteredRules"
            :key="rule.id"
            class="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-white font-medium">{{ rule.name }}</h3>
                <span :class="[
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  statusOptions.find(s => s.value === rule.status)?.color,
                  'bg-opacity-20'
                ]">
                  {{ statusOptions.find(s => s.value === rule.status)?.label }}
                </span>
                <span :class="[
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  priorityOptions.find(p => p.value === rule.priority)?.color,
                  'bg-opacity-20'
                ]">
                  {{ priorityOptions.find(p => p.value === rule.priority)?.label }}
                </span>
              </div>
              <p class="text-gray-400 text-sm mt-1">{{ rule.description }}</p>
              <div class="flex items-center space-x-2 mt-2">
                <span class="text-xs text-gray-500">
                  {{ categoryOptions.find(c => c.value === rule.category)?.label }}
                </span>
                <span class="text-xs text-gray-500">•</span>
                <span class="text-xs text-gray-500">{{ rule.type === 'regex' ? '正则表达式' : '内置规则' }}</span>
                <span class="text-xs text-gray-500">•</span>
                <span class="text-xs text-gray-500">使用次数：{{ rule.usageCount || 0 }}</span>
                <span class="text-xs text-gray-500">•</span>
                <span class="text-xs text-gray-500">检测率：{{ rule.detectionRate || 0 }}%</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="editRule(rule)"
                class="text-gray-400 hover:text-blue-500"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteRule(rule)"
                class="text-gray-400 hover:text-red-500"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加/编辑规则弹窗 -->
    <div
      v-if="showAddRuleModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-white">
            {{ editingRule ? '编辑规则' : '添加规则' }}
          </h3>
          <button
            @click="showAddRuleModal = false"
            class="text-gray-400 hover:text-white"
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveRule" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              规则名称
            </label>
            <input
              v-model="ruleForm.name"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              规则描述
            </label>
            <textarea
              v-model="ruleForm.description"
              rows="3"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              规则类型
            </label>
            <select
              v-model="ruleForm.type"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="quality">代码质量</option>
              <option value="security">安全漏洞</option>
              <option value="performance">性能优化</option>
              <option value="regex">正则表达式</option>
            </select>
          </div>

          <!-- 正则表达式规则配置 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              正则表达式
            </label>
            <div class="flex space-x-2">
              <input
                v-model="ruleForm.pattern"
                type="text"
                :placeholder="'输入正则表达式，例如：' + (ruleForm.type === 'quality' ? 'function\\s+\\w+\\s*\\([^)]*\\)\\s*\\{' : 
                  ruleForm.type === 'security' ? 'SELECT\\s+.*\\s+FROM\\s+\\w+\\s+WHERE\\s+.*\\+.*' :
                  ruleForm.type === 'performance' ? 'addEventListener\\([^)]+\\)\\s*(?!removeEventListener)' :
                  'console\\.log\\s*\\([^)]*\\)')"
                class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
              <button
                type="button"
                @click="testRegex"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                测试
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-400">
              支持 JavaScript 正则表达式语法，例如：
              <code class="bg-gray-800 px-1 py-0.5 rounded">console\.log</code>、
              <code class="bg-gray-800 px-1 py-0.5 rounded">\b(if|else|for|while)\b</code>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              测试文本
            </label>
            <textarea
              v-model="ruleForm.testText"
              rows="3"
              :placeholder="'输入用于测试的代码片段'"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          <!-- 测试结果 -->
          <div v-if="testResult !== null" class="mt-2">
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-300">测试结果：</span>
              <span
                :class="[
                  testResult.valid ? 'text-green-400' : 'text-red-400',
                  'ml-2 text-sm'
                ]"
              >
                {{ testResult.valid ? '匹配成功' : '匹配失败' }}
              </span>
            </div>
            <div v-if="testResult.matches.length > 0" class="mt-2">
              <p class="text-sm text-gray-300">匹配到的内容：</p>
              <ul class="mt-1 space-y-1">
                <li
                  v-for="(match, index) in testResult.matches"
                  :key="index"
                  class="text-sm text-gray-400"
                >
                  {{ match }}
                </li>
              </ul>
            </div>
            <div v-if="testResult.error" class="mt-2">
              <p class="text-sm text-red-400">错误：{{ testResult.error }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                优先级
              </label>
              <select
                v-model="ruleForm.priority"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                状态
              </label>
              <select
                v-model="ruleForm.status"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              分类
            </label>
            <select
              v-model="ruleForm.category"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showAddRuleModal = false"
              class="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiService from '../services/api.service'
import NavBar from '../components/NavBar.vue'

const route = useRoute()
const router = useRouter()
const rules = ref([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showAddRuleModal = ref(false)
const showEditRuleModal = ref(false)
const showDeleteConfirmModal = ref(false)
const currentRule = ref(null)
const testResult = ref(null)

// 添加自动同步功能
const autoSync = ref(false)
const syncInterval = ref(30) // 30秒
let syncTimer = null

// 自动同步逻辑
const setupAutoSync = () => {
  // 清除之前的计时器
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
  }
  
  // 如果启用自动同步，创建新计时器
  if (autoSync.value) {
    syncTimer = setInterval(() => {
      console.log('自动同步执行中...')
      fetchRules()
    }, syncInterval.value * 1000)
    
    console.log(`自动同步已启用，间隔: ${syncInterval.value}秒`)
  } else {
    console.log('自动同步已禁用')
  }
}

// 监听自动同步设置变化
watch(autoSync, (newValue) => {
  console.log('自动同步设置更改为:', newValue)
  setupAutoSync()
  
  // 保存设置到localStorage
  try {
    localStorage.setItem('rulesAutoSync', JSON.stringify({
      enabled: newValue,
      interval: syncInterval.value
    }))
  } catch (e) {
    console.warn('保存自动同步设置失败:', e)
  }
})

// 监听间隔变化
watch(syncInterval, (newValue) => {
  if (autoSync.value) {
    setupAutoSync()
    
    // 保存设置到localStorage
    try {
      localStorage.setItem('rulesAutoSync', JSON.stringify({
        enabled: autoSync.value,
        interval: newValue
      }))
    } catch (e) {
      console.warn('保存自动同步设置失败:', e)
    }
  }
})

// 加载自动同步设置
const loadSyncSettings = () => {
  try {
    const savedSettings = localStorage.getItem('rulesAutoSync')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      autoSync.value = settings.enabled || false
      syncInterval.value = settings.interval || 30
      
      console.log('已加载自动同步设置:', settings)
      
      // 如果启用，立即设置
      if (autoSync.value) {
        setupAutoSync()
      }
    }
  } catch (e) {
    console.warn('加载自动同步设置失败:', e)
  }
}

// 清理函数
onBeforeUnmount(() => {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
    console.log('已清理自动同步计时器')
  }
})

// 统计信息
const stats = ref({
  totalRules: 0,
  activeRules: 0,
  totalTriggers: 0,
  avgDetectionRate: 0
})

// 规则表单
const ruleForm = ref({
  id: null,
  name: '',
  description: '',
  type: 'quality',
  pattern: '',
  testText: '',
  priority: 'medium',
  status: 'active',
  category: 'code-quality'
})

// 规则优先级选项
const priorityOptions = [
  { value: 'critical', label: '严重', color: 'text-red-500' },
  { value: 'high', label: '高', color: 'text-orange-500' },
  { value: 'medium', label: '中', color: 'text-yellow-500' },
  { value: 'low', label: '低', color: 'text-green-500' }
]

// 规则状态选项
const statusOptions = [
  { value: 'active', label: '启用', color: 'text-green-500' },
  { value: 'inactive', label: '禁用', color: 'text-gray-500' },
  { value: 'draft', label: '草稿', color: 'text-yellow-500' }
]

// 规则分类选项
const categoryOptions = [
  { value: 'code-quality', label: '代码质量' },
  { value: 'security', label: '安全' },
  { value: 'performance', label: '性能' },
  { value: 'maintainability', label: '可维护性' },
  { value: 'best-practices', label: '最佳实践' }
]

// 过滤和排序
const filterStatus = ref('all')
const filterCategory = ref('all')
const sortBy = ref('priority')

// 过滤后的规则列表
const filteredRules = computed(() => {
  let result = [...rules.value]
  
  // 应用状态过滤
  if (filterStatus.value !== 'all') {
    result = result.filter(rule => rule.status === filterStatus.value)
  }
  
  // 应用分类过滤
  if (filterCategory.value !== 'all') {
    result = result.filter(rule => rule.category === filterCategory.value)
  }
  
  // 应用排序
  result.sort((a, b) => {
    if (sortBy.value === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    } else if (sortBy.value === 'usage') {
      return (b.usageCount || 0) - (a.usageCount || 0)
    } else if (sortBy.value === 'detection') {
      return (b.detectionRate || 0) - (a.detectionRate || 0)
    } else if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })
  
  return result
})

// 编辑规则
const editRule = (rule) => {
  currentRule.value = rule
  ruleForm.value = { ...rule }
  showAddRuleModal.value = true // 使用同一个模态窗口
  testResult.value = null // 重置测试结果
}

// 删除规则
const deleteRule = async (rule) => {
  if (confirm('确定要删除这条规则吗？')) {
    try {
      loading.value = true
      errorMessage.value = ''
      
      // 调用API删除规则
      await apiService.deleteRule(rule.id)
      
      // 显示成功消息
      successMessage.value = '规则已成功删除'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
      
      // 立即重新获取规则列表
      await fetchRules()
      
      // 更新localStorage中的最后修改时间戳
      try {
        localStorage.setItem('rulesLastUpdated', new Date().toISOString())
      } catch (e) {
        console.warn('保存规则更新时间戳失败:', e)
      }
    } catch (error) {
      console.error('删除规则失败:', error)
      errorMessage.value = '删除规则失败: ' + (error.message || '服务器错误')
    } finally {
      loading.value = false
    }
  }
}

// 默认测试文本
const defaultTestTexts = {
  quality: 'function calculateTotal(items) {\n  // 函数内容\n}',
  security: 'const password = "hardcoded_password";',
  performance: 'for (let i = 0; i < array.length; i++) {\n  // 循环内容\n}'
}

// 当规则类型改变时，更新默认测试文本
watch(() => ruleForm.value.type, (newType) => {
  if (!ruleForm.value.testText || ruleForm.value.testText === defaultTestTexts[ruleForm.value.type]) {
    ruleForm.value.testText = defaultTestTexts[newType]
  }
})

// 保存规则
const saveRule = async () => {
  try {
    // 验证表单
    if (!ruleForm.value.name || !ruleForm.value.pattern) {
      errorMessage.value = '请填写规则名称和正则表达式'
      return
    }

    // 验证正则表达式
    try {
      new RegExp(ruleForm.value.pattern)
    } catch (error) {
      errorMessage.value = '正则表达式格式无效：' + error.message
      return
    }

    loading.value = true
    errorMessage.value = ''
    
    // 准备要保存的规则数据
    const ruleData = {
      name: ruleForm.value.name,
      description: ruleForm.value.description,
      type: ruleForm.value.type,
      pattern: ruleForm.value.pattern,
      priority: ruleForm.value.priority,
      status: ruleForm.value.status,
      category: ruleForm.value.category
    }
    
    let savedRule = null;
    
    if (currentRule.value) {
      // 更新现有规则
      savedRule = await apiService.updateRule(currentRule.value.id, ruleData)
      successMessage.value = '规则已成功更新'
    } else {
      // 添加新规则
      savedRule = await apiService.createRule(ruleData)
      successMessage.value = '规则已成功添加'
    }
    
    // 记录保存的规则
    console.log('规则已保存:', savedRule);
    
    // 3秒后隐藏成功消息
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
    // 立即重新获取规则列表
    await fetchRules()
    
    // 更新localStorage中的最后修改时间戳
    try {
      localStorage.setItem('rulesLastUpdated', new Date().toISOString())
    } catch (e) {
      console.warn('保存规则更新时间戳失败:', e)
    }
    
    // 重置表单和关闭弹窗
    resetForm()
    showAddRuleModal.value = false
    
  } catch (error) {
    console.error('保存规则失败:', error)
    errorMessage.value = '保存规则失败: ' + (error.message || '服务器错误')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  ruleForm.value = {
    id: null,
    name: '',
    description: '',
    type: 'quality',
    pattern: '',
    testText: defaultTestTexts.quality,
    priority: 'medium',
    status: 'active',
    category: 'code-quality'
  }
  currentRule.value = null
  testResult.value = null
}

// 更新统计数据
const updateStats = () => {
  stats.value = {
    totalRules: rules.value.length,
    activeRules: rules.value.filter(rule => rule.status === 'active').length,
    totalTriggers: rules.value.reduce((sum, rule) => sum + (rule.usageCount || 0), 0),
    avgDetectionRate: rules.value.length > 0 
      ? rules.value.reduce((sum, rule) => sum + (rule.detectionRate || 0), 0) / rules.value.length 
      : 0
  }
}

// 测试正则表达式
const testRegex = () => {
  try {
    const pattern = ruleForm.value.pattern
    if (!pattern) {
      errorMessage.value = '请输入正则表达式'
      return
    }
    
    const testText = ruleForm.value.testText
    if (!testText) {
      errorMessage.value = '请输入测试文本'
      return
    }
    
    const regex = new RegExp(pattern, 'g')
    const matches = testText.match(regex) || []
    
    testResult.value = {
      valid: matches.length > 0,
      matches: matches,
      error: null
    }
  } catch (error) {
    testResult.value = {
      valid: false,
      matches: [],
      error: error.message
    }
  }
}

// 获取规则列表
const fetchRules = async () => {
  try {
    console.log('正在获取规则列表...')
    loading.value = true
    errorMessage.value = ''
    
    const response = await apiService.getRules()
    console.log('获取规则列表成功:', response)
    
    if (response && response.data) {
      rules.value = response.data
      
      // 更新统计数据
      updateStats()
    }
  } catch (error) {
    console.error('获取规则列表失败:', error)
    errorMessage.value = '获取规则列表失败: ' + (error.message || '服务器错误')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载规则和统计数据
onMounted(() => {
  console.log('Rules management view mounted')
  fetchRules()
  loadSyncSettings()
})
</script> 