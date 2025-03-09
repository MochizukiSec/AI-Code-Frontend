<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
    <NavBar />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-gray-800/50 backdrop-blur-xl rounded-lg shadow-xl p-6">
        <h1 class="text-2xl font-bold text-white mb-6">系统设置</h1>
        
        <!-- AI 模型配置 -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-white mb-4">AI 模型配置</h2>
          
          <!-- 添加新模型按钮 -->
          <div class="mb-4 flex flex-wrap gap-2">
            <button @click="addNewModel" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              添加自定义模型
            </button>
            
            <button @click="addDeepSeekModel" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              添加DeepSeek模型
            </button>
            
            <button @click="fixDeepSeekModels" class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              修复DeepSeek模型ID
            </button>
          </div>
          
          <!-- 模型列表 -->
          <div class="space-y-4">
            <div v-for="model in aiModels" :key="model.id" 
                 class="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-white">{{ model.name }}</h3>
                  <p class="text-sm text-gray-300">{{ model.description }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    model.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    model.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  ]">
                    {{ model.status === 'active' ? '已启用' :
                       model.status === 'inactive' ? '未启用' : '测试中' }}
                  </span>
                  <button @click="testConnection(model)"
                          class="px-3 py-1 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                    测试连接
                  </button>
                  <button v-if="model.status === 'inactive'" 
                          @click="activateModel(model)"
                          class="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                    启用
                  </button>
                  <button v-else 
                          @click="deactivateModel(model)"
                          class="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
                    停用
                  </button>
                </div>
              </div>
              
              <!-- API 密钥配置 -->
              <div class="mt-4">
                <div class="flex items-center space-x-2">
                  <input type="password" 
                         v-model="model.apiKey"
                         :placeholder="getApiKeyPlaceholder(model)"
                         class="flex-1 bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <button @click="saveApiKey(model)"
                          class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                    保存
                  </button>
                </div>
                
                <!-- API密钥格式提示 -->
                <div class="mt-2 text-xs text-gray-400">
                  <template v-if="model.id === 'deepseek' || model.provider === 'deepseek'">
                    DeepSeek API密钥格式: sk-xxxxxxxx 或 deepseek-xxxx
                  </template>
                  <template v-else-if="model.id === 'gpt-4' || model.provider === 'openai'">
                    OpenAI API密钥格式: sk-xxxxxxxxxxxxxxxxxxxxxxxx
                  </template>
                  <template v-else-if="model.id === 'claude-3' || model.provider === 'anthropic'">
                    Anthropic API密钥格式: sk-ant-xxxxxxxxxxxxxxxxxxxxx
                  </template>
                  <template v-else>
                    请输入有效的API密钥
                  </template>
                </div>
                
                <!-- 测试结果显示 -->
                <div v-if="model.testResult" class="mt-3 p-3 rounded-md" 
                     :class="model.testResult.success ? 'bg-green-500/20' : 'bg-red-500/20'">
                  <p :class="model.testResult.success ? 'text-green-400' : 'text-red-400'">
                    {{ model.testResult.message }}
                  </p>
                  <p v-if="model.testResult.details" class="mt-1 text-sm text-gray-300">
                    {{ model.testResult.details.content }}
                  </p>
                </div>
              </div>
              
              <!-- 模型高级设置 -->
              <div class="mt-4">
                <details class="text-white">
                  <summary class="cursor-pointer hover:text-purple-400 transition-colors">高级设置</summary>
                  <div class="mt-3 pl-4 border-l-2 border-gray-600 space-y-3">
                    <!-- 端点URL -->
                    <div>
                      <label class="block text-sm text-gray-300 mb-1">API 端点</label>
                      <input type="text" 
                             v-model="model.endpoint"
                             :placeholder="getEndpointPlaceholder(model)"
                             class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                    
                    <!-- 模型ID -->
                    <div>
                      <label class="block text-sm text-gray-300 mb-1">模型 ID</label>
                      <input type="text" 
                             v-model="model.modelId"
                             :placeholder="getModelIdPlaceholder(model)"
                             class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 其他设置 -->
        <div>
          <h2 class="text-xl font-semibold text-white mb-4">分析设置</h2>
          <div class="space-y-4">
            <!-- 默认模型选择 -->
            <div class="flex items-center space-x-4">
              <label class="text-white">默认 AI 模型：</label>
              <select v-model="defaultModel" 
                      class="bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">请选择默认模型</option>
                <option v-for="model in aiModels.filter(m => m.status === 'active')" 
                        :key="model.id" 
                        :value="model.id">
                  {{ model.name }}
                </option>
              </select>
            </div>
            
            <!-- 云存储配置 -->
            <div class="mt-6 border-t border-gray-600 pt-4">
              <h3 class="text-lg font-medium text-white mb-3">云存储配置</h3>
              <p class="text-sm text-gray-400 mb-4">用于存储代码文件，减轻服务器负载</p>
              
              <div class="space-y-4">
                <!-- 存储服务类型 -->
                <div>
                  <label class="block text-sm text-gray-300 mb-1">存储服务类型</label>
                  <select v-model="storageConfig.type" 
                          class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">不使用云存储</option>
                    <option value="s3">AWS S3</option>
                    <option value="oss">阿里云 OSS</option>
                    <option value="cos">腾讯云 COS</option>
                    <option value="obs">华为云 OBS</option>
                  </select>
                </div>
                
                <!-- 服务接入地址 -->
                <div v-if="storageConfig.type">
                  <label class="block text-sm text-gray-300 mb-1">服务接入地址（Endpoint）</label>
                  <input type="text" 
                         v-model="storageConfig.endpoint"
                         :placeholder="getStorageEndpointPlaceholder()"
                         class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <p class="text-xs text-gray-500 mt-1">
                    {{ getStorageEndpointTip() }}
                  </p>
                </div>
                
                <!-- 存储桶名称 -->
                <div v-if="storageConfig.type">
                  <label class="block text-sm text-gray-300 mb-1">存储桶名称（Bucket）</label>
                  <input type="text" 
                         v-model="storageConfig.bucket"
                         placeholder="example-bucket"
                         class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                </div>
                
                <!-- 访问凭证 -->
                <div v-if="storageConfig.type" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-300 mb-1">访问密钥 ID（AccessKey ID）</label>
                    <input type="text" 
                           v-model="storageConfig.accessKeyId"
                           placeholder="AKIAXXXXXXXXXXXXXXXX"
                           class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  </div>
                  <div>
                    <label class="block text-sm text-gray-300 mb-1">访问密钥密码（Secret）</label>
                    <input type="password" 
                           v-model="storageConfig.accessKeySecret"
                           placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                           class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  </div>
                </div>
                
                <!-- 存储区域 -->
                <div v-if="storageConfig.type">
                  <label class="block text-sm text-gray-300 mb-1">存储区域（Region）</label>
                  <input type="text" 
                         v-model="storageConfig.region"
                         :placeholder="getRegionPlaceholder()"
                         class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                </div>
                
                <!-- 存储路径前缀 -->
                <div v-if="storageConfig.type">
                  <label class="block text-sm text-gray-300 mb-1">存储路径前缀（可选）</label>
                  <input type="text" 
                         v-model="storageConfig.prefix"
                         placeholder="code-analysis/"
                         class="w-full bg-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <p class="text-xs text-gray-500 mt-1">
                    所有文件将存储在此前缀目录下
                  </p>
                </div>
                
                <!-- 测试连接按钮 -->
                <div v-if="storageConfig.type">
                  <button @click="testStorageConnection"
                          class="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                    测试存储连接
                  </button>
                  
                  <!-- 测试结果显示 -->
                  <div v-if="storageTestResult" class="mt-3 p-3 rounded-md" 
                       :class="storageTestResult.success ? 'bg-green-500/20' : 'bg-red-500/20'">
                    <p :class="storageTestResult.success ? 'text-green-400' : 'text-red-400'">
                      {{ storageTestResult.message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 保存按钮 -->
            <div class="flex justify-end gap-4">
              <div v-if="lastSaved" class="text-sm text-gray-400 self-center">
                上次保存: {{ formatTime(lastSaved) }}
              </div>
              
              <button @click="forceLocalSave"
                      class="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                强制本地保存
              </button>
              
              <button @click="saveSettings"
                      class="px-6 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                保存设置
              </button>
            </div>
            
            <!-- 保存状态提示 -->
            <div v-if="saveStatus" 
                 :class="[
                   'mt-2 p-3 rounded-md text-center transition-all duration-500',
                   saveStatus.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                 ]">
              {{ saveStatus.message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import NavBar from '../components/NavBar.vue'
import { useAiModelsStore } from '../stores/aiModels'

const aiModelsStore = useAiModelsStore()
const aiModels = ref(aiModelsStore.models)
const defaultModel = ref(aiModelsStore.defaultModel)

// 添加保存状态和上次保存时间记录
const saveStatus = ref(null);
const lastSaved = ref(null);

// 云存储配置
const storageConfig = ref({
  type: '',
  endpoint: '',
  bucket: '',
  accessKeyId: '',
  accessKeySecret: '',
  region: '',
  prefix: ''
});

// 存储测试结果
const storageTestResult = ref(null);

// 自动保存：监控模型变化
watch(
  aiModels, 
  (newModels) => {
    // 避免不必要的保存和可能的无限循环
    // 只在特定属性变化时触发，不是每个变化都保存
    console.log('检测到模型变化');
    
    // 使用防抖，避免频繁保存
    if (window.saveModelTimeout) {
      clearTimeout(window.saveModelTimeout);
    }
    
    window.saveModelTimeout = setTimeout(() => {
      console.log('更新Store并保存到本地存储');
      aiModelsStore.updateModels(newModels);
      aiModelsStore.saveToLocalStorage();
    }, 500); // 500ms防抖
  },
  { 
    deep: true,
    // 添加防抖
    flush: 'post'
  }
);

// 测试连接
const testConnection = async (model) => {
  try {
    if (!model || !model.id) {
      throw new Error('无效的模型配置');
    }
    
    // 确保模型具有必要的API密钥
    if (!model.apiKey) {
      throw new Error('请先输入API密钥');
    }
    
    // 自动修复DeepSeek模型ID
    if ((model.provider === 'deepseek' || model.id.includes('deepseek')) && 
        (!model.modelId || !model.modelId.startsWith('deepseek-'))) {
      model.modelId = model.name.includes('Coder') ? 'deepseek-coder' : 'deepseek-chat';
      console.log(`已自动修复DeepSeek模型ID为: ${model.modelId}`);
    }
    
    // 先保存当前的API密钥
    model.testResult = { success: false, message: '正在测试连接...' };
    
    // 保存API密钥和更新后的模型ID
    await aiModelsStore.saveApiKey(model, model.apiKey);
    
    // 测试连接 - 传递模型ID
    const result = await aiModelsStore.testConnection(model.id);
    model.testResult = result;
  } catch (error) {
    console.error(`测试连接出错:`, error);
    model.testResult = { 
      success: false, 
      message: `测试连接失败: ${error.message}`
    };
  }
}

// 保存 API 密钥
const saveApiKey = async (model) => {
  // 先确保模型已经在store中注册
  // 检查模型是否已存在于store中
  const storeHasModel = aiModelsStore.models.some(m => m.id === model.id);
  
  if (!storeHasModel) {
    console.log(`模型 ${model.id} 不在store中，先注册到store`);
    aiModelsStore.updateModels(aiModels.value);
    aiModelsStore.saveToLocalStorage();
  }
  
  try {
    // 保存API密钥
    const result = await aiModelsStore.saveApiKey(model, model.apiKey);
    model.testResult = result;
  } catch (error) {
    console.error('保存API密钥失败:', error);
    model.testResult = {
      success: false,
      message: `保存API密钥失败: ${error.message}`
    };
  }
}

// 启用模型
const activateModel = (model) => {
  model.status = 'active'
  saveToStore(true)
}

// 停用模型
const deactivateModel = (model) => {
  model.status = 'inactive'
  saveToStore(true)
}

// 添加新模型
const addNewModel = () => {
  const newId = 'model-' + Date.now()
  aiModels.value.push({
    id: newId,
    name: '自定义模型',
    description: '请配置您的自定义AI模型',
    provider: 'custom',
    status: 'inactive',
    apiKey: '',
    endpoint: '',
    modelId: '',
    testResult: null
  })
}

// 添加DeepSeek模型
const addDeepSeekModel = () => {
  // 使用简单固定的ID来避免ID不匹配问题
  const chatModel = {
    id: 'deepseek-chat-model',
    name: 'DeepSeek Chat',
    description: 'DeepSeek 对话AI模型',
    provider: 'deepseek',
    status: 'inactive',
    apiKey: '',
    endpoint: 'https://api.deepseek.com',
    modelId: 'deepseek-chat',
    testResult: null
  };
  
  const coderModel = {
    id: 'deepseek-coder-model',
    name: 'DeepSeek Coder',
    description: '专为代码分析和生成优化的 AI 模型',
    provider: 'deepseek',
    status: 'inactive',
    apiKey: '',
    endpoint: 'https://api.deepseek.com',
    modelId: 'deepseek-coder',
    testResult: null
  };
  
  // 检查是否已存在同ID模型
  const hasChatModel = aiModels.value.some(m => m.id === chatModel.id);
  const hasCoderModel = aiModels.value.some(m => m.id === coderModel.id);
  
  // 添加到本地视图
  if (!hasChatModel) {
    aiModels.value.push(chatModel);
  }
  
  if (!hasCoderModel) {
    aiModels.value.push(coderModel);
  }
  
  // 重要：同时更新store中的模型列表
  aiModelsStore.updateModels(aiModels.value);
  
  // 保存到本地存储
  aiModelsStore.saveToLocalStorage();
  
  // 显示提示
  if (!hasChatModel || !hasCoderModel) {
    alert('DeepSeek模型已添加，请配置API密钥');
  } else {
    alert('DeepSeek模型已存在');
  }
}

// 修复DeepSeek模型
const fixDeepSeekModels = () => {
  // 找出需要修复的DeepSeek模型
  const deepseekModels = aiModels.value.filter(
    model => model.provider === 'deepseek' || model.id.includes('deepseek')
  );
  
  let fixedCount = 0;
  
  // 修复无效的模型ID
  deepseekModels.forEach(model => {
    const oldModelId = model.modelId;
    
    // 根据情况修复模型ID
    if (!model.modelId || !model.modelId.startsWith('deepseek-')) {
      if (model.name.includes('Coder')) {
        model.modelId = 'deepseek-coder';
      } else {
        model.modelId = 'deepseek-chat';
      }
      fixedCount++;
    }
    
    // 确保端点正确
    if (!model.endpoint) {
      model.endpoint = 'https://api.deepseek.com';
    }
    
    // 确保provider正确
    if (!model.provider) {
      model.provider = 'deepseek';
    }
    
    console.log(`模型 [${model.name}] ID: ${oldModelId || '(无)'} -> ${model.modelId}`);
  });
  
  if (fixedCount > 0) {
    // 确保更新Store并持久化保存
    aiModelsStore.updateModels(aiModels.value);
    aiModelsStore.saveToLocalStorage();
    
    alert(`已修复 ${fixedCount} 个DeepSeek模型的ID`);
  } else if (deepseekModels.length > 0) {
    alert('所有DeepSeek模型ID均有效，无需修复');
  } else {
    alert('未找到DeepSeek模型，请先添加');
  }
}

// 获取存储服务端点占位符
const getStorageEndpointPlaceholder = () => {
  switch (storageConfig.value.type) {
    case 's3':
      return 'https://s3.amazonaws.com';
    case 'oss':
      return 'https://oss-cn-hangzhou.aliyuncs.com';
    case 'cos':
      return 'https://cos.ap-guangzhou.myqcloud.com';
    case 'obs':
      return 'https://obs.cn-north-4.myhuaweicloud.com';
    default:
      return '请输入存储服务端点';
  }
};

// 获取存储区域占位符
const getRegionPlaceholder = () => {
  switch (storageConfig.value.type) {
    case 's3':
      return 'us-east-1';
    case 'oss':
      return 'oss-cn-hangzhou';
    case 'cos':
      return 'ap-guangzhou';
    case 'obs':
      return 'cn-north-4';
    default:
      return '请输入存储区域';
  }
};

// 获取存储端点提示
const getStorageEndpointTip = () => {
  switch (storageConfig.value.type) {
    case 's3':
      return 'AWS S3 服务的终端节点，通常格式为 https://s3.{地区}.amazonaws.com';
    case 'oss':
      return '阿里云 OSS 服务的终端节点，通常格式为 https://oss-{地区}.aliyuncs.com';
    case 'cos':
      return '腾讯云 COS 服务的终端节点，通常格式为 https://cos.{地区}.myqcloud.com';
    case 'obs':
      return '华为云 OBS 服务的终端节点，通常格式为 https://obs.{地区}.myhuaweicloud.com';
    default:
      return '请输入对应云服务提供商的存储服务端点';
  }
};

// 测试存储连接
const testStorageConnection = async () => {
  try {
    // 验证必填字段
    if (!storageConfig.value.endpoint) {
      throw new Error('请输入存储服务端点');
    }
    if (!storageConfig.value.bucket) {
      throw new Error('请输入存储桶名称');
    }
    if (!storageConfig.value.accessKeyId) {
      throw new Error('请输入访问密钥ID');
    }
    if (!storageConfig.value.accessKeySecret) {
      throw new Error('请输入访问密钥密码');
    }
    
    // 显示测试中状态
    storageTestResult.value = {
      success: false,
      message: '正在测试连接...'
    };
    
    // 调用API测试连接
    // 在实际项目中，这里应该调用后端API进行测试
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/storage/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(storageConfig.value)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '连接测试失败');
    }
    
    const data = await response.json();
    
    storageTestResult.value = {
      success: true,
      message: '连接测试成功！' + (data.details || '')
    };
    
    console.log('存储连接测试成功:', data);
  } catch (error) {
    console.error('存储连接测试失败:', error);
    storageTestResult.value = {
      success: false,
      message: `连接测试失败: ${error.message}`
    };
  }
};

// 加载存储配置
const loadStorageConfig = () => {
  try {
    const savedConfig = localStorage.getItem('storageConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      storageConfig.value = parsed;
      console.log('从本地加载存储配置成功');
    }
  } catch (error) {
    console.error('加载存储配置失败:', error);
  }
};

// 保存存储配置
const saveStorageConfig = () => {
  try {
    localStorage.setItem('storageConfig', JSON.stringify(storageConfig.value));
    console.log('存储配置已保存到本地');
    return true;
  } catch (error) {
    console.error('保存存储配置失败:', error);
    return false;
  }
};

// 修改原有的保存设置函数，加入存储配置的保存
const saveSettings = async () => {
  try {
    // 设置默认模型
    aiModelsStore.setDefaultModel(defaultModel.value);
    
    // 更新所有模型状态
    aiModelsStore.updateModels(aiModels.value);
    
    // 先保存到本地存储确保数据不丢失
    aiModelsStore.saveToLocalStorage();
    
    // 保存存储配置
    saveStorageConfig();
    
    // 记录需要保存的模型
    const customModels = aiModels.value.filter(m => 
      m.id.includes('deepseek-') || 
      (m.id.startsWith('model-') && !m.id.match(/^[0-9a-fA-F]{24}$/))
    );
    
    console.log('本地自定义模型:', customModels.map(m => m.id));
    
    // 尝试保存到服务器
    let result = { success: true, message: '设置保存成功' };
    try {
      result = await aiModelsStore.saveSettings();
      
      // 尝试将存储配置保存到服务器
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/storage/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(storageConfig.value)
        });
        
        if (!response.ok) {
          console.warn('存储配置保存到服务器失败', response.status);
        } else {
          console.log('存储配置已保存到服务器');
        }
      } catch (storageError) {
        console.error('保存存储配置到服务器出错:', storageError);
      }
      
      // 如果有自定义模型，添加一个警告
      if (customModels.length > 0) {
        result.warning = true;
        result.message = '设置已保存！自定义模型仅保存在本地，服务器同步部分模型成功';
      }
    } catch (apiError) {
      console.warn('保存到服务器失败，但已成功保存到本地存储:', apiError);
      result = { 
        success: true, 
        message: '设置已保存到本地（服务器同步失败: ' + apiError.message + '）',
        warning: true
      };
    }
    
    if (result.success) {
      // 保存成功后更新本地状态
      // 为了防止不同步，重新从store获取模型列表
      aiModels.value = [...aiModelsStore.models];
      
      // 显示成功消息
      alert(result.warning 
            ? result.message 
            : '设置保存成功');
    } else {
      alert(result.message || '保存设置失败');
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    alert('保存设置失败: ' + error.message);
  }
}

// 获取 API 密钥占位符
const getApiKeyPlaceholder = (model) => {
  if (model.id === 'deepseek' || model.provider === 'deepseek') {
    return 'sk-xxxxxxxxxxxxxxxxxxxxxxxx 或 deepseek-xxxx';
  } else if (model.id === 'gpt-4' || model.provider === 'openai') {
    return 'sk-xxxxxxxxxxxxxxxxxxxxxxxx';
  } else if (model.id === 'claude-3' || model.provider === 'anthropic') {
    return 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx';
  }
  return '请输入API密钥';
};

// 获取端点占位符
const getEndpointPlaceholder = (model) => {
  if (model.id === 'deepseek' || model.provider === 'deepseek') {
    return 'https://api.deepseek.com';
  } else if (model.id === 'gpt-4' || model.provider === 'openai') {
    return 'https://api.openai.com/v1';
  } else if (model.id === 'claude-3' || model.provider === 'anthropic') {
    return 'https://api.anthropic.com';
  }
  return '请输入API端点';
};

// 获取模型ID占位符
const getModelIdPlaceholder = (model) => {
  if (model.id === 'deepseek' || model.provider === 'deepseek') {
    return 'deepseek-coder';
  } else if (model.id === 'gpt-4' || model.provider === 'openai') {
    return 'gpt-4';
  } else if (model.id === 'claude-3' || model.provider === 'anthropic') {
    return 'claude-3-opus-20240229';
  }
  return '请输入模型ID';
};

// 加载设置
onMounted(async () => {
  console.log('设置视图组件已挂载，开始加载模型设置');
  
  // 确保模型已初始化
  if (!aiModelsStore.models || aiModelsStore.models.length === 0) {
    console.log('模型未初始化，正在加载模型...');
    
    // 尝试从localStorage加载
    const loadedFromStorage = aiModelsStore.loadFromLocalStorage();
    
    // 如果仍然没有模型，初始化默认模型
    if (!loadedFromStorage || aiModelsStore.models.length === 0) {
      console.log('从存储加载失败，初始化默认模型');
      aiModelsStore.autoInitialize();
    }
  }
  
  // 更新UI显示
  refreshLocalModels();
  
  // 加载存储配置
  loadStorageConfig();
  
  // 注册保存事件
  aiModelsStore.registerBeforeUnloadEvent();
  
  console.log('设置页面已准备就绪，模型数量:', aiModels.value.length);
  
  // 尝试API加载，但不阻塞UI
  setTimeout(async () => {
    try {
      await aiModelsStore.loadSettings();
      console.log('从API加载设置成功');
      refreshLocalModels();
      
      // 尝试从服务器加载存储配置
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/storage/config`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.data) {
            storageConfig.value = data.data;
            console.log('从服务器加载存储配置成功');
          }
        }
      } catch (storageError) {
        console.warn('从服务器加载存储配置失败:', storageError);
      }
    } catch (apiError) {
      console.warn('从API加载失败，继续使用本地数据');
    }
  }, 100);
  
  // 读取上次保存时间
  try {
    const savedTime = localStorage.getItem('aiModels_last_saved');
    if (savedTime) {
      lastSaved.value = new Date(savedTime);
    }
  } catch (e) {
    console.warn('读取上次保存时间失败', e);
  }
});

// 从Store更新本地模型显示
function refreshLocalModels() {
  try {
    console.log('刷新本地模型显示，当前有', aiModelsStore.models.length, '个模型');
    
    // 深拷贝，避免直接修改store中的对象
    aiModels.value = JSON.parse(JSON.stringify(aiModelsStore.models));
    defaultModel.value = aiModelsStore.selectedModel || '';
    
    // 确保至少有一个模型激活
    ensureActiveModel();
  } catch (error) {
    console.error('刷新模型显示失败:', error);
  }
}

// 确保至少有一个激活的模型
function ensureActiveModel() {
  // 检查是否有激活的模型
  const hasActiveModel = aiModels.value.some(m => m.status === 'active');
  
  if (!hasActiveModel && aiModels.value.length > 0) {
    // 尝试激活DeepSeek Coder模型
    const coderModel = aiModels.value.find(m => 
      m.provider === 'deepseek' && 
      (m.modelId === 'deepseek-coder' || m.name.includes('Coder'))
    );
    
    if (coderModel) {
      console.log('激活DeepSeek Coder模型:', coderModel.id);
      coderModel.status = 'active';
      defaultModel.value = coderModel.id;
  } else {
      // 如果没有找到Coder模型，激活第一个模型
      console.log('激活第一个模型:', aiModels.value[0].id);
      aiModels.value[0].status = 'active';
      defaultModel.value = aiModels.value[0].id;
    }
    
    // 保存更改
    saveToStore(true);
  }
}

// 页面卸载前保存数据
onBeforeUnmount(() => {
  saveToStore(true);
});

// 强制本地保存
const forceLocalSave = () => {
  try {
    console.log('强制保存所有AI模型到本地');
    
    // 更新所有模型
    aiModelsStore.updateModels(aiModels.value);
    
    // 设置默认模型
    if (defaultModel.value) {
      aiModelsStore.setDefaultModel(defaultModel.value);
    }
    
    // 保存到本地存储
    const result = aiModelsStore.saveToLocalStorage();
    
    // 更新保存状态和时间
    if (result) {
      const now = new Date();
      lastSaved.value = now;
      localStorage.setItem('aiModels_last_saved', now.toISOString());
      
      saveStatus.value = {
        success: true,
        message: '模型已成功保存到本地存储'
      };
      
      // 3秒后清除保存状态
      setTimeout(() => {
        saveStatus.value = null;
      }, 3000);
    } else {
      saveStatus.value = {
        success: false,
        message: '本地保存失败，请重试'
      };
    }
  } catch (error) {
    console.error('强制保存失败:', error);
    saveStatus.value = {
      success: false,
      message: '保存失败: ' + error.message
    };
  }
};

// 格式化时间显示
const formatTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  
  // 如果时间差小于1分钟，显示"刚刚"
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 如果时间差小于1小时，显示分钟数
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }
  
  // 如果是今天的其他时间，显示小时:分钟
  if (date.getDate() === now.getDate() && 
      date.getMonth() === now.getMonth() && 
      date.getFullYear() === now.getFullYear()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // 其他情况显示完整日期
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 修改保存方法，确保可靠保存并更新界面
const saveToStore = (silent = false) => {
  try {
    console.log('正在保存设置到Store，当前模型数量:', aiModels.value.length);
    
    // 更新所有模型
    aiModelsStore.updateModels(aiModels.value);
    
    // 设置默认模型
    if (defaultModel.value) {
      aiModelsStore.setDefaultModel(defaultModel.value);
    }
    
    // 保存到本地存储
    const saveResult = aiModelsStore.saveToLocalStorage();
    
    if (saveResult) {
      console.log('成功保存设置到本地存储');
      
      // 更新上次保存时间
      const now = new Date();
      lastSaved.value = now;
      localStorage.setItem('aiModels_last_saved', now.toISOString());
      
      if (!silent) {
        saveStatus.value = {
          success: true, 
          message: '设置已保存到本地'
        };
        
        // 3秒后清除状态
        setTimeout(() => {
          saveStatus.value = null;
        }, 3000);
      }
    } else {
      console.error('保存到本地存储失败');
      if (!silent) {
        saveStatus.value = {
          success: false,
          message: '保存失败，请重试'
        };
      }
    }
    
    // 刷新显示，确保界面与store同步
    refreshLocalModels();
    } catch (error) {
    console.error('保存设置失败:', error);
    if (!silent) {
      saveStatus.value = {
        success: false,
        message: '保存失败: ' + error.message
      };
    }
  }
};
</script> 