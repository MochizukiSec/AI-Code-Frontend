<template>
  <div class="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
    <h3 class="text-xl font-semibold text-white mb-4">性能优化建议</h3>
    
    <!-- 性能评分 -->
    <div class="bg-white/5 rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-white font-medium">整体性能评分</h4>
        <div class="text-3xl font-bold" :class="getScoreColor">
          {{ performanceScore }}/100
        </div>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-4">
        <div class="h-full rounded-full transition-all duration-500"
             :class="getScoreBackgroundColor"
             :style="{ width: `${performanceScore}%` }">
        </div>
      </div>
    </div>

    <!-- 性能指标 -->
    <div v-if="performanceMetrics.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div v-for="(metric, index) in performanceMetrics" 
           :key="index"
           class="bg-white/5 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-1">
            <div class="text-gray-400 text-sm mb-1">{{ metric.name }}</div>
            <div class="text-2xl font-bold text-white">
              {{ metric.value }}
              <span class="text-sm font-normal text-gray-400">{{ metric.unit }}</span>
            </div>
          </div>
          <div :class="getMetricStatusColor(metric.status)" 
               class="px-2 py-1 rounded text-xs font-medium">
            {{ metric.status }}
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-400">
          {{ metric.description }}
        </div>
      </div>
    </div>

    <!-- 优化建议列表 -->
    <div class="space-y-4">
      <div v-for="(suggestion, index) in optimizationSuggestions" 
           :key="index"
           class="bg-white/5 rounded-lg p-4">
        <div class="flex items-start">
          <div :class="getSuggestionPriorityColor(suggestion.priority)"
               class="w-2 h-2 rounded-full mt-2 mr-3">
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="text-white font-medium">{{ suggestion.title }}</h4>
              <span :class="getSuggestionPriorityTextColor(suggestion.priority)"
                    class="text-sm font-medium">
                {{ suggestion.priority.toUpperCase() }}优先级
              </span>
            </div>
            <p class="text-gray-400 text-sm mt-1">{{ suggestion.description }}</p>
            <div class="mt-3 space-y-2">
              <div class="text-sm text-gray-500">
                影响范围: {{ suggestion.impact }}
              </div>
              <div class="text-sm text-gray-500">
                预期提升: {{ suggestion.improvement }}
              </div>
              <div class="text-sm text-gray-500">
                实现难度: {{ suggestion.difficulty }}
              </div>
              <div class="mt-3 text-sm text-gray-400">
                <strong class="text-white">优化方法:</strong>
                <p class="mt-1">{{ suggestion.solution }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 性能评分
const performanceScore = ref(0)

// 获取评分颜色
const getScoreColor = computed(() => {
  const score = performanceScore.value
  if (score >= 90) return 'text-green-400'
  if (score >= 70) return 'text-yellow-400'
  return 'text-red-400'
})

// 获取评分背景颜色
const getScoreBackgroundColor = computed(() => {
  const score = performanceScore.value
  if (score >= 90) return 'bg-green-400'
  if (score >= 70) return 'bg-yellow-400'
  return 'bg-red-400'
})

// 性能指标数据
const performanceMetrics = ref([])

// 获取指标状态颜色
const getMetricStatusColor = (status) => {
  const colors = {
    '良好': 'bg-green-400 text-green-900',
    '需优化': 'bg-yellow-400 text-yellow-900',
    '较差': 'bg-red-400 text-red-900'
  }
  return colors[status] || 'bg-gray-400 text-gray-900'
}

// 优化建议数据
const optimizationSuggestions = ref([])

// 获取建议优先级颜色
const getSuggestionPriorityColor = (priority) => {
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  }
  return colors[priority] || 'bg-gray-500'
}

// 获取建议优先级文字颜色
const getSuggestionPriorityTextColor = (priority) => {
  const colors = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400'
  }
  return colors[priority] || 'text-gray-400'
}

// 从 localStorage 加载分析结果
onMounted(() => {
  const results = localStorage.getItem('analysisResults')
  if (results) {
    const parsedResults = JSON.parse(results)
    if (parsedResults.results && parsedResults.results.performance) {
      performanceScore.value = parsedResults.results.performance.score
      performanceMetrics.value = parsedResults.results.performance.metrics
      optimizationSuggestions.value = parsedResults.results.performance.suggestions
    } else if (parsedResults.performance) {
      // 兼容旧格式
      performanceScore.value = parsedResults.performance.score
      performanceMetrics.value = parsedResults.performance.metrics
      optimizationSuggestions.value = parsedResults.performance.suggestions
    }
  }
})
</script> 