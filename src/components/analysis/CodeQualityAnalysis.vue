<template>
  <div class="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
    <h3 class="text-xl font-semibold text-white mb-4">代码质量分析</h3>
    
    <!-- 分析指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white/5 rounded-lg p-4">
        <div class="text-gray-400 text-sm mb-1">代码复杂度</div>
        <div class="text-2xl font-bold text-white">
          {{ metrics.complexity || '-' }}
          <span class="text-sm font-normal text-gray-400">/10</span>
        </div>
        <div class="mt-2 text-sm" :class="getComplexityColor">
          {{ getComplexityStatus }}
        </div>
      </div>
      
      <div class="bg-white/5 rounded-lg p-4">
        <div class="text-gray-400 text-sm mb-1">代码重复率</div>
        <div class="text-2xl font-bold text-white">
          {{ metrics.duplication || '-' }}
          <span class="text-sm font-normal text-gray-400">%</span>
        </div>
        <div class="mt-2 text-sm" :class="getDuplicationColor">
          {{ getDuplicationStatus }}
        </div>
      </div>
      
      <div class="bg-white/5 rounded-lg p-4">
        <div class="text-gray-400 text-sm mb-1">可维护性指数</div>
        <div class="text-2xl font-bold text-white">
          {{ metrics.maintainability || '-' }}
          <span class="text-sm font-normal text-gray-400">/100</span>
        </div>
        <div class="mt-2 text-sm" :class="getMaintainabilityColor">
          {{ getMaintainabilityStatus }}
        </div>
      </div>
    </div>

    <!-- 详细分析结果 -->
    <div class="space-y-4">
      <div v-for="(issue, index) in analysisResults" :key="index" 
           class="bg-white/5 rounded-lg p-4">
        <div class="flex items-start">
          <div :class="getIssueSeverityColor(issue.severity)" 
               class="w-2 h-2 rounded-full mt-2 mr-3"></div>
          <div class="flex-1">
            <h4 class="text-white font-medium">{{ issue.title }}</h4>
            <p class="text-gray-400 text-sm mt-1">{{ issue.description }}</p>
            <div class="text-sm text-gray-500 mt-2">
              文件: {{ issue.file }}:{{ issue.line }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const metrics = ref({
  complexity: 0,
  duplication: 0,
  maintainability: 0
})

const analysisResults = ref([])

// 计算属性
const getComplexityStatus = computed(() => {
  const value = metrics.value.complexity
  if (value <= 5) return '复杂度适中'
  if (value <= 8) return '复杂度较高'
  return '复杂度过高'
})

const getComplexityColor = computed(() => {
  const value = metrics.value.complexity
  if (value <= 5) return 'text-green-400'
  if (value <= 8) return 'text-yellow-400'
  return 'text-red-400'
})

const getDuplicationStatus = computed(() => {
  const value = metrics.value.duplication
  if (value <= 10) return '重复率良好'
  if (value <= 20) return '重复率一般'
  return '重复率过高'
})

const getDuplicationColor = computed(() => {
  const value = metrics.value.duplication
  if (value <= 10) return 'text-green-400'
  if (value <= 20) return 'text-yellow-400'
  return 'text-red-400'
})

const getMaintainabilityStatus = computed(() => {
  const value = metrics.value.maintainability
  if (value >= 90) return '可维护性优秀'
  if (value >= 80) return '可维护性良好'
  return '可维护性待改进'
})

const getMaintainabilityColor = computed(() => {
  const value = metrics.value.maintainability
  if (value >= 90) return 'text-green-400'
  if (value >= 80) return 'text-yellow-400'
  return 'text-red-400'
})

const getIssueSeverityColor = (severity) => {
  switch (severity) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-blue-500'
    default: return 'bg-gray-500'
  }
}

// 从 localStorage 加载分析结果
onMounted(() => {
  const results = localStorage.getItem('analysisResults')
  if (results) {
    const parsedResults = JSON.parse(results)
    if (parsedResults.results && parsedResults.results.codeQuality) {
      metrics.value = parsedResults.results.codeQuality.metrics
      analysisResults.value = parsedResults.results.codeQuality.issues
    } else if (parsedResults.codeQuality) {
      // 兼容旧格式
      metrics.value = parsedResults.codeQuality.metrics
      analysisResults.value = parsedResults.codeQuality.issues
    }
  }
})
</script> 