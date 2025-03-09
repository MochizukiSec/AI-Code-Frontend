<template>
  <div class="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
    <!-- 登录提示弹窗 -->
    <LoginPrompt
      v-if="showLoginPrompt"
      @login="handleLogin"
      @close="showLoginPrompt = false"
    />

    <!-- 文件上传区域 -->
    <div
      v-if="!isAnalyzing"
      class="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-6 hover:border-purple-500 transition-colors duration-200"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <!-- 云存储状态指示器 -->
      <div v-if="storageConfig" class="flex items-center justify-end mb-2">
        <div class="text-xs text-gray-400 flex items-center">
          <div :class="[
            'w-2 h-2 rounded-full mr-1', 
            isUsingCloudStorage ? 'bg-green-500' : 'bg-gray-500'
          ]"></div>
          <span v-if="isUsingCloudStorage">
            已配置{{ getStorageTypeName() }}云存储 ({{ storageConfig.bucket }})
          </span>
          <span v-else>
            云存储配置无效，将使用服务器直接上传
          </span>
          <button 
            @click="goToStorageSettings"
            class="ml-2 px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            配置
          </button>
        </div>
      </div>
      
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="mt-2 text-sm text-gray-400">拖拽文件或项目文件夹到此处</p>
        <div class="mt-4 flex flex-wrap justify-center gap-3">
          <label class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer">
            选择文件
            <input
              type="file"
              class="hidden"
              multiple
              @change="handleFileSelect"
            >
          </label>
          <label class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
            选择项目文件夹
            <input
              type="file"
              class="hidden"
              webkitdirectory
              directory
              multiple
              @change="handleProjectUpload"
            >
          </label>
        </div>
        <p class="mt-2 text-xs text-gray-500">支持单文件或整个项目文件夹分析</p>
      </div>
    </div>
    
    <!-- 规则选择区域 -->
    <div v-if="!isAnalyzing && files.length > 0" class="mb-6 bg-gray-800 bg-opacity-50 rounded-lg p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-white">分析规则选择</h3>
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="selectAllRules" 
            :checked="allRules.length > 0 && selectedRules.length === allRules.length" 
            @change="toggleAllRules($event.target.checked)"
            class="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
          >
          <label for="selectAllRules" class="ml-2 text-sm text-gray-300">全选</label>
        </div>
      </div>
      
      <div v-if="isLoadingRules" class="py-4 text-center">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-t-2 border-gray-300 border-t-purple-500"></div>
        <span class="ml-2 text-gray-400">加载规则中...</span>
      </div>
      
      <div v-else-if="rulesError" class="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
        <p class="text-red-400">{{ rulesError }}</p>
        <button 
          @click="fetchRules" 
          class="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 rounded-md text-white text-sm"
        >
          重试
        </button>
      </div>
      
      <div v-else-if="allRules.length === 0" class="py-4 text-center text-gray-400">
        未找到分析规则。将使用默认规则进行分析。
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div 
          v-for="rule in allRules" 
          :key="rule.id" 
          :class="[
            'p-3 rounded-lg border cursor-pointer transition-colors duration-200',
            selectedRules.includes(rule.id) 
              ? 'bg-purple-900 bg-opacity-30 border-purple-500' 
              : 'bg-gray-700 bg-opacity-50 border-gray-600 hover:border-gray-500'
          ]"
          @click="toggleRule(rule.id)"
        >
          <div class="flex items-center">
            <input 
              type="checkbox" 
              :id="`rule-${rule.id}`" 
              :checked="selectedRules.includes(rule.id)" 
              @change="toggleRule(rule.id)"
              class="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              @click.stop
            >
            <div class="ml-3 flex-1">
              <label :for="`rule-${rule.id}`" class="block font-medium text-gray-200 cursor-pointer">
                {{ rule.name }}
              </label>
              <p class="text-xs text-gray-400 mt-1 line-clamp-2">{{ rule.description || '无描述' }}</p>
            </div>
            <div 
              :class="[
                'px-2 py-1 rounded-full text-xs',
                rule.priority === 'critical' ? 'bg-red-900 text-red-300' :
                rule.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                rule.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                'bg-green-900 text-green-300'
              ]"
            >
              {{ 
                rule.priority === 'critical' ? '严重' :
                rule.priority === 'high' ? '高' :
                rule.priority === 'medium' ? '中' :
                '低'
              }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4 text-sm text-gray-400">
        已选择 {{ selectedRules.length }} 个规则 ({{ allRules.length > 0 ? Math.round(selectedRules.length / allRules.length * 100) : 0 }}%)
      </div>
    </div>
    
    <!-- 文件列表 -->
    <div v-if="files.length > 0 && !isAnalyzing" class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-white">
          {{ isProjectMode ? '项目文件' : '已选择的文件' }}
          <span v-if="isProjectMode" class="text-sm text-gray-400 ml-2">
            (项目: {{ projectName }}, 共{{ totalProjectFiles }}个文件)
          </span>
        </h3>
        <button 
          v-if="files.length > 0" 
          @click="clearFiles" 
          class="text-sm text-red-400 hover:text-red-300"
        >
          清空列表
        </button>
      </div>

      <!-- 项目模式下的文件树 -->
      <div v-if="isProjectMode" class="bg-gray-800 rounded-lg p-3 max-h-60 overflow-auto">
        <div class="mb-3 text-sm text-gray-400">
          <span>已过滤以下目录: </span>
          <span v-for="(folder, index) in excludedFolders" :key="folder" class="bg-gray-700 px-2 py-0.5 rounded text-xs mr-1">
            {{ folder }}{{ index < excludedFolders.length - 1 ? '' : '' }}
          </span>
        </div>
        
        <div class="text-sm text-gray-300">
          <p>项目中共 {{ totalProjectFiles }} 个文件将被分析</p>
        </div>
        
        <!-- 项目文件类型统计 -->
        <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div v-for="(count, ext) in getFileTypeCounts()" :key="ext" class="bg-gray-700 bg-opacity-50 rounded p-2">
            <div class="text-xs font-medium text-gray-300">{{ ext || '无扩展名' }}</div>
            <div class="text-lg font-bold text-white">{{ count }}</div>
          </div>
        </div>
      </div>
      
      <!-- 单文件模式下的文件列表 -->
      <ul v-else class="space-y-2">
        <li
          v-for="file in files"
          :key="file.name"
          class="flex items-center justify-between bg-gray-800 rounded-lg p-3"
        >
          <span class="text-gray-300">{{ file.name }}</span>
          <button
            @click="removeFile(file)"
            class="text-gray-400 hover:text-red-500"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      </ul>
    </div>
    
    <!-- 分析进度显示 -->
    <div v-if="isAnalyzing" class="analysis-status">
      <div class="status-header">
        <h3>{{ analysisStatus }}</h3>
        <button v-if="isRetryVisible" @click="retryAnalysis" class="retry-btn">
          <span>重试分析</span>
        </button>
      </div>
      
      <!-- 云存储上传状态 -->
      <div v-if="isUsingCloudStorage && cloudStorageStatus && cloudUploadProgress > 0 && cloudUploadProgress < 100" class="mb-3">
        <div class="flex justify-between text-sm text-gray-400 mb-1">
          <span>{{ cloudStorageStatus }}</span>
          <span>{{ cloudUploadProgress }}%</span>
        </div>
        <div class="w-full h-2 bg-gray-700 rounded overflow-hidden">
          <div class="h-full bg-blue-500" :style="{width: `${cloudUploadProgress}%`}"></div>
        </div>
      </div>
      
      <div class="progress-bar">
        <div class="progress-fill" :style="{width: `${analysisProgress}%`}"></div>
      </div>
      <div class="progress-text">{{ analysisProgress }}%</div>
    </div>
    
    <!-- 开始分析按钮 -->
    <div class="text-center">
      <button
        v-if="!isAnalyzing"
        @click="startAnalysis"
        :disabled="files.length === 0"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        开始分析
      </button>
      
      <button
        v-else
        disabled
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-indigo-600 opacity-70 cursor-not-allowed"
      >
        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        分析中...
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import LoginPrompt from '../../components/LoginPrompt.vue'
import analysisService from '../../services/analysisService'

const router = useRouter()
const userStore = useUserStore()
const files = ref([])
const showLoginPrompt = ref(false)
const isAnalyzing = ref(false)
const currentTaskId = ref(null)
const analysisProgress = ref(0)
const analysisStatus = ref('')
const isRetryVisible = ref(false)
const selectedRules = ref([])
const isLoadingRules = ref(false)
const rulesError = ref(null)
const allRules = ref([])

// 云存储配置
const storageConfig = ref(null)
const isUsingCloudStorage = computed(() => 
  storageConfig.value && 
  storageConfig.value.type && 
  storageConfig.value.bucket && 
  storageConfig.value.accessKeyId && 
  storageConfig.value.accessKeySecret
)
const cloudStorageStatus = ref('')
const cloudUploadProgress = ref(0)

// 项目分析相关状态
const isProjectMode = ref(false)
const projectName = ref('')
const totalProjectFiles = ref(0)
const selectedProjectFiles = ref(0)
const projectStructure = ref({})
const excludedFolders = ref(['node_modules', 'dist', 'build', '.git'])

// 加载云存储配置
const loadStorageConfig = () => {
  try {
    const savedConfig = localStorage.getItem('storageConfig')
    if (savedConfig) {
      storageConfig.value = JSON.parse(savedConfig)
      console.log('从本地加载存储配置成功:', storageConfig.value.type)
    } else {
      console.log('未找到存储配置')
      storageConfig.value = null
    }
  } catch (error) {
    console.error('加载存储配置失败:', error)
    storageConfig.value = null
  }
}

// 获取所有规则
const fetchRules = async () => {
  try {
    isLoadingRules.value = true
    rulesError.value = null
    console.log('正在获取规则列表...')
    
    // 从API获取规则
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/rules`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`获取规则失败: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('获取规则成功:', data)
    
    if (data && data.data) {
      allRules.value = data.data
      // 默认选中所有活跃规则
      selectedRules.value = allRules.value
        .filter(rule => rule.status === 'active')
        .map(rule => rule.id)
    } else {
      // 如果API响应没有规则数据，使用默认规则
      console.log('未从API获取到规则，使用默认规则')
      allRules.value = analysisService.getDefaultRules()
      // 默认选中所有规则
      selectedRules.value = allRules.value.map(rule => rule.id)
    }
  } catch (error) {
    console.error('获取规则失败:', error)
    rulesError.value = error.message
    
    // 使用默认规则作为备选
    console.log('使用默认规则作为备选')
    allRules.value = analysisService.getDefaultRules()
    selectedRules.value = allRules.value.map(rule => rule.id)
  } finally {
    isLoadingRules.value = false
  }
}

// 切换规则选择状态
const toggleRule = (ruleId) => {
  const index = selectedRules.value.indexOf(ruleId)
  if (index > -1) {
    selectedRules.value.splice(index, 1)
  } else {
    selectedRules.value.push(ruleId)
  }
  console.log('已选择规则:', selectedRules.value)
}

// 切换所有规则
const toggleAllRules = (checked) => {
  if (checked) {
    selectedRules.value = allRules.value.map(rule => rule.id)
  } else {
    selectedRules.value = []
  }
}

// 检查用户登录状态
onMounted(() => {
  console.log('ProjectUpload组件加载完成')
  // 检查认证状态
  userStore.checkAuth()
  console.log('Current login status:', userStore.isLoggedIn)
  // 如果存在token但isLoggedIn为false，重新设置登录状态
  const token = localStorage.getItem('token')
  if (token && !userStore.isLoggedIn) {
    console.log('发现token但未登录，尝试恢复登录状态')
    const userData = localStorage.getItem('user')
    if (userData) {
      userStore.login(JSON.parse(userData))
    } else {
      // 创建默认用户数据
      userStore.login({
        email: 'admin@example.com',
        name: 'Admin User'
      })
    }
    console.log('登录状态已恢复:', userStore.isLoggedIn)
  }
  // 组件挂载时加载规则
  fetchRules()
  
  // 加载云存储配置
  loadStorageConfig()
})

// 处理文件选择
const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  files.value.push(...selectedFiles)
}

// 处理项目文件夹上传
const handleProjectUpload = (event) => {
  const uploadedFiles = Array.from(event.target.files)
  console.log(`接收到项目上传，共 ${uploadedFiles.length} 个文件`)
  
  // 从第一个文件路径推断项目名称
  if (uploadedFiles.length > 0) {
    // 获取第一个文件的路径，以找出项目名称
    const firstFilePath = uploadedFiles[0].webkitRelativePath
    const pathParts = firstFilePath.split('/')
    if (pathParts.length > 0) {
      projectName.value = pathParts[0] // 项目根目录名称
      console.log(`项目名称: ${projectName.value}`)
    }
  }
  
  // 过滤排除的文件夹
  const filteredFiles = uploadedFiles.filter(file => {
    // 检查文件路径是否在排除的文件夹中
    return !excludedFolders.value.some(folder => 
      file.webkitRelativePath.includes(`/${folder}/`)
    )
  })
  
  console.log(`过滤后保留 ${filteredFiles.length} 个文件`)
  totalProjectFiles.value = filteredFiles.length
  selectedProjectFiles.value = filteredFiles.length
  
  // 构建项目结构树
  buildProjectStructure(filteredFiles)
  
  // 切换到项目模式
  isProjectMode.value = true
  
  // 添加到文件列表
  files.value = [...filteredFiles]
  
  // 如果文件太多，显示警告
  if (filteredFiles.length > 100) {
    alert(`注意：项目包含 ${filteredFiles.length} 个文件，分析可能需要较长时间。`)
  }
}

// 构建项目结构树
const buildProjectStructure = (files) => {
  const structure = {}
  
  files.forEach(file => {
    const path = file.webkitRelativePath
    const pathParts = path.split('/')
    
    // 从结构树中删除项目名称（第一层）
    pathParts.shift()
    
    let currentLevel = structure
    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) {
        // 文件节点
        currentLevel[part] = {
          type: 'file',
          name: part,
          path: path,
          size: file.size,
          file: file
        }
      } else {
        // 目录节点
        if (!currentLevel[part]) {
          currentLevel[part] = {
            type: 'directory',
            name: part,
            children: {}
          }
        }
        currentLevel = currentLevel[part].children
      }
    })
  })
  
  projectStructure.value = structure
  console.log('项目结构构建完成:', projectStructure.value)
}

// 处理拖放事件，支持文件和文件夹
const handleDrop = (event) => {
  // 获取所有拖放的项目
  const items = event.dataTransfer.items
  
  if (items.length > 0) {
    // 检查是否为文件夹
    const firstItem = items[0].webkitGetAsEntry()
    
    if (firstItem && firstItem.isDirectory) {
      // 处理文件夹
      alert("请使用\"选择项目文件夹\"按钮上传文件夹，拖放文件夹在某些浏览器中不被支持。")
      return
    }
  }
  
  // 处理单个文件拖放
  const droppedFiles = Array.from(event.dataTransfer.files)
  files.value.push(...droppedFiles)
  isProjectMode.value = false
}

// 移除文件
const removeFile = (file) => {
  const index = files.value.indexOf(file)
  if (index > -1) {
    files.value.splice(index, 1)
  }
}

// 处理登录
const handleLogin = async () => {
  console.log('处理登录请求...')
  try {
    // 关闭登录提示
    showLoginPrompt.value = false
    
    // 使用真实账户登录
    const credentials = {
      email: 'admin@example.com',
      password: 'password123'
    }
    
    // 使用auth store的login方法进行登录
    await userStore.login(credentials)
    
    // 检查token是否已设置
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('登录成功但未获取到认证令牌')
    }
    
    // 确认用户已登录
    if (!userStore.isLoggedIn) {
      throw new Error('登录未能成功设置用户状态')
    }
    
    // 登录成功，继续分析流程
    await proceedWithAnalysis()
  } catch (error) {
    console.error('登录过程出错:', error)
    
    // 显示错误消息
    alert(`登录失败: ${error.message || '未知错误'}`)
    
    // 重新显示登录提示
    showLoginPrompt.value = true
  }
}

// 开始分析
const startAnalysis = async () => {
  console.log('Starting analysis...')
  console.log('Login status:', userStore.isLoggedIn)
  
  try {
    // 再次检查认证状态（以防状态变化）
    userStore.checkAuth()
    
    // 确保用户已登录
    if (!userStore.isLoggedIn) {
      console.log('用户未登录，显示登录提示')
      showLoginPrompt.value = true
      return
    }
    
    // 如果还没有加载规则，先加载规则
    if (allRules.value.length === 0) {
      await fetchRules()
    }
    
    // 开始分析流程
    await proceedWithAnalysis()
  } catch (error) {
    console.error('分析过程错误:', error)
    
    // 显示更详细的错误信息
    let errorMessage = error.message || '未知错误'
    
    // 尝试解析更复杂的错误对象
    if (typeof error === 'object' && error !== null) {
      if (error.toString() === '[object Object]') {
        // 对象无法直接转为字符串，尝试提取有用信息
        errorMessage = JSON.stringify(error)
        try {
          // 尝试从常见的错误属性中提取信息
          if (error.message) errorMessage = error.message
          else if (error.error) errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error)
          else if (error.statusText) errorMessage = error.statusText
        } catch (e) {
          console.error('处理错误信息时发生错误:', e)
          errorMessage = '解析错误详情失败'
        }
      }
    }
    
    // 处理特定错误
    if (errorMessage.includes('401') || errorMessage.includes('未授权') || errorMessage.includes('Unauthorized') || errorMessage.includes('认证已过期')) {
      errorMessage = '认证失败，请重新登录后再试'
      // 清除可能过期的令牌
      localStorage.removeItem('token')
      userStore.logout()
      showLoginPrompt.value = true
    }
    
    // 显示错误弹窗
    alert(`分析过程中出现错误: ${errorMessage}`)
    
    // 重置分析状态
    isAnalyzing.value = false
    analysisProgress.value = 0
    analysisStatus.value = ''
  }
}

// 监控分析进度
const monitorProgress = async (taskId, isProject = false) => {
  try {
    // 初始化轮询
    let isCompleted = false;
    let isFailed = false;
    
    // 进度卡住检测
    let consecutiveUnchangedProgressCount = 0;
    let lastProgressValue = -1;
    let lastStatus = '';
    
    // 离线模式检测
    let isOfflineMode = false;
    
    // 项目分析阶段跟踪
    let projectStage = '';
    let processedFiles = 0;
    let totalFiles = 0;
    
    // 返回一个Promise以便异步处理
    return new Promise((resolve, reject) => {
      // 每秒检查一次进度
      const progressInterval = setInterval(async () => {
        try {
          const progressData = await analysisService.getAnalysisProgress(taskId);
          analysisProgress.value = progressData.progress || 0;
          
          // 更新状态信息，处理特殊的项目分析信息
          if (isProject && progressData.details) {
            // 更新项目分析状态
            if (progressData.details.stage) {
              projectStage = progressData.details.stage;
            }
            
            if (progressData.details.processedFiles !== undefined) {
              processedFiles = progressData.details.processedFiles;
            }
            
            if (progressData.details.totalFiles !== undefined) {
              totalFiles = progressData.details.totalFiles;
            }
            
            // 构建详细的状态信息
            analysisStatus.value = `分析中 - ${projectStage} (${processedFiles}/${totalFiles}文件)`;
          } else {
            analysisStatus.value = progressData.status;
          }
          
          // 记录离线模式
          if (progressData.offline) {
            isOfflineMode = true;
            if (isProject) {
              analysisStatus.value += ' (离线模式)';
            } else {
              analysisStatus.value += ' (离线模式)';
            }
          }
          
          // 记录进度
          console.log(`分析进度: ${analysisProgress.value}%, 状态: ${analysisStatus.value}`, 
                     progressData.offline ? '(离线模式)' : '');
          
          // 检查进度是否发生变化
          if (lastProgressValue === analysisProgress.value && lastStatus === analysisStatus.value) {
            consecutiveUnchangedProgressCount++;
            
            // 如果长时间没有进度变化，提供更详细的信息
            if (consecutiveUnchangedProgressCount > 15) {
              console.log(`进度已停留在 ${analysisProgress.value}% ${consecutiveUnchangedProgressCount} 秒`);
              
              if (isProject) {
                analysisStatus.value += " - 处理大型项目可能需要较长时间...";
              }
            }
          } else {
            consecutiveUnchangedProgressCount = 0;
          }
          
          // 更新上一次的值
          lastProgressValue = analysisProgress.value;
          lastStatus = analysisStatus.value;
          
          // 检查是否完成
          if (progressData.status === 'completed' || analysisProgress.value >= 100) {
            isCompleted = true;
            clearInterval(progressInterval);
            console.log('分析完成');
            
            try {
              // 获取分析结果
              const results = await analysisService.getAnalysisResults(taskId);
              
              // 保存结果到localStorage
              try {
                localStorage.setItem('analysisResults', JSON.stringify(results));
                localStorage.setItem(`analysis_results_${taskId}`, JSON.stringify(results));
              } catch (e) {
                console.error('保存分析结果失败，可能是结果太大:', e);
                // 尝试保存分析摘要
                try {
                  const summary = {
                    taskId: taskId,
                    date: new Date().toISOString(),
                    isProject: isProject,
                    totalFiles: isProject ? totalFiles : files.value.length,
                    summary: '完整结果太大无法保存，但分析已完成'
                  };
                  localStorage.setItem('analysisResultsSummary', JSON.stringify(summary));
                } catch (e) {}
              }
              
              // 显示成功消息
              if (isProject) {
                alert(`项目 ${projectName.value} 分析完成！正在跳转到结果页面...`);
              } else {
                alert('分析完成！正在跳转到结果页面...');
              }
              
              // 构建结果路由路径
              const resultPath = isProject 
                ? `/analysis-report/project/${taskId}` 
                : `/analysis-report/${taskId}`;
                
              // 导航到报告页面
              router.push(resultPath);
              resolve(results); // 成功完成
            } catch (resultError) {
              console.error('获取结果失败:', resultError);
              
              // 保存错误信息到localStorage
              localStorage.setItem('analysisError', JSON.stringify({
                message: resultError.message || '获取结果时发生错误',
                timestamp: new Date().toISOString(),
                stack: resultError.stack,
                isProject: isProject
              }));
              
              if (isOfflineMode) {
                // 离线模式下的错误，仍尝试加载本地报告
                alert('离线模式：无法获取结果，将尝试使用本地数据。');
                router.push(`/analysis-report?mode=local&project=${isProject}`);
                resolve({ offline: true });
              } else {
                alert('获取分析结果时出错：' + (resultError.message || '未知错误') + '。将尝试继续。');
                router.push(`/analysis-report?error=fetch_failed&project=${isProject}`);
                reject(resultError);
              }
            }
          } else if (progressData.status === 'failed') {
            isFailed = true;
            clearInterval(progressInterval);
            const errorMsg = `分析失败: ${progressData.message || '未知错误'}`;
            console.error(errorMsg);
            
            // 更新UI
            analysisStatus.value = '失败: ' + (progressData.message || '未知错误');
            isRetryVisible.value = true;
            
            // 对于模型错误，显示更具体的指导
            if (progressData.message && progressData.message.includes('AI模型')) {
              alert(`分析失败 (AI模型问题): ${progressData.message}\n\n请前往设置页面配置并保存AI模型信息，然后重试。`);
              // 提供一个链接跳转到设置页面
              const goToSettings = confirm('是否前往设置页面配置AI模型？');
              if (goToSettings) {
                router.push('/settings');
                return;
              }
            } else if (isProject && progressData.message && progressData.message.includes('文件太多')) {
              // 针对项目文件过多的错误提供特殊处理
              alert(`项目分析失败: ${progressData.message}\n\n您的项目可能包含太多文件，请尝试缩小分析范围或使用本地模式。`);
            }
            
            reject(new Error(errorMsg));
          }
        } catch (error) {
          console.error('监控进度错误:', error);
          // 更新UI显示错误
          if (isProject) {
            analysisStatus.value = '项目监控错误: ' + (error.message || '未知错误');
          } else {
            analysisStatus.value = '监控错误: ' + (error.message || '未知错误');
          }
          
          // 不要立即中断，可能是临时网络问题
          // 标记一个计数器，如果连续多次错误再中断
          consecutiveUnchangedProgressCount++;
          
          if (consecutiveUnchangedProgressCount > 10) {
            // 连续10次错误，终止监控
            clearInterval(progressInterval);
            // 但不要抛出异常，尝试继续
            isRetryVisible.value = true;
            // 仍然使用reject以通知调用方
            reject(error);
          }
        }
      }, 1000);
    });
  } catch (error) {
    // 捕获初始化过程中的错误
    console.error('初始化进度监控失败:', error);
    analysisStatus.value = '监控启动失败: ' + error.message;
    isRetryVisible.value = true;
    throw error;
  }
};

// 添加重试分析方法
const retryAnalysis = async () => {
  try {
    isRetryVisible.value = false;
    analysisStatus.value = '重新启动分析...';
    
    // 保存当前任务ID
    const taskId = currentTaskId.value;
    
    if (!taskId) {
      throw new Error('未找到有效的任务ID，无法重试');
    }
    
    console.log('重试分析任务:', taskId);
    
    try {
      // 重新开始分析
      const startResult = await analysisService.startAnalysis(taskId, files.value);
      console.log('重新启动分析成功:', startResult);
      
      // 再次监控进度
      analysisStatus.value = '分析中...';
      const monitorResult = await monitorProgress(taskId, isProjectMode.value);
      
      console.log('重试监控完成:', monitorResult);
      // 结果已在monitorProgress中处理
      return monitorResult;
    } catch (error) {
      console.error('重试过程中出错:', error);
      // 显示更友好的错误信息
      analysisStatus.value = '重试失败: ' + (error.message || '未知错误');
      isRetryVisible.value = true;
      return { error };
    }
  } catch (error) {
    console.error('重试分析失败:', error);
    analysisStatus.value = '重试失败: ' + (error.message || '未知错误');
    alert(`重试失败: ${error.message || '未知错误'}`);
    isAnalyzing.value = false;
    isRetryVisible.value = true;
    throw error;
  }
};

// 开始分析流程
const proceedWithAnalysis = async () => {
  try {
    // 显示加载中状态
    isAnalyzing.value = true
    
    // 1. 创建分析任务
    try {
      analysisStatus.value = '创建分析任务...';
      console.log('创建分析任务');
      
      // 任务类型标记
      const taskType = isProjectMode.value ? 'project' : 'file';
      
      // 创建任务
      const createResult = await analysisService.createAnalysisTask(taskType);
      currentTaskId.value = createResult.taskId;
      console.log('分析任务已创建:', currentTaskId.value);
    } catch (createError) {
      throw new Error(`创建分析任务失败: ${createError.message}`);
    }
    
    // 2. 上传文件 - 修改为使用新的uploadFiles方法
    try {
      analysisStatus.value = '上传文件...';
      
      // 添加上传进度信息
      if (isProjectMode.value) {
        analysisStatus.value = `上传项目文件 (${projectName.value}, ${files.value.length}个文件)...`;
      }
      
      console.log('上传文件');
      const uploadResult = await uploadFiles(currentTaskId.value, files.value);
      console.log('文件已上传:', uploadResult);
    } catch (uploadError) {
      throw new Error(`上传文件失败: ${uploadError.message}`);
    }
    
    // 3. 开始分析
    try {
      analysisStatus.value = '开始分析...';
      console.log('启动分析');
      
      // 传递选中的规则ID和项目模式标记
      console.log('传递选中的规则ID:', selectedRules.value);
      const analysisResult = await analysisService.startAnalysis(
        currentTaskId.value, 
        files.value,
        selectedRules.value,
        isProjectMode.value
      );
      console.log('分析已启动:', analysisResult);
    } catch (startError) {
      throw new Error(`启动分析失败: ${startError.message}`);
    }
    
    // 4. 监控分析进度
    try {
      analysisStatus.value = '分析中...';
      console.log('监控分析进度');
      
      // 在项目模式下提供更详细的状态信息
      if (isProjectMode.value) {
        analysisStatus.value = `分析项目 ${projectName.value} 中...`;
      }
      
      await monitorProgress(currentTaskId.value, isProjectMode.value);
    } catch (monitorError) {
      throw new Error(`监控分析进度失败: ${monitorError.message}`);
    }
  } catch (error) {
    console.error('分析过程错误:', error);
    alert(`分析过程出错: ${error.message}`);
    isAnalyzing.value = false;
    analysisProgress.value = 0;
    analysisStatus.value = '';
  }
};

// 读取文件内容
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target.result)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsText(file)
  })
}

// 清空文件列表
const clearFiles = () => {
  files.value = [];
  isProjectMode.value = false;
  projectName.value = '';
  totalProjectFiles.value = 0;
  selectedProjectFiles.value = 0;
  projectStructure.value = {};
  excludedFolders.value = ['node_modules', 'dist', 'build', '.git'];
};

// 获取文件类型统计
const getFileTypeCounts = () => {
  const counts = {};
  files.value.forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    counts[ext] = (counts[ext] || 0) + 1;
  });
  return counts;
};

// 上传文件到云存储
const uploadToCloudStorage = async (files, taskId) => {
  try {
    if (!isUsingCloudStorage.value) {
      console.log('未配置云存储，跳过上传')
      return { useCloudStorage: false }
    }
    
    cloudStorageStatus.value = '正在准备上传到云存储...'
    console.log(`准备上传到${storageConfig.value.type}云存储`)
    
    // 创建文件映射数组，记录本地文件和云存储地址的对应关系
    const fileMapping = []
    
    // 临时保存上传状态
    const totalFiles = files.length
    let uploadedFiles = 0
    
    // 构建通用的云存储元数据
    const metadata = {
      taskId: taskId,
      timestamp: new Date().toISOString(),
      projectName: isProjectMode.value ? projectName.value : undefined,
      isProject: isProjectMode.value
    }
    
    // 对每个文件单独上传
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i]
      
      // 构建云存储路径
      let cloudPath = ''
      
      if (storageConfig.value.prefix) {
        cloudPath += storageConfig.value.prefix
        if (!cloudPath.endsWith('/')) cloudPath += '/'
      }
      
      // 添加任务ID和时间戳目录
      cloudPath += `${taskId}/`
      
      // 如果是项目模式，保留文件相对路径
      if (isProjectMode.value && file.webkitRelativePath) {
        // 移除第一个目录名（项目名称）
        const relativePath = file.webkitRelativePath.split('/')
        relativePath.shift() // 移除项目名
        if (relativePath.length > 0) {
          cloudPath += relativePath.join('/')
        } else {
          cloudPath += file.name
        }
      } else {
        // 单文件模式，直接使用文件名
        cloudPath += file.name
      }

      // 更新上传状态
      cloudStorageStatus.value = `上传文件 ${i + 1}/${totalFiles}: ${file.name}`
      
      try {
        // 创建FormData对象
        const formData = new FormData()
        formData.append('file', file)
        formData.append('path', cloudPath)
        formData.append('storageType', storageConfig.value.type)
        formData.append('bucket', storageConfig.value.bucket)
        
        // 添加其他存储参数
        Object.keys(storageConfig.value).forEach(key => {
          if (key !== 'type' && key !== 'bucket' && storageConfig.value[key]) {
            formData.append(key, storageConfig.value[key])
          }
        })
        
        // 添加元数据
        formData.append('metadata', JSON.stringify(metadata))
        
        // 上传到服务器端的云存储代理API
        const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/storage/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.message || `上传失败，状态码: ${uploadResponse.status}`)
        }
        
        const uploadResult = await uploadResponse.json()
        
        // 记录文件映射
        fileMapping.push({
          fileName: file.name,
          originalPath: isProjectMode.value ? file.webkitRelativePath : file.name,
          cloudPath: uploadResult.path,
          url: uploadResult.url,
          size: file.size,
          storageType: storageConfig.value.type,
          bucket: storageConfig.value.bucket
        })
        
        // 更新进度
        uploadedFiles++
        cloudUploadProgress.value = Math.round((uploadedFiles / totalFiles) * 100)
      } catch (error) {
        console.error(`上传文件 ${file.name} 到云存储失败:`, error)
        
        // 如果单个文件上传失败，记录错误但继续上传其他文件
        fileMapping.push({
          fileName: file.name,
          originalPath: isProjectMode.value ? file.webkitRelativePath : file.name,
          error: error.message || '上传失败',
          size: file.size
        })
      }
    }
    
    console.log(`云存储上传完成，成功: ${fileMapping.filter(f => !f.error).length}/${totalFiles} 文件`)
    
    // 如果所有文件都上传失败，抛出错误
    if (fileMapping.every(f => f.error)) {
      throw new Error('所有文件上传到云存储都失败了')
    }
    
    // 返回文件映射信息
    return {
      useCloudStorage: true,
      fileMapping,
      storageConfig: {
        type: storageConfig.value.type,
        bucket: storageConfig.value.bucket,
        region: storageConfig.value.region
      }
    }
  } catch (error) {
    console.error('云存储上传整体失败:', error)
    // 如果云存储上传失败，返回不使用云存储的标记
    return { 
      useCloudStorage: false, 
      error: error.message || '云存储上传失败'
    }
  }
}

// 修改上传文件方法
const uploadFiles = async (taskId, files) => {
  // 检查是否使用云存储
  if (isUsingCloudStorage.value) {
    try {
      // 使用云存储上传
      analysisStatus.value = '正在上传到云存储...'
      
      // 添加上传进度信息
      if (isProjectMode.value) {
        analysisStatus.value = `上传项目文件到云存储 (${projectName.value}, ${files.length}个文件)...`
      }
      
      const cloudUploadResult = await uploadToCloudStorage(files, taskId)
      
      if (cloudUploadResult.useCloudStorage && cloudUploadResult.fileMapping) {
        // 成功上传到云存储，将文件映射信息传递给服务器
        analysisStatus.value = '云存储上传完成，通知服务器...'
        console.log('通知服务器使用云存储文件')
        
        // 构建云存储分析请求
        const cloudStorageAnalysisRequest = {
          taskId,
          cloudStorage: {
            enabled: true,
            fileMapping: cloudUploadResult.fileMapping,
            config: cloudUploadResult.storageConfig
          }
        }
        
        // 调用API告知服务器使用云存储文件
        const notifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/analysis/${taskId}/use-cloud-storage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(cloudStorageAnalysisRequest)
        })
        
        if (!notifyResponse.ok) {
          const errorData = await notifyResponse.json()
          throw new Error(errorData.message || `通知服务器失败，状态码: ${notifyResponse.status}`)
        }
        
        const notifyResult = await notifyResponse.json()
        console.log('服务器已确认使用云存储文件:', notifyResult)
        
        return {
          success: true,
          useCloudStorage: true,
          message: '文件已上传到云存储'
        }
      } else if (cloudUploadResult.error) {
        // 云存储上传失败，回退到直接上传
        console.warn('云存储上传失败，回退到直接上传:', cloudUploadResult.error)
        analysisStatus.value = '云存储上传失败，使用直接上传...'
        
        // 回退到原始上传方法
        const directUploadResult = await analysisService.uploadFiles(taskId, files)
        return directUploadResult
      } else {
        // 未使用云存储，使用原始上传方法
        console.log('未使用云存储，使用直接上传')
        const directUploadResult = await analysisService.uploadFiles(taskId, files)
        return directUploadResult
      }
    } catch (error) {
      console.error('云存储上传处理过程出错:', error)
      // 出错时回退到原始上传方法
      analysisStatus.value = '云存储处理出错，使用直接上传...'
      const directUploadResult = await analysisService.uploadFiles(taskId, files)
      return directUploadResult
    }
  } else {
    // 没有配置云存储，使用原始上传方法
    console.log('未配置云存储，使用直接上传')
    const directUploadResult = await analysisService.uploadFiles(taskId, files)
    return directUploadResult
  }
}

// 获取存储类型显示名称
const getStorageTypeName = () => {
  if (!storageConfig.value || !storageConfig.value.type) return '';
  
  const storageTypes = {
    's3': 'AWS S3',
    'oss': '阿里云 OSS',
    'cos': '腾讯云 COS',
    'obs': '华为云 OBS'
  };
  
  return storageTypes[storageConfig.value.type] || storageConfig.value.type;
};

// 跳转到存储设置页面
const goToStorageSettings = () => {
  router.push('/settings');
};
</script>

<style scoped>
/* 现有样式 */

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.retry-btn {
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #ea580c;
}

/* 其余样式 */
</style> 