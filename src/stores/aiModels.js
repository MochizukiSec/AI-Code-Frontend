import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import apiService from '../services/api.service'

// 确保使用正确的API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// 获取认证token
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

// 处理API响应
async function handleApiResponse(response) {
  // 先获取响应数据
  const result = await response.json()
  
  // 如果响应成功，直接返回结果
  if (response.ok) {
    return result;
  }
  
  // 处理错误情况
  if (response.status === 401) {
    // 处理认证错误，重定向到登录页面
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('未授权，请登录');
  }
  
  // 其他错误直接抛出
  throw new Error(result.message || result.error || 'API 请求失败');
}

// 存储键常量 - 确保整个应用使用相同的键名
const AI_MODELS_STORAGE_KEY = 'aiModels';
const AI_MODELS_SETTINGS_KEY = 'aiModelsSettings';
const AI_MODELS_BACKUP_KEY = 'aiModelsBackup';
const AI_MODELS_LAST_SAVED_KEY = 'aiModels_last_saved';

// 调试函数：列出所有存储的值并返回当前存储中的所有项
function listAllLocalStorage() {
  const storageItems = {};
  console.log('===== 显示所有本地存储项 =====');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const value = localStorage.getItem(key);
      const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`${key}: ${preview}`);
      storageItems[key] = value;
    } catch (e) {
      console.log(`${key}: [无法读取]`);
    }
  }
  console.log('=========================');
  return storageItems;
}

// 帮助函数：验证localStorage是否可用
function isLocalStorageAvailable() {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    const result = localStorage.getItem(test) === test;
    localStorage.removeItem(test);
    return result;
  } catch (e) {
    return false;
  }
}

// 关键的存储和恢复工具函数 - 这些函数与store分离，可以在任何地方使用
// 这样即使store实例化有问题，这些功能也能工作

// 将模型数据保存到localStorage
function saveModelsToLocalStorage(models, selectedModel) {
  console.log('工具函数:保存模型到localStorage', models ? models.length : 0, '个模型');
  
  if (!models || models.length === 0) {
    console.warn('没有模型可以保存');
    return false;
  }
  
  try {
    // 简化模型对象，避免循环引用
    const simplifiedModels = models.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description || '',
      provider: model.provider || '',
      status: model.status || 'inactive',
      endpoint: model.endpoint || '',
      modelId: model.modelId || '',
      apiKey: model.apiKey || ''
    }));
    
    // 主存储
    const serializedModels = JSON.stringify(simplifiedModels);
    localStorage.setItem(AI_MODELS_STORAGE_KEY, serializedModels);
    
    // 备份存储
    localStorage.setItem(AI_MODELS_BACKUP_KEY, JSON.stringify(simplifiedModels));
    
    // 单独保存API密钥，最重要的数据
    for (const model of simplifiedModels) {
      if (model.apiKey) {
        localStorage.setItem(`${model.id}_api_key`, model.apiKey);
      }
    }
    
    // 保存设置
    if (selectedModel) {
      const settingsData = { defaultModel: selectedModel, updatedAt: new Date().toISOString() };
      localStorage.setItem(AI_MODELS_SETTINGS_KEY, JSON.stringify(settingsData));
      localStorage.setItem('defaultAiModel', selectedModel); // 备份
    }
    
    // 记录保存时间
    localStorage.setItem(AI_MODELS_LAST_SAVED_KEY, new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('保存模型失败:', error);
    
    // 尝试最小备份 - 只保存ID和API密钥
    try {
      const apiKeysOnly = models.map(m => ({ id: m.id, apiKey: m.apiKey || '' }));
      localStorage.setItem('aiModelsApiKeys', JSON.stringify(apiKeysOnly));
      return true;
    } catch (e) {
      console.error('最小备份也失败:', e);
      return false;
    }
  }
}

// 从localStorage加载模型数据
function loadModelsFromLocalStorage() {
  console.log('工具函数:从localStorage加载模型');
  let models = [];
  let selectedModel = '';
  
  try {
    // 主存储
    const mainData = localStorage.getItem(AI_MODELS_STORAGE_KEY);
    if (mainData) {
      const parsed = JSON.parse(mainData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`从主存储加载了 ${parsed.length} 个模型`);
        models = parsed;
      }
    }
    
    // 如果主存储失败，尝试备份
    if (models.length === 0) {
      const backupData = localStorage.getItem(AI_MODELS_BACKUP_KEY);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`从备份存储加载了 ${parsed.length} 个模型`);
          models = parsed;
        }
      }
    }
    
    // 尝试加载API密钥
    if (models.length > 0) {
      for (const model of models) {
        const apiKey = localStorage.getItem(`${model.id}_api_key`);
        if (apiKey) {
          model.apiKey = apiKey;
        }
      }
    }
    
    // 从设置中加载默认模型
    const settings = localStorage.getItem(AI_MODELS_SETTINGS_KEY);
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        if (parsed && parsed.defaultModel) {
          selectedModel = parsed.defaultModel;
        }
      } catch (e) {}
    }
    
    // 如果没有从主设置加载到，尝试从备份加载
    if (!selectedModel) {
      selectedModel = localStorage.getItem('defaultAiModel') || '';
    }
    
    return { models, selectedModel };
  } catch (error) {
    console.error('加载模型失败:', error);
    return { models: [], selectedModel: '' };
  }
}

export const useAiModelsStore = defineStore('aiModels', {
  state: () => ({
    models: [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'OpenAI 的 GPT-4 模型，提供强大的自然语言处理能力',
        status: 'inactive',
        apiKey: '',
        testResult: null,
        provider: 'openai',
        endpoint: 'https://api.openai.com/v1'
      },
      {
        id: 'claude-3',
        name: 'Claude 3',
        description: 'Anthropic 的 Claude 3 模型，提供高质量的自然语言处理能力',
        status: 'inactive',
        apiKey: '',
        testResult: null,
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com'
      },
      {
        id: 'deepseek',
        name: 'DeepSeek Coder',
        description: '专为代码分析和生成优化的 AI 模型',
        status: 'inactive',
        apiKey: '',
        testResult: null,
        provider: 'deepseek',
        modelId: 'deepseek-coder',
        endpoint: 'https://api.deepseek.com',
        keyFormat: 'sk-开头或deepseek-开头均可'
      }
    ],
    loading: false,
    error: null,
    selectedModel: null
  }),

  getters: {
    activeModels: (state) => state.models.filter(model => model.status === 'active'),
    getModelById: (state) => (id) => state.models.find(model => model.id === id)
  },

  actions: {
    // 加载AI模型列表
    async loadModels() {
      try {
        this.loading = true
        this.error = null
        
        // 调用API获取模型列表
        const response = await apiService.getAIModels()
        
        // 处理响应数据
        if (response && Array.isArray(response.models)) {
          this.models = response.models.map(model => ({
            ...model,
            // 确保模型显示名称
            displayName: model.name || model.modelId,
            // 设置默认图标
            icon: this.getProviderIcon(model.provider)
          }))
        }
        
        return this.models
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 测试与AI模型的连接
    async testConnection(modelId) {
      try {
        console.log(`开始测试连接模型 ID: ${modelId}`);
        console.log('当前可用模型:', this.models.map(m => ({id: m.id, name: m.name})));
        
        this.testing = true;
        this.testStatus = 'testing';
        this.testMessage = '正在测试连接...';
        
        if (!modelId) {
          console.error('测试连接失败: 未指定模型ID');
          throw new Error('未指定模型ID');
        }
        
        // 获取当前模型 (通过完全匹配或ID前缀匹配)
        let model = this.models.find(m => m.id === modelId);
        
        // 如果找不到完全匹配的模型，尝试查找ID前缀匹配的模型
        if (!model && modelId.includes('deepseek')) {
          console.log(`尝试通过ID前缀查找DeepSeek模型: ${modelId}`);
          model = this.models.find(m => 
            (m.id.includes('deepseek') || m.provider === 'deepseek') && 
            ((modelId.includes('coder') && m.modelId === 'deepseek-coder') || 
             (!modelId.includes('coder') && m.modelId === 'deepseek-chat'))
          );
          
          if (model) {
            console.log(`通过相似ID找到DeepSeek模型: ${model.id}`);
          }
        }
        
        // 如果还是找不到，使用第一个匹配的provider的模型
        if (!model && modelId.includes('deepseek')) {
          model = this.models.find(m => m.provider === 'deepseek');
          if (model) {
            console.log(`找不到指定ID的模型，使用第一个DeepSeek模型: ${model.id}`);
          }
        }
        
        // 如果还找不到，直接创建临时模型对象用于测试
        if (!model && modelId.includes('deepseek')) {
          console.warn(`找不到ID为 ${modelId} 的模型，创建临时模型用于测试`);
          
          // 尝试从模型ID猜测是否为coder模型
          const isCoder = modelId.includes('coder');
          
          model = {
            id: modelId,
            name: isCoder ? 'DeepSeek Coder (临时)' : 'DeepSeek Chat (临时)',
            provider: 'deepseek',
            modelId: isCoder ? 'deepseek-coder' : 'deepseek-chat',
            endpoint: 'https://api.deepseek.com',
            // 从localStorage中获取API密钥
            apiKey: localStorage.getItem('deepseek_api_key') || ''
          };
          
          // 没有API密钥将无法测试
          if (!model.apiKey) {
            throw new Error('找不到所选模型并且没有API密钥，无法进行测试');
          }
        }
        
        if (!model) {
          // 为了调试，打印所有可用的模型ID
          const availableModels = this.models.map(m => ({id: m.id, provider: m.provider}));
          console.error(`找不到ID为 ${modelId} 的模型。可用模型:`, availableModels);
          throw new Error(`找不到ID为 ${modelId} 的模型`);
        }
        
        // 如果没有API密钥，无法测试
        if (!model.apiKey) {
          console.error(`测试连接失败: 模型 ${model.name} 缺少API密钥`);
          throw new Error(`模型 ${model.name} 缺少API密钥`);
        }
        
        // 自动修复DeepSeek模型ID
        if ((model.provider === 'deepseek' || model.id.includes('deepseek')) && 
            (!model.modelId || !model.modelId.startsWith('deepseek-'))) {
          // 检测到无效的DeepSeek模型ID，自动修复
          const oldModelId = model.modelId;
          model.modelId = model.name.includes('Coder') ? 'deepseek-coder' : 'deepseek-chat';
          console.log(`已自动修复DeepSeek模型ID: ${oldModelId || '(无)'} -> ${model.modelId}`);
        }
        
        console.log(`测试模型连接: ${model.name} (ID: ${model.id}, 模型ID: ${model.modelId})`);
        
        // 构建测试连接请求
        const testData = {
          id: modelId,
          apiKey: model.apiKey,
          provider: model.provider || this.getProviderFromId(modelId),
          endpoint: model.endpoint || '',
          modelId: model.modelId || ''
        };
        
        // 记录请求内容 (不包括apiKey)
        console.log('发送测试请求:', {
          ...testData,
          apiKey: '******' // 隐藏实际API密钥
        });
        
        // 调用API服务测试连接
        const response = await apiService.testAIModelConnection(testData);
        
        if (response && response.success) {
          this.testStatus = 'success';
          this.testMessage = response.message || '连接成功！API配置有效。';
          console.log('测试连接成功:', this.testMessage);
        } else {
          this.testStatus = 'error';
          this.testMessage = response.message || '连接测试失败，但服务器没有返回错误信息。';
          console.error('测试连接失败:', this.testMessage);
        }
        
        return {
          success: this.testStatus === 'success',
          message: this.testMessage
        };
      } catch (error) {
        this.testStatus = 'error';
        this.testMessage = error.message || '连接测试失败';
        console.error('测试连接异常:', error);
        
        return {
          success: false,
          message: this.testMessage
        };
      } finally {
        this.testing = false;
      }
    },
    
    // 保存模型配置
    async saveModel(model) {
      try {
        console.log('保存AI模型到服务器:', {
          id: model.id,
          name: model.name,
          provider: model.provider,
          hasApiKey: !!model.apiKey,
          apiKeyLength: model.apiKey ? model.apiKey.length : 0
        });
        
        // 准备模型数据
        const modelData = {
          name: model.name,
          provider: model.provider || this.getProviderFromId(model.id),
          modelId: model.modelId || (model.id ? model.id : undefined),
          baseUrl: model.endpoint || '',
          apiKey: model.apiKey || '',
          isDefault: model.isDefault || false,
          isActive: model.status === 'active' || model.isActive === true || false
        };
        
        // 对于DeepSeek类型，确保正确的modelId
        if (modelData.provider === 'deepseek' && (!modelData.modelId || !modelData.modelId.startsWith('deepseek-'))) {
          modelData.modelId = model.modelId || 'deepseek-coder';
        }
        
        // ===== API密钥处理增强 =====
        // 确保API密钥存在且非空
        if (!modelData.apiKey || modelData.apiKey.trim() === '') {
          console.warn(`模型 ${model.name} 没有API密钥，尝试查找备份`);
          
          // 1. 尝试从原始模型获取
          if (model.apiKey && model.apiKey.trim() !== '') {
            console.log('从原始模型获取API密钥');
            modelData.apiKey = model.apiKey;
          } 
          // 2. 尝试从本地存储中恢复API密钥
          else {
            const storedKeys = localStorage.getItem('ai_model_api_keys');
            if (storedKeys) {
              try {
                const keysMap = JSON.parse(storedKeys);
                const modelKey = model.id || model.modelId || model.name;
                if (keysMap[modelKey]) {
                  console.log(`从本地存储恢复 ${model.name} 的API密钥`);
                  modelData.apiKey = keysMap[modelKey];
                }
              } catch (e) {
                console.error('解析存储的API密钥失败', e);
              }
            }
          }
        }
        
        // 验证API密钥格式
        if (!modelData.apiKey || modelData.apiKey.trim() === '') {
          console.error(`模型 ${model.name} 的API密钥为空，这可能导致后端验证失败`);
        } else {
          console.log(`模型 ${model.name} 的API密钥长度: ${modelData.apiKey.length}`);
          
          // 检查DeepSeek密钥格式
          if (modelData.provider === 'deepseek' && 
              !modelData.apiKey.startsWith('sk-') && 
              !modelData.apiKey.startsWith('deepseek-')) {
            console.warn('DeepSeek API密钥格式可能不正确，应以sk-或deepseek-开头');
          }
        }
        
        let response;
        if (model.id && /^[0-9a-fA-F]{24}$/.test(model.id)) {
          // 更新现有模型
          console.log('更新已存在的模型:', model.id);
          response = await apiService.updateAIModel(model.id, modelData);
          return response.model || { id: model.id };
        } else {
          // 创建新模型
          console.log('创建新模型, 数据:', {
            ...modelData,
            apiKey: modelData.apiKey ? `${modelData.apiKey.substring(0, 3)}...${modelData.apiKey.substring(modelData.apiKey.length - 3)}` : '未设置'
          });
          response = await apiService.createAIModel(modelData);
          
          if (response && response.model && response.model.id) {
            console.log('模型创建成功，新ID:', response.model.id);
            // 返回新的模型对象
            return response.model;
          } else {
            throw new Error('服务器返回无效响应');
          }
        }
      } catch (error) {
        console.error('保存模型失败:', error);
        throw error;
      }
    },
    
    // 根据ID获取提供商
    getProviderFromId(id) {
      if (id.includes('gpt')) return 'openai'
      if (id.includes('claude')) return 'anthropic'
      if (id.includes('deepseek')) return 'deepseek'
      return 'unknown'
    },

    // 保存API密钥 - 同时在localStorage保存一个备份
    async saveApiKey(model, apiKey) {
      try {
        if (!model || !model.id) {
          throw new Error('无效的模型配置');
        }

        console.log(`保存API密钥到模型 ${model.id} (${model.name})`);
        
        // 更新模型对象中的API密钥
        const modelIndex = this.models.findIndex(m => m.id === model.id);
        if (modelIndex === -1) {
          console.warn(`找不到ID为 ${model.id} 的模型，添加新模型`);
          model.apiKey = apiKey;
          this.models.push(model);
        } else {
          this.models[modelIndex].apiKey = apiKey;
        }
        
        // 在本地存储保存一个备份密钥（这样即使模型对象丢失，我们也能恢复密钥）
        const backupKeyName = `${model.id}_api_key`;
        localStorage.setItem(backupKeyName, apiKey);
        console.log(`已在localStorage保存备份密钥: ${backupKeyName}`);
        
        // 将更新后的模型保存到localStorage
        this.saveToLocalStorage();
        
        // 尝试通过API保存设置（但允许失败）
        try {
          const testData = {
            id: model.id,
            apiKey: apiKey,
            provider: model.provider || this.getProviderFromId(model.id),
            endpoint: model.endpoint || '',
            modelId: model.modelId || ''
          };
          
          const response = await apiService.testAIModelConnection(testData);
          return response || { success: true, message: '保存API密钥成功' };
        } catch (apiError) {
          console.warn('通过API保存密钥失败，但本地保存成功:', apiError);
          return { 
            success: true, 
            message: 'API密钥已保存到本地（API连接失败: ' + apiError.message + '）',
            warning: true
          };
        }
      } catch (error) {
        console.error('保存API密钥失败:', error);
        throw error;
      }
    },

    setDefaultModel(modelId) {
      this.selectedModel = modelId
      // 标记该模型为默认
      this.models.forEach(model => {
        model.isDefault = model.id === modelId;
      });
    },

    // 保存到本地存储 - 使用更强大可靠的方法
    saveToLocalStorage() {
      try {
        console.log('正在保存AI模型设置到本地存储 (强化版)');
        
        // 使用工具函数保存
        const result = saveModelsToLocalStorage(this.models, this.selectedModel);
        
        // 备用方案：如果工具函数失败，尝试使用旧方法
        if (!result) {
          console.warn('工具函数保存失败，使用备用保存方法');
          
          // 确保有模型可以保存
          if (!this.models || this.models.length === 0) {
            console.warn('没有模型可以保存');
            return false;
          }
          
          // 在保存前创建模型的深拷贝，防止循环引用问题
          const modelsCopy = JSON.parse(JSON.stringify(this.models.map(model => ({
            id: model.id,
            name: model.name,
            description: model.description || '',
            provider: model.provider || '',
            status: model.status || 'inactive',
            endpoint: model.endpoint || '',
            modelId: model.modelId || '',
            apiKey: model.apiKey || ''  // 保存API密钥以便下次使用
          }))));
          
          // 检查保存前的存储状态
          console.log('保存前查看设置存储状态:', localStorage.getItem(AI_MODELS_STORAGE_KEY) ? '存在' : '不存在');
          
          // 保存到localStorage
          localStorage.setItem(AI_MODELS_STORAGE_KEY, JSON.stringify(modelsCopy));
          console.log(`已保存主存储，模型数量: ${modelsCopy.length}`);
          
          // 创建一个备份
          localStorage.setItem(AI_MODELS_BACKUP_KEY, JSON.stringify(modelsCopy));
          console.log('已创建备份存储');
          
          // 单独保存每个模型的API密钥
          this.models.forEach(model => {
            if (model.apiKey) {
              localStorage.setItem(`${model.id}_api_key`, model.apiKey);
            }
          });
          
          // 保存默认模型设置
          if (this.selectedModel) {
            const settingsData = {
              defaultModel: this.selectedModel,
              updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(AI_MODELS_SETTINGS_KEY, JSON.stringify(settingsData));
            localStorage.setItem('defaultAiModel', this.selectedModel);
            console.log(`已保存默认模型设置: ${this.selectedModel}`);
          }
          
          // 记录最后保存时间
          localStorage.setItem(AI_MODELS_LAST_SAVED_KEY, new Date().toISOString());
        }
        
        // 验证保存结果
        this.validateSavedData();
        
        return true;
      } catch (error) {
        console.error('保存到本地存储失败:', error);
        
        // 最后尝试 - 记录API密钥
        try {
          if (this.models && this.models.length > 0) {
            this.models.forEach(model => {
              if (model.apiKey && model.id) {
                localStorage.setItem(`${model.id}_api_key`, model.apiKey);
              }
            });
            console.log('已保存API密钥');
          }
        } catch (e) {}
        
        return false;
      }
    },

    // 验证保存的数据是否正确
    validateSavedData() {
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          keys.push(localStorage.key(i));
        }
        
        console.log('存储中的所有键:', keys.join(', '));
        
        // 验证主存储
        const mainData = localStorage.getItem(AI_MODELS_STORAGE_KEY);
        if (mainData) {
          const parsed = JSON.parse(mainData);
          console.log(`验证主存储: 成功读取 ${parsed.length} 个模型`);
        } else {
          console.warn('验证主存储: 找不到数据');
        }
        
        // 验证备份
        const backupData = localStorage.getItem('aiModelsBackup');
        if (backupData) {
          const parsed = JSON.parse(backupData);
          console.log(`验证备份存储: 成功读取 ${parsed.length} 个模型`);
        } else {
          console.warn('验证备份存储: 找不到数据');
        }
        
        // 验证设置
        const settings = localStorage.getItem(AI_MODELS_SETTINGS_KEY);
        if (settings) {
          const parsed = JSON.parse(settings);
          console.log(`验证设置: 默认模型=${parsed.defaultModel}`);
        } else {
          console.warn('验证设置: 找不到数据');
        }
        
        return true;
      } catch (e) {
        console.error('验证失败:', e);
        return false;
      }
    },

    // 从本地存储加载设置 - 增强多层恢复版本
    loadFromLocalStorage() {
      console.log('从本地存储加载AI模型设置 (强化版)');
      
      // 使用工具函数加载
      const result = loadModelsFromLocalStorage();
      
      if (result.models && result.models.length > 0) {
        console.log(`从工具函数加载了 ${result.models.length} 个模型`);
        
        // 更新模型和选定的模型
        this.models = result.models;
        if (result.selectedModel) {
          this.selectedModel = result.selectedModel;
          
          // 在模型中标记默认模型
          this.models.forEach(model => {
            model.isDefault = model.id === this.selectedModel;
          });
        }
        
        // 修复可能的问题
        this.repairModels();
        
        // 返回成功
        return true;
      }
      
      // 如果工具函数失败，尝试使用原始方法
      console.log('工具函数加载失败，使用原始备份方法');
      
      // 显示所有存储的键，查看是否存在模型数据
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      
      // 查找与AI模型相关的键
      const aiModelKeys = keys.filter(key => 
        key.includes('aiModel') || 
        key.includes('AIModel') || 
        key.startsWith('model_') || 
        key.endsWith('_api_key') ||
        key.includes('deepseek')
      );
      console.log('找到的AI模型相关键:', aiModelKeys.join(', '));
      
      let loadSuccessful = false;
      let attemptedMethods = 0;
      
      // 1. 尝试从主存储加载
      try {
        console.log('尝试从主存储加载', AI_MODELS_STORAGE_KEY);
        const mainData = localStorage.getItem(AI_MODELS_STORAGE_KEY);
        if (mainData) {
          const parsed = JSON.parse(mainData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`从主存储加载了 ${parsed.length} 个模型`);
            this.models = parsed;
            loadSuccessful = true;
          } else {
            console.warn('主存储数据格式不正确或为空数组');
          }
        } else {
          console.warn('未找到主存储数据');
        }
        attemptedMethods++;
      } catch (e) {
        console.error('从主存储加载失败:', e);
      }
      
      // 2. 如果主存储加载失败，尝试从备份存储加载
      if (!loadSuccessful) {
        try {
          console.log('尝试从备份存储加载');
          const backupData = localStorage.getItem(AI_MODELS_BACKUP_KEY);
          if (backupData) {
            const parsed = JSON.parse(backupData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`从备份存储加载了 ${parsed.length} 个模型`);
              this.models = parsed;
              
              // 尝试恢复API密钥
              try {
                const apiKeysData = localStorage.getItem('aiModelsApiKeys');
                if (apiKeysData) {
                  const apiKeys = JSON.parse(apiKeysData);
                  
                  // 将API密钥合并到模型中
                  this.models.forEach(model => {
                    const keyInfo = apiKeys.find(k => k.id === model.id);
                    if (keyInfo && keyInfo.apiKey) {
                      model.apiKey = keyInfo.apiKey;
                      console.log(`已恢复模型 ${model.id} 的API密钥`);
                    }
                  });
                }
              } catch (keyErr) {
                console.warn('恢复API密钥失败:', keyErr);
              }
              
              loadSuccessful = true;
            }
          }
          attemptedMethods++;
        } catch (e) {
          console.error('从备份存储加载失败:', e);
        }
      }
      
      // 3. 单独尝试恢复DeepSeek模型
      if (!loadSuccessful || (this.models && this.models.length < 2)) {
        try {
          console.log('尝试专门恢复DeepSeek模型');
          const deepseekApiKey = localStorage.getItem('deepseek_api_key') || 
                               localStorage.getItem('deepseek-chat-model_api_key') ||
                               localStorage.getItem('deepseek-coder-model_api_key');
          
          if (deepseekApiKey) {
            console.log('找到DeepSeek API密钥，创建默认DeepSeek模型');
            
            // 如果已有模型，检查是否存在DeepSeek模型
            let hasDeepseekModel = false;
            if (this.models && this.models.length > 0) {
              hasDeepseekModel = this.models.some(m => 
                m.provider === 'deepseek' || 
                m.id.includes('deepseek') || 
                (m.modelId && m.modelId.includes('deepseek'))
              );
            }
            
            // 如果没有DeepSeek模型，添加一个
            if (!hasDeepseekModel) {
              const deepseekModel = {
                id: 'deepseek-coder-model',
                name: 'DeepSeek Coder',
                description: '专为代码分析和生成优化的 AI 模型',
                provider: 'deepseek',
                status: 'active',
                apiKey: deepseekApiKey,
                endpoint: 'https://api.deepseek.com',
                modelId: 'deepseek-coder',
                testResult: null
              };
              
              if (!this.models) {
                this.models = [];
              }
              
              this.models.push(deepseekModel);
              this.selectedModel = deepseekModel.id;
              console.log('已恢复DeepSeek模型');
              loadSuccessful = true;
            }
          }
        } catch (e) {
          console.error('恢复DeepSeek模型失败:', e);
        }
      }
      
      // 4. 加载默认模型设置
      try {
        // 先尝试从主设置加载
        const settings = localStorage.getItem(AI_MODELS_SETTINGS_KEY);
        if (settings) {
          try {
            const parsed = JSON.parse(settings);
            if (parsed && parsed.defaultModel) {
              this.selectedModel = parsed.defaultModel;
              console.log(`从设置中加载默认模型: ${this.selectedModel}`);
            }
          } catch (e) {
            console.warn('解析设置失败:', e);
          }
        }
        
        // 如果没有从主设置加载到，尝试从备份加载
        if (!this.selectedModel) {
          const defaultModel = localStorage.getItem('defaultAiModel');
          if (defaultModel) {
            this.selectedModel = defaultModel;
            console.log(`从备份设置加载默认模型: ${this.selectedModel}`);
          }
        }
        
        // 在模型中标记默认模型
        if (this.selectedModel && this.models) {
          this.models.forEach(model => {
            model.isDefault = model.id === this.selectedModel;
          });
        }
      } catch (e) {
        console.error('加载默认模型设置失败:', e);
      }
      
      // 5. 如果所有加载方法都失败，创建默认模型
      if (!loadSuccessful) {
        console.warn('所有存储方法都加载失败，初始化默认模型');
        this.autoInitialize();
        loadSuccessful = true;
      }
      
      // 6. 完成加载后进行修复
      this.repairModels();
      
      console.log(`加载完成，当前有 ${this.models ? this.models.length : 0} 个模型，尝试了 ${attemptedMethods} 种加载方法`);
      console.log('加载的模型:', this.models ? this.models.map(m => m.id).join(', ') : '无');
      
      // 7. 保存加载后的状态，确保持久化
      this.saveToLocalStorage();
      
      return loadSuccessful;
    },

    // 修复加载的模型数据，确保所有必要字段存在
    repairModels() {
      if (!this.models || !Array.isArray(this.models)) {
        console.warn('没有有效的模型数据需要修复');
        return;
      }
      
      // 检查是否有丢失的字段并修复
      this.models.forEach(model => {
        if (!model.status) model.status = 'inactive';
        if (!model.testResult) model.testResult = null;
        if (!model.provider) model.provider = this.getProviderFromId(model.id) || 'custom';
        if (!model.endpoint) {
          if (model.provider === 'deepseek') {
            model.endpoint = 'https://api.deepseek.com';
          } else if (model.provider === 'openai') {
            model.endpoint = 'https://api.openai.com/v1';
          } else if (model.provider === 'anthropic') {
            model.endpoint = 'https://api.anthropic.com';
          }
        }
        if (!model.modelId && model.provider === 'deepseek') {
          model.modelId = model.name.includes('Coder') ? 'deepseek-coder' : 'deepseek-chat';
        }
      });
      
      // 确保有至少一个激活的模型
      const hasActiveModel = this.models.some(m => m.status === 'active');
      if (!hasActiveModel && this.models.length > 0) {
        // 尝试激活DeepSeek Coder模型
        const deepseekModel = this.models.find(m => 
          m.provider === 'deepseek' && 
          (m.modelId === 'deepseek-coder' || m.name.includes('Coder'))
        );
        
        if (deepseekModel) {
          console.log('激活DeepSeek Coder模型:', deepseekModel.id);
          deepseekModel.status = 'active';
          this.selectedModel = deepseekModel.id;
        } else {
          // 如果没有找到Coder模型，激活第一个模型
          this.models[0].status = 'active';
          this.selectedModel = this.models[0].id;
          console.log('激活第一个模型:', this.models[0].id);
        }
      }
    },

    // 加载设置
    async loadSettings() {
      try {
        this.loading = true;
        this.error = null;
        
        // 尝试从API加载
        const response = await apiService.getAIModels();
        
        if (response && Array.isArray(response.models)) {
          this.models = response.models;
          return { success: true };
        }
        
        // API加载失败，尝试从本地存储加载
        if (this.loadFromLocalStorage()) {
          return { success: true, fromLocalStorage: true };
        }
        
        throw new Error('无法加载模型设置');
      } catch (error) {
        this.error = error.message;
        return { 
          success: false, 
          message: error.message,
          from: 'local' 
        };
      } finally {
        this.loading = false;
      }
    },
    
    // 保存设置
    async saveSettings() {
      try {
        // 备份所有模型的API密钥到单独的存储
        this.backupApiKeys();
        
        // 首先确保保存到本地存储
        this.saveToLocalStorage();
        
        // 过滤出可以保存到服务器的模型
        // MongoDB ObjectID必须是24个字符的十六进制字符串
        let serverCompatibleModels = this.models.filter(model => {
          // 检查ID是否符合MongoDB ObjectID格式
          const isValidObjectId = model.id && /^[0-9a-fA-F]{24}$/.test(model.id);
          
          // 检查是否为预定义的模型（id为gpt-4, claude-3, deepseek）
          const isPredefinedModel = ['gpt-3.5', 'gpt-4', 'claude-3', 'deepseek'].includes(model.id);
          
          // 检查是否为DeepSeek特殊模型
          const isDeepSeekModel = model.id && 
                                (model.id.includes('deepseek') || 
                                 (model.provider === 'deepseek'));
          
          const result = isValidObjectId || isPredefinedModel || isDeepSeekModel;
          
          // 记录筛选结果
          if (result) {
            console.log(`模型 ${model.name} (${model.id}) 符合服务器兼容条件`);
          } else {
            console.log(`模型 ${model.name} (${model.id}) 不符合服务器兼容条件`);
          }
          
          return result;
        });
        
        // 进一步筛选，确保有API密钥
        serverCompatibleModels = serverCompatibleModels.map(model => {
          // 深拷贝，避免修改原始模型
          const serverModel = JSON.parse(JSON.stringify(model));
          
          // 确保有API密钥
          if (!serverModel.apiKey || serverModel.apiKey.trim() === '') {
            console.warn(`服务器模型 ${serverModel.name} 缺少API密钥，尝试恢复`);
            // 尝试从本地存储恢复
            const storedKeys = localStorage.getItem('ai_model_api_keys');
            if (storedKeys) {
              try {
                const keysMap = JSON.parse(storedKeys);
                const modelKey = serverModel.id || serverModel.modelId || serverModel.name;
                if (keysMap[modelKey]) {
                  console.log(`从备份中恢复 ${serverModel.name} 的API密钥`);
                  serverModel.apiKey = keysMap[modelKey];
                }
              } catch (e) {
                console.error('解析存储的API密钥失败', e);
              }
            }
          }
          
          return serverModel;
        });
        
        // 再次筛选，只保留有API密钥的模型
        const modelsWithKey = serverCompatibleModels.filter(m => m.apiKey && m.apiKey.trim() !== '');
        const modelsWithoutKey = serverCompatibleModels.filter(m => !m.apiKey || m.apiKey.trim() === '');
        
        if (modelsWithoutKey.length > 0) {
          console.warn(`${modelsWithoutKey.length} 个模型缺少API密钥，无法保存到服务器:`, 
            modelsWithoutKey.map(m => m.name).join(', '));
        }
        
        // 更新为只保存有密钥的模型
        serverCompatibleModels = modelsWithKey;
        
        // 确保至少有一个活跃模型被保存到服务器
        if (serverCompatibleModels.length === 0 && this.models.length > 0) {
          console.log('没有找到服务器兼容模型，尝试创建新的后端兼容模型');
          
          // 查找有API密钥的模型
          const allModelsWithKey = this.models.filter(m => m.apiKey && m.apiKey.trim() !== '');
          
          if (allModelsWithKey.length > 0) {
            // 优先使用DeepSeek模型
            const deepseekModel = allModelsWithKey.find(m => 
              m.provider === 'deepseek' || (m.id && m.id.includes('deepseek')));
            
            if (deepseekModel) {
              console.log('使用DeepSeek模型创建服务器兼容版本');
              // 深拷贝避免修改原始模型
              const serverModel = JSON.parse(JSON.stringify(deepseekModel));
              // 修改必要属性
              serverModel.id = undefined; // 创建新模型
              serverModel.name = deepseekModel.name + ' (后端版本)';
              serverModel.isDefault = true;
              serverModel.isActive = true;
              // 确保API密钥被正确复制
              if (serverModel.apiKey && serverModel.apiKey.trim() !== '') {
                console.log(`为新创建的服务器模型设置API密钥，长度: ${serverModel.apiKey.length}`);
              } else {
                console.error('无法为新创建的DeepSeek服务器模型设置API密钥');
              }
              
              serverCompatibleModels.push(serverModel);
            } else {
              // 使用第一个有API密钥的模型
              const firstModelWithKey = allModelsWithKey[0];
              console.log('使用第一个有API密钥的模型创建服务器兼容版本:', firstModelWithKey.name);
              
              // 深拷贝避免修改原始模型
              const serverModel = JSON.parse(JSON.stringify(firstModelWithKey));
              // 修改必要属性
              serverModel.id = undefined; // 创建新模型
              serverModel.name = firstModelWithKey.name + ' (后端版本)';
              serverModel.isDefault = true;
              serverModel.isActive = true;
              // 确保API密钥被正确复制
              if (serverModel.apiKey && serverModel.apiKey.trim() !== '') {
                console.log(`为新创建的服务器模型设置API密钥，长度: ${serverModel.apiKey.length}`);
              } else {
                console.error('无法为新创建的服务器模型设置API密钥');
              }
              
              serverCompatibleModels.push(serverModel);
            }
          }
        }
        
        console.log('将保存到服务器的模型:', serverCompatibleModels.map(m => ({
          name: m.name,
          hasApiKey: !!m.apiKey,
          apiKeyLength: m.apiKey ? m.apiKey.length : 0
        })));
        
        console.log('仅保存在本地的模型:', this.models
          .filter(m => !serverCompatibleModels.some(sm => sm.id === m.id))
          .map(m => m.name));
        
        // 保存到API
        const results = [];
        for (const model of serverCompatibleModels) {
          if (model && (model.id || model.name)) {
            try {
              // 最后验证确保模型有API密钥
              if (!model.apiKey || model.apiKey.trim() === '') {
                console.error(`跳过没有API密钥的模型: ${model.name}`);
                results.push({
                  model: model.name,
                  success: false,
                  error: 'API密钥为空'
                });
                continue;
              }
              
              const result = await this.saveModel(model);
              results.push({
                model: model.name,
                success: true,
                result
              });
              
              // 如果是新创建的模型，更新本地索引
              if (!model.id && result && result.id) {
                // 更新模型ID
                model.id = result.id;
                console.log(`模型 ${model.name} 已创建，ID: ${model.id}`);
                
                // 重新保存到本地以更新ID
                this.saveToLocalStorage();
              }
            } catch (error) {
              console.error(`保存模型 ${model.name} 失败:`, error);
              results.push({
                model: model.name,
                success: false,
                error: error.message
              });
            }
          }
        }
        
        // 检查是否存在错误
        const hasErrors = results.some(r => !r.success);
        
        if (hasErrors) {
          console.warn('部分模型保存失败:', results.filter(r => !r.success));
          return { 
            success: true,
            warning: true,
            message: '部分模型保存到服务器失败，但所有模型已保存到本地',
            details: results
          };
        }
        
        return { 
          success: true,
          message: '所有模型保存成功',
          details: results
        };
      } catch (error) {
        // 如果API保存失败，至少尝试保存到本地
        console.error('保存设置到服务器失败:', error);
        
        return { 
          success: false, 
          message: error.message 
        };
      }
    },

    // 更新模型列表
    updateModels(models) {
      this.models = [...models];
    },

    // 保存设置到本地存储 (保持这个方法名称与视图组件中的调用一致)
    saveSettingsToLocalStorage() {
      return this.saveToLocalStorage();
    },

    // 添加自动初始化方法 - 确保可以脱机工作
    autoInitialize() {
      console.log('自动初始化AI模型存储');
      try {
        // 尝试从本地存储加载
        this.loadFromLocalStorage();
        
        // 检查是否成功加载了模型
        if (this.models.length === 0) {
          console.log('本地存储中没有找到模型，添加默认模型');
          // 添加默认模型
          this.models = [];
          this.addDefaultModels();
        } else {
          console.log(`从本地存储加载了 ${this.models.length} 个模型`);
          
          // 尝试恢复API密钥
          this.restoreApiKeys();
        }
        
        // 注册页面离开事件以保存数据
        this.registerBeforeUnloadEvent();
        
        return {
          modelsLoaded: this.models.length,
          defaultModel: this.defaultModel
        };
      } catch (error) {
        console.error('自动初始化失败:', error);
        
        // 出错时使用默认模型
        console.log('使用默认模型');
        this.models = [];
        this.addDefaultModels();
        
        // 仍然注册页面离开事件
        this.registerBeforeUnloadEvent();
        
        return {
          modelsLoaded: this.models.length,
          defaultModel: this.defaultModel,
          error: error.message
        };
      }
    },
    
    // 尝试从备份中恢复API密钥
    restoreApiKeys() {
      try {
        console.log('尝试从备份中恢复API密钥');
        
        // 获取API密钥备份
        const storedKeys = localStorage.getItem('ai_model_api_keys');
        if (!storedKeys) {
          console.log('没有找到API密钥备份');
          return { restored: 0 };
        }
        
        // 解析备份数据
        const keysMap = JSON.parse(storedKeys);
        console.log(`找到 ${Object.keys(keysMap).length} 个API密钥备份条目`);
        
        // 记录恢复结果
        let restoredCount = 0;
        let alreadyHadKeyCount = 0;
        
        // 遍历所有模型
        this.models.forEach(model => {
          // 只尝试恢复没有密钥的模型
          if (!model.apiKey || model.apiKey.trim() === '') {
            // 创建可能的键名列表
            const possibleKeys = [
              model.id,
              model.modelId,
              model.name,
              `${model.provider}_${model.name}`
            ].filter(Boolean); // 移除空值
            
            // 尝试每个可能的键
            for (const key of possibleKeys) {
              if (keysMap[key]) {
                console.log(`从备份中为模型 ${model.name} 恢复API密钥`);
                model.apiKey = keysMap[key];
                restoredCount++;
                break; // 找到一个就退出
              }
            }
          } else {
            alreadyHadKeyCount++;
          }
        });
        
        console.log(`API密钥恢复完成: ${restoredCount} 个密钥已恢复，${alreadyHadKeyCount} 个模型已有密钥`);
        return {
          restored: restoredCount,
          alreadyHad: alreadyHadKeyCount
        };
      } catch (error) {
        console.error('恢复API密钥失败:', error);
        return { error: error.message };
      }
    },

    // 添加注册各种保存事件的方法
    registerBeforeUnloadEvent() {
      try {
        console.log('注册页面卸载事件处理程序');
        
        // 如果已经注册过，先清理旧的处理函数
        if (window._aiModelEventsRegistered) {
          console.log('清理之前注册的事件处理程序');
          if (typeof window._aiModelsStoreCleanup === 'function') {
            window._aiModelsStoreCleanup();
          }
        }
        
        // 在卸载前保存数据
        const handleSave = () => {
          try {
            console.log('页面即将刷新或关闭，保存状态');
            
            // 方法1: 使用Pinia store的方法保存
            this.saveToLocalStorage();
            
            // 方法2: 使用独立工具函数保存 (双保险)
            if (this.models && this.models.length > 0) {
              saveModelsToLocalStorage(this.models, this.selectedModel);
            }
            
            // 方法3: 最小备份 - 只保存API密钥，这是最重要的数据
            if (this.models && this.models.length > 0) {
              this.models.forEach(model => {
                if (model.apiKey && model.id) {
                  localStorage.setItem(`${model.id}_api_key`, model.apiKey);
                }
              });
            }
            
            // 同步写入存储 - 尝试确保数据写入
            // 在某些浏览器中，可能需要阻塞一小段时间确保数据写入
            if (typeof navigator.sendBeacon === 'function') {
              // 创建一个最小键值对，使用Beacon API同步保存
              const modelCount = this.models ? this.models.length : 0;
              const beacon = new Blob([JSON.stringify({
                count: modelCount, 
                time: Date.now(),
                action: 'save'
              })], {type: 'application/json'});
              
              navigator.sendBeacon('about:blank', beacon);
              console.log('发送beacon信号');
            } else {
              // 阻塞主线程一小段时间，确保localStorage操作完成
              console.log('同步等待确保存储完成');
              const startTime = Date.now();
              while (Date.now() - startTime < 50) {
                // 空循环，确保数据写入
              }
            }
          } catch (e) {
            console.error('保存失败:', e);
            
            // 最后尝试 - 直接保存每个模型的API密钥
            try {
              if (this.models && this.models.length > 0) {
                this.models.forEach(model => {
                  if (model.apiKey && model.id) {
                    localStorage.setItem(`${model.id}_api_key`, model.apiKey);
                  }
                });
              }
            } catch (finalError) {
              console.error('最终保存尝试失败:', finalError);
            }
          }
        };
        
        // 1. beforeunload事件 - 浏览器刷新或关闭时触发
        window.addEventListener('beforeunload', handleSave);
        
        // 2. unload事件 - 备份方案，在beforeunload不触发时使用
        window.addEventListener('unload', handleSave);
        
        // 3. visibilitychange事件 - 当页面变为不可见时触发
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            console.log('页面变为不可见，保存状态');
            this.saveToLocalStorage();
          }
        });
        
        // 4. 定时自动保存 - 每5分钟保存一次
        const autoSaveInterval = 5 * 60 * 1000; // 5分钟
        const intervalId = setInterval(() => {
          console.log('自动保存时间到，保存模型状态');
          this.saveToLocalStorage();
        }, autoSaveInterval);
        
        // 5. 路由变化保存 - 如果使用Vue Router
        if (window.router) {
          try {
            window.router.beforeEach((to, from, next) => {
              console.log('路由即将变化，保存状态');
              this.saveToLocalStorage();
              next();
            });
          } catch (e) {
            console.warn('无法注册路由变化事件:', e);
          }
        }
        
        // 清理函数 - 当组件卸载时清理
        window._aiModelsStoreCleanup = () => {
          window.removeEventListener('beforeunload', handleSave);
          window.removeEventListener('unload', handleSave);
          document.removeEventListener('visibilitychange', handleSave);
          clearInterval(intervalId);
        };
        
        // 存储被注册的状态
        window._aiModelEventsRegistered = true;
        
        console.log('已注册所有页面卸载事件');
        
        // 立即保存一次当前状态
        this.saveToLocalStorage();
      } catch (error) {
        console.error('注册页面卸载事件失败:', error);
      }
    },

    // 手动触发一次保存 - 用于在用户操作后立即保存
    forceSave() {
      console.log('手动触发保存 (强化版)');
      
      // 使用多种方式保存，确保至少一种成功
      let success = false;
      
      // 1. 使用store方法保存
      try {
        const result = this.saveToLocalStorage();
        if (result) {
          success = true;
          console.log('使用store方法保存成功');
        }
      } catch (e) {
        console.error('使用store方法保存失败:', e);
      }
      
      // 2. 使用工具函数保存 (双重保险)
      try {
        if (this.models && this.models.length > 0) {
          const result = saveModelsToLocalStorage(this.models, this.selectedModel);
          if (result) {
            success = true;
            console.log('使用工具函数保存成功');
          }
        }
      } catch (e) {
        console.error('使用工具函数保存失败:', e);
      }
      
      // 3. 最小备份 - 保存API密钥
      try {
        if (this.models && this.models.length > 0) {
          let keySaved = false;
          this.models.forEach(model => {
            if (model.apiKey && model.id) {
              localStorage.setItem(`${model.id}_api_key`, model.apiKey);
              keySaved = true;
            }
          });
          if (keySaved) {
            console.log('已保存API密钥作为最小备份');
          }
        }
      } catch (e) {
        console.error('保存API密钥失败:', e);
      }
      
      // 保存时间记录
      try {
        localStorage.setItem(AI_MODELS_LAST_SAVED_KEY, new Date().toISOString());
      } catch (e) {}
      
      return success;
    },

    // 备份所有模型的API密钥到单独的存储
    backupApiKeys() {
      try {
        console.log('备份所有模型的API密钥到单独的存储');
        
        // 创建一个备份对象
        const apiKeysBackup = {};
        
        // 遍历所有模型，将API密钥备份到备份对象中
        this.models.forEach(model => {
          if (model.apiKey && model.apiKey.trim() !== '') {
            // 使用多个标识符以提高恢复成功率
            const keys = [
              model.id, 
              model.modelId, 
              model.name,
              `${model.provider}_${model.name}`
            ].filter(Boolean); // 移除空值
            
            // 为每个标识符存储密钥
            keys.forEach(key => {
              if (key) {
                apiKeysBackup[key] = model.apiKey;
              }
            });
            
            console.log(`已备份模型 ${model.name} 的API密钥`);
          }
        });
        
        // 将备份对象保存到localStorage
        localStorage.setItem('ai_model_api_keys', JSON.stringify(apiKeysBackup));
        console.log(`API密钥备份完成，共 ${Object.keys(apiKeysBackup).length} 个条目`);
      } catch (error) {
        console.error('备份API密钥失败:', error);
      }
    },

    // 添加默认模型
    addDefaultModels() {
      console.log('添加默认AI模型');
      
      // 添加基本模型
      const baseModels = [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'OpenAI 的 GPT-4 模型，提供强大的自然语言处理能力',
          status: 'inactive',
          apiKey: '',
          testResult: null,
          provider: 'openai',
          endpoint: 'https://api.openai.com/v1'
        },
        {
          id: 'gpt-3.5',
          name: 'GPT-3.5 Turbo',
          description: 'OpenAI 的 GPT-3.5 Turbo 模型，性价比高',
          status: 'inactive',
          apiKey: '',
          testResult: null,
          provider: 'openai',
          endpoint: 'https://api.openai.com/v1'
        },
        {
          id: 'claude-3',
          name: 'Claude 3',
          description: 'Anthropic 的 Claude 3 模型，提供高质量的自然语言处理能力',
          status: 'inactive',
          apiKey: '',
          testResult: null,
          provider: 'anthropic',
          endpoint: 'https://api.anthropic.com'
        }
      ];
      
      // 添加DeepSeek模型
      const deepseekModels = [
        {
          id: 'deepseek-coder-model',
          name: 'DeepSeek Coder',
          description: '专为代码分析和生成优化的 AI 模型',
          provider: 'deepseek',
          status: 'active', // 默认激活
          apiKey: '',
          endpoint: 'https://api.deepseek.com',
          modelId: 'deepseek-coder',
          testResult: null,
          keyFormat: 'sk-开头或deepseek-开头均可'
        },
        {
          id: 'deepseek-chat-model',
          name: 'DeepSeek Chat',
          description: 'DeepSeek 对话AI模型',
          provider: 'deepseek',
          status: 'inactive',
          apiKey: '',
          endpoint: 'https://api.deepseek.com',
          modelId: 'deepseek-chat',
          testResult: null,
          keyFormat: 'sk-开头或deepseek-开头均可'
        }
      ];
      
      // 合并到this.models
      this.models = [...baseModels, ...deepseekModels];
      
      // 选择DeepSeek Coder作为默认模型
      const deepseekCoder = this.models.find(m => 
        m.id === 'deepseek-coder-model' || 
        (m.provider === 'deepseek' && m.modelId === 'deepseek-coder')
      );
      
      if (deepseekCoder) {
        this.selectedModel = deepseekCoder.id;
      }
      
      // 尝试恢复之前保存的API密钥 (旧格式的备份)
      this.models.forEach(model => {
        try {
          // 旧版本API密钥存储
          const savedKey = localStorage.getItem(`${model.id}_api_key`);
          if (savedKey) {
            model.apiKey = savedKey;
            console.log(`已恢复模型 ${model.id} 的API密钥(旧格式)`);
          }
        } catch (e) {
          console.warn(`无法恢复模型 ${model.id} 的API密钥:`, e);
        }
      });
      
      console.log('已添加', this.models.length, '个默认模型');
      
      // 初始化后立即保存到localStorage
      this.saveToLocalStorage();
      
      // 创建API密钥备份
      this.backupApiKeys();
      
      return this.models;
    }
  }
}); 