<template>
  <div>
    <!-- 加载状态和错误提示 -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      <span class="ml-3 text-white">加载规则中...</span>
    </div>
    
    <div v-else-if="error" class="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6">
      <p class="font-medium">加载规则失败</p>
      <p class="text-sm">{{ error }}</p>
      <button 
        @click="fetchRules" 
        class="mt-2 px-4 py-1 bg-red-500/30 hover:bg-red-500/50 rounded-md text-white text-sm transition-colors"
      >
        重试
      </button>
    </div>
    
    <div v-else-if="rules.length === 0" class="bg-blue-500/20 text-blue-300 p-4 rounded-lg mb-6">
      <p class="font-medium">暂无规则</p>
      <p class="text-sm">点击"添加规则"按钮创建第一条规则</p>
    </div>
    
    <!-- 规则列表 -->
    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">描述</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="rule in rules" :key="rule.id" class="hover:bg-white/5">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-white">{{ rule.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-300">{{ rule.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-blue-500/20 text-blue-300': rule.type === 'security',
                    'bg-green-500/20 text-green-300': rule.type === 'quality',
                    'bg-yellow-500/20 text-yellow-300': rule.type === 'performance'
                  }"
                >
                  {{ rule.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-500/20 text-green-300': rule.isActive,
                    'bg-gray-500/20 text-gray-300': !rule.isActive
                  }"
                >
                  {{ rule.isActive ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  class="text-indigo-400 hover:text-indigo-300 mr-3"
                  @click="$emit('edit', rule)"
                >
                  编辑
                </button>
                <button 
                  class="text-red-400 hover:text-red-300"
                  @click="$emit('delete', rule)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import apiService from '../../services/api.service'

const props = defineProps({
  filter: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:stats', 'edit', 'delete'])

// 规则列表
const rules = ref([])

// 加载状态
const loading = ref(false)
const error = ref(null)

// 获取规则列表
const fetchRules = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('获取规则列表...')
    const response = await apiService.getRules()
    console.log('规则列表响应:', response)
    
    if (response && response.rules) {
      rules.value = response.rules
      
      // 更新统计数据
      const stats = {
        totalRules: rules.value.length,
        activeRules: rules.value.filter(r => r.isActive).length,
        totalTriggers: rules.value.reduce((sum, r) => sum + (r.usageCount || 0), 0),
        avgDetectionRate: 0
      }
      
      emit('update:stats', stats)
    } else {
      console.warn('获取规则列表失败: 响应格式不正确')
      error.value = '获取规则列表失败: 响应格式不正确'
    }
  } catch (err) {
    console.error('获取规则列表错误:', err)
    error.value = err.message || '获取规则列表失败'
  } finally {
    loading.value = false
  }
}

// 在组件挂载时获取规则列表
onMounted(() => {
  fetchRules()
})

// 监听过滤器变化
watch(() => props.filter, () => {
  fetchRules()
}, { deep: true })
</script> 