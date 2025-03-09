<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
    <!-- 顶部导航栏 -->
    <header class="bg-gray-800 bg-opacity-50 backdrop-blur-lg border-b border-gray-700">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          代码分析报告
        </h1>
        <div class="flex space-x-4">
          <button 
            @click="checkAiStatus" 
            class="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition-colors duration-200"
          >
            检查AI状态
          </button>
          <button 
            @click="goBack" 
            class="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
          >
            返回
          </button>
        </div>
      </div>
    </header>

    <!-- AI状态弹窗 -->
    <div v-if="showAiStatus" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl border border-gray-700">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-purple-400">AI模型状态检查</h2>
          <button @click="showAiStatus = false" class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="p-3 bg-gray-900 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-400 mb-2">AI结果检测</h3>
            <p class="mb-2 text-gray-300">
              {{ aiStatusInfo.hasAiResults 
                ? '✅ 检测到AI分析结果' 
                : '❌ 未检测到AI分析结果' }}
            </p>
            <p v-if="aiStatusInfo.location" class="text-sm text-gray-400">
              位置: {{ aiStatusInfo.location }}
            </p>
          </div>
          
          <div class="p-3 bg-gray-900 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-400 mb-2">模型配置信息</h3>
            <div v-if="aiStatusInfo.model" class="space-y-1">
              <p class="text-gray-300">模型名称: {{ aiStatusInfo.model.name || '未知' }}</p>
              <p class="text-gray-300">提供商: {{ aiStatusInfo.model.provider || '未知' }}</p>
              <p class="text-gray-300">API密钥: {{ aiStatusInfo.model.hasApiKey ? '已配置' : '未配置' }}</p>
            </div>
            <p v-else class="text-gray-400">未找到模型配置信息</p>
          </div>
          
          <div class="p-3 bg-gray-900 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-400 mb-2">诊断建议</h3>
            <ul class="list-disc list-inside space-y-1 text-gray-300">
              <li v-if="!aiStatusInfo.hasAiResults">确认后端API已正确调用AI模型</li>
              <li v-if="!aiStatusInfo.model?.hasApiKey">确认已正确配置API密钥</li>
              <li v-if="aiStatusInfo.apiRequestIssue">检查API请求是否包含必要参数</li>
              <li>检查后端日志是否有AI调用的详细记录</li>
              <li>确认API权限足够获取AI分析结果</li>
            </ul>
          </div>
        </div>
        
        <div class="mt-4 flex justify-end">
          <button 
            @click="showAiStatus = false" 
            class="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <main class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-lg text-gray-300">加载分析结果中...</p>
      </div>

      <div v-else-if="error" class="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-red-400 mb-2">加载分析结果失败</h2>
        <p class="text-gray-300">{{ error }}</p>
        
        <div class="mt-4 p-4 bg-gray-800 rounded-lg">
          <h3 class="text-lg font-medium text-gray-200 mb-2">诊断信息</h3>
          
          <div class="space-y-2">
            <p class="text-sm text-gray-400">检查以下可能的问题：</p>
            
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span class="text-yellow-200">数据格式：</span>
              <span class="text-gray-300">服务器可能返回了未预期的结果格式</span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span class="text-yellow-200">存储容量：</span>
              <span class="text-gray-300">结果可能太大，超出了浏览器存储限制</span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span class="text-yellow-200">数据引用：</span>
              <span class="text-gray-300">结果可能包含循环引用，无法序列化</span>
            </div>
          </div>
          
          <div class="mt-4 flex space-x-4">
            <button 
              @click="loadResults" 
              class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors duration-200 flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重试加载
            </button>
            
            <button 
              @click="fixResults" 
              class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors duration-200 flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              尝试修复
            </button>
            
            <button 
              @click="clearResults" 
              class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors duration-200 flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清除数据
            </button>
          </div>
        </div>
        
        <div class="mt-4 text-sm text-gray-400">
          <p>如果问题持续，请尝试以下步骤：</p>
          <ol class="list-decimal list-inside mt-2 space-y-1">
            <li>重新运行分析</li>
            <li>清除浏览器缓存和Cookie</li>
            <li>检查服务器日志中的错误</li>
          </ol>
        </div>
      </div>

      <div v-else-if="!results" class="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-yellow-400 mb-2">未找到分析结果</h2>
        <p class="text-gray-300">没有找到分析结果数据，请先进行代码分析。</p>
        <button 
          @click="goToAnalysis" 
          class="mt-4 px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded-lg transition-colors duration-200"
        >
          开始新的分析
        </button>
      </div>

      <div v-else>
        <!-- 分析摘要 -->
        <div class="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-lg p-6 mb-8">
          <h2 class="text-xl font-semibold text-purple-400 mb-4">分析摘要</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <div class="text-sm text-gray-400">分析文件数</div>
              <div class="text-2xl font-bold">{{ results.summary.totalFiles }}</div>
            </div>
            
            <div class="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <div class="text-sm text-gray-400">代码质量得分</div>
              <div class="text-2xl font-bold" :class="getScoreColorClass(results.summary.codeQualityScore)">
                {{ results.summary.codeQualityScore }}/100
              </div>
            </div>
            
            <div class="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <div class="text-sm text-gray-400">发现问题数</div>
              <div class="text-2xl font-bold">{{ results.summary.totalIssues }}</div>
            </div>
            
            <div class="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <div class="text-sm text-gray-400">严重问题数</div>
              <div class="text-2xl font-bold text-red-500">{{ results.summary.criticalIssues }}</div>
            </div>
          </div>
          
          <!-- 问题分布图表 -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-300 mb-2">问题严重性分布</h3>
            <div class="h-8 bg-gray-700 rounded-lg overflow-hidden flex">
              <div 
                class="bg-red-500 h-full" 
                :style="`width: ${getPercentage(results.summary.criticalIssues, results.summary.totalIssues)}%`"
                v-if="results.summary.criticalIssues > 0"
              ></div>
              <div 
                class="bg-yellow-500 h-full" 
                :style="`width: ${getPercentage(results.summary.majorIssues, results.summary.totalIssues)}%`"
                v-if="results.summary.majorIssues > 0"
              ></div>
              <div 
                class="bg-blue-500 h-full" 
                :style="`width: ${getPercentage(results.summary.minorIssues, results.summary.totalIssues)}%`"
                v-if="results.summary.minorIssues > 0"
              ></div>
            </div>
            <div class="flex mt-2 text-sm">
              <div class="flex items-center mr-4" v-if="results.summary.criticalIssues > 0">
                <div class="w-3 h-3 bg-red-500 rounded-sm mr-1"></div>
                <span>严重 ({{ results.summary.criticalIssues }})</span>
              </div>
              <div class="flex items-center mr-4" v-if="results.summary.majorIssues > 0">
                <div class="w-3 h-3 bg-yellow-500 rounded-sm mr-1"></div>
                <span>重要 ({{ results.summary.majorIssues }})</span>
              </div>
              <div class="flex items-center" v-if="results.summary.minorIssues > 0">
                <div class="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                <span>次要 ({{ results.summary.minorIssues }})</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 文件列表 -->
        <div class="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-lg p-6 mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-purple-400">文件分析结果</h2>
            <div class="flex items-center">
              <span class="mr-2 text-sm text-gray-400">排序方式:</span>
              <select 
                v-model="sortBy" 
                class="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="issues">问题数量</option>
                <option value="score">代码质量</option>
                <option value="name">文件名</option>
              </select>
            </div>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="file in sortedFiles" 
              :key="file.fileName" 
              class="bg-gray-700 bg-opacity-50 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
              @click="toggleFileDetails(file.fileName)"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <div class="mr-3">
                    <div class="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                      <span class="text-lg font-mono">{{ getFileIcon(file.language) }}</span>
                    </div>
                  </div>
                  <div>
                    <h3 class="font-medium">{{ file.fileName }}</h3>
                    <div class="text-sm text-gray-400">{{ file.language }}</div>
                  </div>
                </div>
                
                <div class="flex items-center">
                  <div class="mr-6 text-center">
                    <div class="text-sm text-gray-400">问题</div>
                    <div class="font-bold">{{ file.issues.length }}</div>
                  </div>
                  
                  <div class="text-center">
                    <div class="text-sm text-gray-400">得分</div>
                    <div class="font-bold" :class="getScoreColorClass(file.score)">{{ file.score }}</div>
                  </div>
                  
                  <div class="ml-4">
                    <svg 
                      class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
                      :class="{'rotate-180': expandedFiles.includes(file.fileName)}"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- 文件详情 -->
              <div v-if="expandedFiles.includes(file.fileName)" class="mt-4 pt-4 border-t border-gray-600">
                <div v-if="file.issues.length === 0" class="text-green-400">
                  没有发现问题，代码质量良好！
                </div>
                
                <div v-else class="space-y-3">
                  <div 
                    v-for="issue in file.issues" 
                    :key="issue.id" 
                    class="p-3 rounded-lg"
                    :class="{
                      'bg-red-900 bg-opacity-20 border border-red-800': issue.severity === 'critical' || issue.severity === 'high' || issue.severity === 'error',
                      'bg-yellow-900 bg-opacity-20 border border-yellow-800': issue.severity === 'major' || issue.severity === 'medium' || issue.severity === 'warning',
                      'bg-blue-900 bg-opacity-20 border border-blue-800': issue.severity === 'minor' || issue.severity === 'low' || issue.severity === 'info'
                    }"
                  >
                    <div class="flex items-start">
                      <div 
                        class="w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
                        :class="{
                          'bg-red-500': issue.severity === 'critical' || issue.severity === 'high' || issue.severity === 'error',
                          'bg-yellow-500': issue.severity === 'major' || issue.severity === 'medium' || issue.severity === 'warning',
                          'bg-blue-500': issue.severity === 'minor' || issue.severity === 'low' || issue.severity === 'info'
                        }"
                      >
                        <svg v-if="issue.severity === 'critical'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <svg v-else-if="issue.severity === 'major'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <svg v-else class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      
                      <div class="flex-1">
                        <div class="flex justify-between">
                          <div class="font-medium">{{ issue.message }}</div>
                          <div class="text-sm text-gray-400">行 {{ issue.lineNumber }}</div>
                        </div>
                        
                        <div class="mt-2 bg-gray-800 bg-opacity-50 p-2 rounded font-mono text-sm overflow-x-auto">
                          {{ issue.source }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import analysisService from '../services/analysisService'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const error = ref(null)
const results = ref(null)
const expandedFiles = ref([])
const sortBy = ref('issues')

// AI状态检查相关
const showAiStatus = ref(false)
const aiStatusInfo = ref({
  hasAiResults: false,
  location: null,
  model: null,
  apiRequestIssue: false
})

// 加载分析结果
const loadResults = () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('开始加载分析结果')
    
    // 查询参数中的错误标志
    const errorParam = route.query.error
    
    if (errorParam) {
      console.warn('URL中包含错误参数:', errorParam)
      // 尝试从错误信息中恢复
      const errorInfo = localStorage.getItem('analysisError')
      if (errorInfo) {
        console.warn('发现错误信息:', errorInfo)
      }
    }
    
    // 尝试从多个可能的位置获取分析结果
    const sources = ['analysisResults', 'analysisResultsBackup', 'analysisResultsSummary']
    let resultData = null
    let sourceName = null
    
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source)
        if (data) {
          const parsed = JSON.parse(data)
          if (parsed && typeof parsed === 'object') {
            resultData = parsed
            sourceName = source
            console.log(`从 ${source} 加载到结果数据, 键:`, Object.keys(parsed))
            
            // 详细记录结果结构，便于调试
            console.log(`${source} 数据详细结构:`, JSON.stringify(parsed, null, 2).substring(0, 1000) + '...')
            break
          }
        }
      } catch (sourceError) {
        console.warn(`从 ${source} 加载失败:`, sourceError)
      }
    }
    
    if (resultData) {
      console.log(`成功从 ${sourceName} 加载结果，类型:`, typeof resultData)
      
      // 增强：尝试检测各种可能的结果格式，处理更多的变体
      // 探索结果数据结构
      const exploreStructure = (obj, path = '', maxDepth = 3, currentDepth = 0) => {
        if (currentDepth >= maxDepth || !obj || typeof obj !== 'object') return
        
        if (Array.isArray(obj)) {
          console.log(`${path} 是数组，长度: ${obj.length}`)
          if (obj.length > 0) {
            console.log(`${path}[0] 类型:`, typeof obj[0])
            exploreStructure(obj[0], `${path}[0]`, maxDepth, currentDepth + 1)
          }
        } else {
          Object.keys(obj).forEach(key => {
            const newPath = path ? `${path}.${key}` : key
            console.log(`发现键: ${newPath}, 类型:`, typeof obj[key])
            exploreStructure(obj[key], newPath, maxDepth, currentDepth + 1)
          })
        }
      }
      
      // 探索结果结构
      console.log('==== 探索结果数据结构 ====')
      exploreStructure(resultData)
      console.log('==== 结构探索结束 ====')
      
      // 创建标准化结果对象
      let standardizedResults = {
        results: {},
        fileResults: [],
        summary: {
          totalFiles: 0,
          totalIssues: 0,
          criticalIssues: 0,
          majorIssues: 0,
          minorIssues: 0,
          codeQualityScore: 0
        }
      }
      
      // 增强的格式检测和标准化逻辑
      if (resultData.results) {
        console.log('检测到结果包含results字段:', Object.keys(resultData.results))
        // 合并到标准化结果中
        standardizedResults.results = resultData.results
        
        // 如果还有fileResults，也合并
        if (resultData.fileResults) {
          standardizedResults.fileResults = resultData.fileResults
        }
      } 
      // 检查新格式：直接包含data或result对象
      else if (resultData.data || resultData.result) {
        console.log('检测到新格式: data或result字段')
        const dataObject = resultData.data || resultData.result || {}
        
        // 拷贝数据到results
        standardizedResults.results = dataObject
        
        // 检查是否有文件结果
        if (dataObject.fileResults || dataObject.files) {
          standardizedResults.fileResults = dataObject.fileResults || dataObject.files || []
        }
        
        // 检查是否有摘要信息
        if (dataObject.summary) {
          standardizedResults.summary = {
            ...standardizedResults.summary,
            ...dataObject.summary
          }
        }
      }
      // 检查旧格式：直接包含codeQuality, security, performance
      else if (resultData.codeQuality || resultData.security || resultData.performance) {
        console.log('检测到直接的分析结果字段')
        // 旧格式，直接是结果对象
        standardizedResults.results = resultData
      } 
      // 检查只有fileResults的格式
      else if (resultData.fileResults) {
        console.log('检测到仅有fileResults字段')
        // 包含fileResults的格式
        standardizedResults.fileResults = resultData.fileResults
      }
      // 检查是否可能是结果数组
      else if (Array.isArray(resultData)) {
        console.log('检测到结果是数组格式')
        
        // 先检查是不是文件结果数组
        if (resultData.length > 0 && 
            typeof resultData[0] === 'object' && 
            (resultData[0].fileName || resultData[0].issues)) {
          console.log('检测到数组是文件结果列表')
          standardizedResults.fileResults = resultData
        } 
        // 可能是问题列表
        else if (resultData.length > 0 && 
                 typeof resultData[0] === 'object' && 
                 (resultData[0].message || resultData[0].severity)) {
          console.log('检测到数组是问题列表')
          
          // 构建一个虚拟的codeQuality结构
          standardizedResults.results.codeQuality = {
            issues: resultData
          }
          
          // 尝试按文件名分组
          const issuesByFile = {}
          resultData.forEach(issue => {
            if (!issue.fileName) {
              issue.fileName = '未知文件'
            }
            
            if (!issuesByFile[issue.fileName]) {
              issuesByFile[issue.fileName] = []
            }
            
            issuesByFile[issue.fileName].push(issue)
          })
          
          // 构建fileResults
          standardizedResults.fileResults = Object.entries(issuesByFile).map(([fileName, issues]) => {
            return {
              fileName,
              issues,
              score: calculateFileScore(issues),
              language: guessLanguageFromFileName(fileName)
            }
          })
        } else {
          console.warn('无法解析的数组格式，构建兼容结构')
          standardizedResults.results.rawArray = resultData
        }
      }
      // 最后尝试检测API特定格式
      else if (resultData.code !== undefined && (resultData.data || resultData.message)) {
        console.log('检测到API响应格式')
        
        if (resultData.data && typeof resultData.data === 'object') {
          // API返回的数据
          if (resultData.data.analysis || resultData.data.results) {
            standardizedResults.results = resultData.data.analysis || resultData.data.results
          } else {
            standardizedResults.results = resultData.data
          }
        } else {
          // 无结构化数据，但有消息
          standardizedResults.results = {
            message: resultData.message || '服务器返回了结果，但没有详细数据',
            apiResponse: true
          }
        }
      }
      else {
        console.warn('未识别的结果格式:', Object.keys(resultData))
        // 将不明格式数据也添加到结果中
        standardizedResults.results = {
          ...resultData,
          unknownFormat: true
        }
      }
      
      // 处理summary信息
      if (resultData.summary) {
        standardizedResults.summary = {
          ...standardizedResults.summary,
          ...resultData.summary
        }
      }
      
      // 如果没有fileResults，但有results.codeQuality信息，尝试构建fileResults
      if (standardizedResults.fileResults.length === 0 && 
          standardizedResults.results && 
          standardizedResults.results.codeQuality &&
          standardizedResults.results.codeQuality.issues) {
        console.log('从codeQuality.issues构建fileResults')
        
        // 按文件分组整理issues
        const issuesByFile = {}
        standardizedResults.results.codeQuality.issues.forEach(issue => {
          if (!issue.fileName) {
            console.warn('发现没有fileName的issue:', issue)
            // 为没有文件名的问题指定一个默认值
            issue.fileName = '未知文件'
          }
          
          if (!issuesByFile[issue.fileName]) {
            issuesByFile[issue.fileName] = []
          }
          
          issuesByFile[issue.fileName].push(issue)
        })
        
        // 构建fileResults数组
        standardizedResults.fileResults = Object.entries(issuesByFile).map(([fileName, issues]) => {
          return {
            fileName,
            issues,
            score: calculateFileScore(issues),
            language: guessLanguageFromFileName(fileName)
          }
        })
      }
      
      // 如果还是没有fileResults，创建一个空的兼容结构
      if (standardizedResults.fileResults.length === 0) {
        console.warn('未发现有效的fileResults，创建空结构')
        
        // 尝试从results中提取任何可能的问题
        let syntheticIssues = []
        
        // 在results中查找任何可能的问题数据
        const findIssues = (obj, path = '') => {
          if (!obj || typeof obj !== 'object') return
          
          if (Array.isArray(obj)) {
            if (obj.length > 0 && typeof obj[0] === 'object') {
              // 检查数组元素是否类似于问题
              if (obj[0].message || obj[0].severity || obj[0].rule) {
                console.log(`在 ${path} 处发现可能的问题数组`)
                syntheticIssues = [...syntheticIssues, ...obj]
              } else {
                // 递归检查数组元素
                obj.forEach((item, index) => findIssues(item, `${path}[${index}]`))
              }
            }
          } else {
            // 检查是否直接是一个问题对象
            if (obj.message && (obj.severity || obj.level)) {
              syntheticIssues.push(obj)
            }
            
            // 递归检查对象的属性
            Object.keys(obj).forEach(key => {
              findIssues(obj[key], path ? `${path}.${key}` : key)
            })
          }
        }
        
        // 尝试寻找任何可能的问题
        findIssues(standardizedResults.results)
        
        if (syntheticIssues.length > 0) {
          console.log(`从结果中提取了 ${syntheticIssues.length} 个问题`)
          
          // 将这些问题分配给一个默认文件
          standardizedResults.fileResults = [{
            fileName: '合成结果',
            issues: syntheticIssues,
            score: calculateFileScore(syntheticIssues),
            language: '未知'
          }]
        } else {
          // 如果仍未找到问题，创建一个空记录
          standardizedResults.fileResults = [{
            fileName: '未找到文件结果',
            issues: [],
            score: 0,
            language: 'Unknown'
          }]
        }
      }
      
      // 确保每个文件记录都有必要的字段
      standardizedResults.fileResults = standardizedResults.fileResults.map(file => {
        return {
          fileName: file.fileName || '未命名文件',
          issues: Array.isArray(file.issues) ? file.issues : [],
          score: file.score || 0,
          language: file.language || guessLanguageFromFileName(file.fileName || '') || '未知'
        }
      })
      
      // 更新summary信息
      if (!standardizedResults.summary.totalFiles || standardizedResults.summary.totalFiles === 0) {
        standardizedResults.summary.totalFiles = standardizedResults.fileResults.length
      }
      
      let totalIssues = 0
      let criticalIssues = 0
      let majorIssues = 0
      let minorIssues = 0
      
      // 从fileResults统计问题
      standardizedResults.fileResults.forEach(file => {
        totalIssues += file.issues.length
        
        // 使用增强的严重性级别匹配
        criticalIssues += file.issues.filter(i => 
          i.severity === 'critical' || 
          i.severity === 'high' || 
          i.severity === 'error'
        ).length
        
        majorIssues += file.issues.filter(i => 
          i.severity === 'major' || 
          i.severity === 'medium' || 
          i.severity === 'warning'
        ).length
        
        minorIssues += file.issues.filter(i => 
          i.severity === 'minor' || 
          i.severity === 'low' || 
          i.severity === 'info'
        ).length
      })
      
      // 更新总结信息
      if (!standardizedResults.summary.totalIssues || standardizedResults.summary.totalIssues === 0) {
        standardizedResults.summary.totalIssues = totalIssues
      }
      
      if (!standardizedResults.summary.criticalIssues || standardizedResults.summary.criticalIssues === 0) {
        standardizedResults.summary.criticalIssues = criticalIssues
      }
      
      if (!standardizedResults.summary.majorIssues || standardizedResults.summary.majorIssues === 0) {
        standardizedResults.summary.majorIssues = majorIssues
      }
      
      if (!standardizedResults.summary.minorIssues || standardizedResults.summary.minorIssues === 0) {
        standardizedResults.summary.minorIssues = minorIssues
      }
      
      // 计算平均代码质量得分
      if (!standardizedResults.summary.codeQualityScore || standardizedResults.summary.codeQualityScore === 0) {
        if (standardizedResults.fileResults.length > 0) {
          const avgScore = standardizedResults.fileResults.reduce(
            (sum, file) => sum + (file.score || 0), 
            0
          ) / standardizedResults.fileResults.length
          
          standardizedResults.summary.codeQualityScore = Math.round(avgScore)
        } else {
          standardizedResults.summary.codeQualityScore = 0
        }
      }
      
      // 更新结果
      console.log('最终处理后的结果结构:', Object.keys(standardizedResults))
      console.log('fileResults 数量:', standardizedResults.fileResults.length)
      console.log('文件列表:', standardizedResults.fileResults.map(f => f.fileName))
      
      results.value = standardizedResults
      
      // 如果数据结构有异常，提供一个警告但仍然显示
      if (standardizedResults.results.unknownFormat) {
        error.value = '结果格式异常，但已尝试适配显示'
      }
    } else {
      results.value = null
      error.value = '未找到任何分析结果数据'
      console.warn('所有来源都未找到分析结果')
    }
  } catch (err) {
    console.error('加载分析结果失败:', err)
    error.value = err.message || '加载分析结果时出错'
    results.value = null
  } finally {
    loading.value = false
  }
}

// 计算文件得分
const calculateFileScore = (issues) => {
  if (!issues || !Array.isArray(issues) || issues.length === 0) return 100
  
  // 计算文件得分 (基于问题数量和严重性)
  // 支持多种严重性级别命名
  const criticalCount = issues.filter(i => 
    i.severity === 'critical' || 
    i.severity === 'high' || 
    i.severity === 'error'
  ).length
  
  const majorCount = issues.filter(i => 
    i.severity === 'major' || 
    i.severity === 'medium' || 
    i.severity === 'warning'
  ).length
  
  const minorCount = issues.filter(i => 
    i.severity === 'minor' || 
    i.severity === 'low' || 
    i.severity === 'info'
  ).length
  
  // 简单评分算法：满分100，每个严重问题-15，每个重要问题-5，每个次要问题-1
  let score = 100 - (criticalCount * 15) - (majorCount * 5) - (minorCount * 1)
  return Math.max(0, Math.min(100, score)) // 确保在0-100范围内
}

// 猜测文件类型
const guessLanguageFromFileName = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  
  const langMap = {
    'js': 'JavaScript',
    'jsx': 'JavaScript (React)',
    'ts': 'TypeScript',
    'tsx': 'TypeScript (React)',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'CSS (SCSS)',
    'less': 'CSS (Less)',
    'py': 'Python',
    'java': 'Java',
    'go': 'Go',
    'c': 'C',
    'cpp': 'C++',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'json': 'JSON',
    'md': 'Markdown',
    'vue': 'Vue',
    'sql': 'SQL'
  }
  
  return langMap[ext] || '未知'
}

// 排序文件
const sortedFiles = computed(() => {
  if (!results.value || !results.value.fileResults) return []
  
  return [...results.value.fileResults].sort((a, b) => {
    if (sortBy.value === 'issues') {
      return b.issues.length - a.issues.length
    } else if (sortBy.value === 'score') {
      return a.score - b.score
    } else {
      return a.fileName.localeCompare(b.fileName)
    }
  })
})

// 切换文件详情显示
const toggleFileDetails = (fileName) => {
  if (expandedFiles.value.includes(fileName)) {
    expandedFiles.value = expandedFiles.value.filter(name => name !== fileName)
  } else {
    expandedFiles.value.push(fileName)
  }
}

// 获取文件图标
const getFileIcon = (language) => {
  const icons = {
    'JavaScript': 'JS',
    'JavaScript (React)': 'JSX',
    'TypeScript': 'TS',
    'TypeScript (React)': 'TSX',
    'HTML': '</>', 
    'CSS': '#',
    'Python': 'PY',
    'Java': 'JV',
    'Go': 'GO',
    'C': 'C',
    'C++': 'C++',
    'C#': 'C#',
    'PHP': 'PHP',
    'Ruby': 'RB'
  }
  
  return icons[language] || '{ }'
}

// 获取百分比
const getPercentage = (value, total) => {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

// 获取得分颜色
const getScoreColorClass = (score) => {
  if (score >= 90) return 'text-green-400'
  if (score >= 70) return 'text-yellow-400'
  return 'text-red-400'
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 前往分析页面
const goToAnalysis = () => {
  router.push('/analysis')
}

// 尝试修复结果
const fixResults = () => {
  try {
    console.log('尝试修复分析结果')
    
    // 创建基本的空结果结构
    const emptyResults = {
      results: {
        codeQuality: {
          issues: [],
          metrics: {
            complexity: 0,
            maintainability: 0,
            duplication: 0
          }
        },
        security: {
          vulnerabilities: []
        },
        performance: {
          issues: []
        }
      },
      fileResults: [
        {
          fileName: '示例文件.js',
          language: 'JavaScript',
          issues: [
            {
              id: 'example-issue',
              message: '这是一个示例问题 (自动修复生成)',
              severity: 'info',
              lineNumber: 1,
              source: '// 示例代码'
            }
          ],
          score: 95
        }
      ],
      summary: {
        totalFiles: 1,
        totalIssues: 1,
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 1,
        codeQualityScore: 95
      }
    }
    
    // 保存空结果到localStorage
    localStorage.setItem('analysisResults', JSON.stringify(emptyResults))
    localStorage.setItem('analysisResultsBackup', JSON.stringify(emptyResults))
    
    // 添加诊断标记
    emptyResults.autoFixed = true
    emptyResults.fixedAt = new Date().toISOString()
    
    // 更新界面
    results.value = emptyResults
    error.value = null
    
    alert('已创建基本结果结构，您可以重新运行分析获取实际结果')
  } catch (err) {
    console.error('修复结果失败:', err)
    alert('修复失败: ' + err.message)
  }
}

// 清除所有结果
const clearResults = () => {
  try {
    const sources = [
      'analysisResults',
      'analysisResultsBackup', 
      'analysisResultsSummary',
      'analysisError'
    ]
    
    sources.forEach(key => {
      try {
        localStorage.removeItem(key)
        console.log(`已清除 ${key}`)
      } catch (e) {
        console.warn(`清除 ${key} 失败:`, e)
      }
    })
    
    // 更新界面状态
    results.value = null
    error.value = '已清除所有分析结果，请重新运行分析'
    
    alert('所有分析结果已清除')
  } catch (err) {
    console.error('清除结果失败:', err)
    alert('清除失败: ' + err.message)
  }
}

// 检查AI状态
const checkAiStatus = () => {
  try {
    aiStatusInfo.value = {
      hasAiResults: false,
      location: null,
      model: null,
      apiRequestIssue: false
    }
    
    console.log('开始检查AI状态...')
    
    // 检查是否有结果数据
    if (!results.value) {
      console.warn('无法检查AI状态：没有找到分析结果')
      aiStatusInfo.value.apiRequestIssue = true
      showAiStatus.value = true
      return
    }
    
    // 检查是否包含AI结果
    const aiResultsCheck = checkForAiResults(results.value)
    aiStatusInfo.value.hasAiResults = aiResultsCheck.has
    aiStatusInfo.value.location = aiResultsCheck.location
    
    // 获取模型信息
    const modelInfo = getAiModelInfo()
    if (modelInfo) {
      aiStatusInfo.value.model = modelInfo
    }
    
    // 显示状态弹窗
    showAiStatus.value = true
    console.log('AI状态检查完成:', aiStatusInfo.value)
  } catch (err) {
    console.error('检查AI状态出错:', err)
    alert('检查AI状态时出错: ' + err.message)
  }
}

// 检查结果中是否包含AI结果
const checkForAiResults = (data) => {
  const result = {
    has: false,
    location: null
  }
  
  // 如果是空数据，直接返回
  if (!data) return result
  
  // 检查顶级AI字段
  if (data.aiResults || data.aiAnalysis) {
    result.has = true
    result.location = data.aiResults ? 'aiResults' : 'aiAnalysis'
    return result
  }
  
  // 检查results对象中的AI字段
  if (data.results) {
    if (data.results.aiResults || data.results.aiAnalysis) {
      result.has = true
      result.location = `results.${data.results.aiResults ? 'aiResults' : 'aiAnalysis'}`
      return result
    }
    
    // 检查代码质量中的AI评论
    if (data.results.codeQuality && data.results.codeQuality.aiComments) {
      result.has = true
      result.location = 'results.codeQuality.aiComments'
      return result
    }
  }
  
  // 检查文件结果中的AI字段
  if (data.fileResults && Array.isArray(data.fileResults)) {
    for (let i = 0; i < data.fileResults.length; i++) {
      const file = data.fileResults[i]
      
      // 检查文件级AI评论
      if (file.aiComments || file.aiAnalysis) {
        result.has = true
        result.location = `fileResults[${i}].${file.aiComments ? 'aiComments' : 'aiAnalysis'}`
        return result
      }
      
      // 检查问题中的AI建议
      if (file.issues && Array.isArray(file.issues)) {
        for (let j = 0; j < file.issues.length; j++) {
          const issue = file.issues[j]
          if (issue.aiSuggestion || issue.aiComment) {
            result.has = true
            result.location = `fileResults[${i}].issues[${j}].${issue.aiSuggestion ? 'aiSuggestion' : 'aiComment'}`
            return result
          }
        }
      }
    }
  }
  
  return result
}

// 获取AI模型信息
const getAiModelInfo = () => {
  try {
    // 尝试从localStorage获取模型信息
    let modelInfo = null
    
    // 查找可能的来源
    const sources = ['aiModels', 'aiModelsBackup', 'defaultAiModel']
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source)
        if (data) {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // 找到活跃的模型
            const activeModel = parsed.find(m => m.status === 'active' || m.isActive)
            if (activeModel) {
              modelInfo = {
                name: activeModel.name,
                provider: activeModel.provider,
                hasApiKey: !!activeModel.apiKey
              }
              break
            } else if (parsed.length > 0) {
              // 使用第一个模型
              modelInfo = {
                name: parsed[0].name,
                provider: parsed[0].provider,
                hasApiKey: !!parsed[0].apiKey
              }
              break
            }
          } else if (typeof parsed === 'string') {
            // 可能是默认模型ID
            modelInfo = {
              id: parsed,
              name: '未知模型',
              hasApiKey: false
            }
          }
        }
      } catch (e) {
        console.warn(`从 ${source} 获取模型信息失败:`, e)
      }
    }
    
    return modelInfo
  } catch (err) {
    console.error('获取AI模型信息失败:', err)
    return null
  }
}

// 组件挂载时加载结果
onMounted(() => {
  loadResults()
})
</script> 