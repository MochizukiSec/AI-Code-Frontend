// 分析服务
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ANALYSIS_V1_URL = `${API_BASE_URL}/v1/code-analysis`;

import storageService from './storage.service';
import errorHandler from '../utils/errorHandler';

// 确认API路径
function logApiPaths() {
  console.log('===== API路径配置 =====');
  console.log('API基础URL:', API_BASE_URL);
  console.log('分析API URL:', API_ANALYSIS_V1_URL);
  console.log('初始化分析:', `${API_ANALYSIS_V1_URL}/initialize`);
  console.log('上传文件:', `${API_ANALYSIS_V1_URL}/:id/upload`);
  console.log('开始分析:', `${API_ANALYSIS_V1_URL}/:id/start`);
  console.log('获取进度:', `${API_ANALYSIS_V1_URL}/progress/:id`);
  console.log('获取结果:', `${API_ANALYSIS_V1_URL}/results/:id`);
  console.log('获取历史:', `${API_ANALYSIS_V1_URL}/history`);
  console.log('========================');
}

// 在初始化时记录API配置
logApiPaths();

// 获取认证头
async function getAuthHeaders() {
  try {
    const token = await storageService.safeGetAuthToken();
    
    if (!token) {
      console.log('未获取到认证令牌，使用本地分析模式');
      return { 'X-Analysis-Mode': 'local' };
    }
    
    console.log('使用令牌类型:', typeof token, '长度:', token.length);
    const authHeader = { 'Authorization': `Bearer ${token}` };
    return authHeader;
  } catch (error) {
    console.error('获取认证头失败:', error);
    // 返回一个空的认证头，让API决定如何处理
    return { 'X-Analysis-Mode': 'local', 'X-Error': 'auth_failed' };
  }
}

// 带重试的fetch请求
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  let lastError;
  
  console.log(`发送请求到: ${url}`);
  console.log(`请求方法: ${options.method}`);
  console.log(`请求头:`, options.headers);
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`尝试请求 ${url} (尝试 ${i + 1}/${retries})`);
      const response = await fetch(url, options);
      
      // 如果是404错误，打印详细信息并立即返回（不重试）
      if (response.status === 404) {
        console.error(`API端点不存在: ${url}`);
        console.error(`请检查API路径是否正确配置`);
        // 不重试404错误
        return response;
      }
      
      // 如果是401错误，认证失败，不重试
      if (response.status === 401) {
        console.log('认证失败(401)，切换到本地分析模式');
        throw new Error('认证已过期，请重新登录');
      }
      
      return response;
    } catch (error) {
      console.error(`请求 ${url} 失败 (尝试 ${i + 1}/${retries}):`, error);
      lastError = error;
      
      // 如果不是最后一次尝试，等待后重试
      if (i < retries - 1) {
        console.log(`等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // 增加延迟时间，实现指数退避
        delay *= 2;
      }
    }
  }
  
  console.error('所有API请求尝试都失败，切换到本地分析模式');
  throw lastError;
}

// 本地分析函数
async function analyzeLocally(files) {
  console.log('开始本地分析...');
  
  try {
    // 确保files参数存在且是数组
    if (!files || !Array.isArray(files)) {
      console.warn('文件列表为空或无效，使用空数组');
      files = [];
    }
    
    // 1. 生成任务ID
    const taskId = 'local_' + Date.now();
    console.log('生成本地任务ID:', taskId);
    
    // 2. 读取文件内容
    const fileContents = await Promise.all(
      files.map(async (file) => {
        // 只处理文本文件和代码文件
        if (file.type && (file.type.startsWith('text/') || 
            file.name.match(/\.(js|jsx|ts|tsx|html|css|json|md|py|java|go|c|cpp|h|hpp|cs|php|rb)$/i))) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                content: e.target.result,
                language: analysisService.getLanguageFromExtension(file.name.split('.').pop())
              });
            };
            reader.readAsText(file);
          });
        }
        return null;
      })
    );
    
    // 过滤掉null值
    const validFileContents = fileContents.filter(f => f !== null);
    console.log('读取文件内容完成，有效文件数:', validFileContents.length);
    
    // 3. 使用规则匹配生成结果
    console.log('开始生成分析结果...');
    const results = analysisService.analyzeWithRules(validFileContents);
    
    // 4. 保存结果到localStorage
    localStorage.setItem(`analysis_results_${taskId}`, JSON.stringify(results));
    localStorage.setItem('analysisResults', JSON.stringify(results));
    console.log('分析结果已保存');
    
    return {
      taskId,
      status: 'completed',
      progress: 100,
      results
    };
  } catch (error) {
    console.error('本地分析失败:', error);
    throw error;
  }
}

const analysisService = {
  // 初始化分析
  async initializeAnalysis() {
    console.log('初始化分析...');
    try {
      const headers = await getAuthHeaders();
      console.log('使用的认证头:', JSON.stringify(headers));
      
      const initResponse = await fetchWithRetry(`${API_ANALYSIS_V1_URL}/initialize`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // 可以添加额外的初始化参数
      });

      if (!initResponse.ok) {
        throw new Error(`初始化分析失败: ${initResponse.status} ${initResponse.statusText}`);
      }

      const initData = await initResponse.json();
      console.log('初始化分析成功:', initData);
      
      // 保存任务ID到本地存储
      if (initData && initData.taskId) {
        localStorage.setItem('current_analysis_task', initData.taskId);
      }
      
      return initData;
    } catch (error) {
      console.error('初始化分析失败:', error);
      throw error;
    }
  },

  // 上传文件
  async uploadFiles(taskId, files) {
    console.log('正在上传文件...', taskId);
    try {
      // 准备表单数据
      const formData = new FormData();
      const fileMetadata = [];
      
      // 检查是否为项目分析
      const isProject = files.length > 0 && files[0].webkitRelativePath;
      
      // 添加每个文件到表单
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 使用相对路径作为文件名如果是项目分析
        const fileName = isProject 
          ? file.webkitRelativePath 
          : file.name;
          
        formData.append('files', file, fileName);
        
        // 为每个文件添加元数据
        fileMetadata.push({
          name: fileName,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          isProject: isProject
        });
      }
      
      // 添加文件元数据
      formData.append('metadata', JSON.stringify(fileMetadata));
      formData.append('isProject', isProject.toString());
      
      // 获取认证头
      const headers = await getAuthHeaders();
      
      // 发送上传请求
      const uploadResponse = await fetch(`${API_ANALYSIS_V1_URL}/${taskId}/upload`, {
        method: 'POST',
        headers: {
          ...headers
          // Content-Type 会自动设置为 multipart/form-data
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`上传文件失败: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }
      
      const uploadData = await uploadResponse.json();
      console.log('上传文件成功:', uploadData);
      return uploadData;
    } catch (error) {
      console.error('上传文件失败:', error);
      throw error;
    }
  },

  // 开始分析
  async startAnalysis(taskId, files, ruleIds = [], isProject = false) {
    console.log(`开始分析，任务ID: ${taskId}`);
    console.log(`使用规则: ${ruleIds ? ruleIds.length : 0}个，项目模式: ${isProject}`);
    
    try {
      const headers = await getAuthHeaders();
      
      // 获取保存的AI模型信息
      let selectedModelId = "";
      let modelInfo = null;
      let apiKey = "";

      try {
        // 获取模型设置方法
        const getModelSettings = () => {
          // 先尝试从aiModelsSettings中读取
          try {
            const aiModelsSettings = localStorage.getItem('aiModelsSettings');
            if (aiModelsSettings) {
              const settings = JSON.parse(aiModelsSettings);
              return settings;
            }
          } catch (e) {
            console.warn('读取aiModelsSettings失败:', e);
          }
          
          // 尝试从其他位置读取
          try {
            const defaultModel = localStorage.getItem('defaultAiModel');
            if (defaultModel) {
              return { defaultModel };
            }
          } catch (e) {
            console.warn('读取defaultAiModel失败:', e);
          }
          
          return null;
        };

        // 获取模型列表方法
        const getModelList = () => {
          // 尝试获取模型列表的多种来源
          const sources = [
            'aiModels',
            'aiModelsBackup',
            'aiModelsApiKeys'
          ];
          
          for (const source of sources) {
            try {
              const data = localStorage.getItem(source);
              if (data) {
                const models = JSON.parse(data);
                if (Array.isArray(models) && models.length > 0) {
                  console.log(`从 ${source} 获取到 ${models.length} 个模型`);
                  return models;
                }
              }
            } catch (e) {
              console.warn(`读取 ${source} 失败:`, e);
            }
          }
          
          // 尝试读取单独保存的模型
          try {
            const allKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
              allKeys.push(localStorage.key(i));
            }
            
            const modelKeys = allKeys.filter(k => k.startsWith('model_'));
            if (modelKeys.length > 0) {
              console.log(`发现 ${modelKeys.length} 个单独保存的模型`);
              
              const models = [];
              for (const key of modelKeys) {
                try {
                  const model = JSON.parse(localStorage.getItem(key));
                  if (model && model.id) {
                    // 尝试读取API密钥
                    const apiKey = localStorage.getItem(`${model.id}_api_key`);
                    if (apiKey) {
                      model.apiKey = apiKey;
                    }
                    models.push(model);
                  }
                } catch (e) {}
              }
              
              if (models.length > 0) {
                return models;
              }
            }
          } catch (e) {
            console.warn('读取单独模型失败:', e);
          }
          
          return [];
        };

        // 1. 首先尝试从设置中获取默认模型
        const settings = getModelSettings();
        if (settings && settings.defaultModel) {
          selectedModelId = settings.defaultModel;
          console.log('从设置中获取默认模型ID:', selectedModelId);
        }

        // 2. 如果没有默认模型，查找任何活跃模型
        if (!selectedModelId) {
          const models = getModelList();
          if (models && models.length > 0) {
            // 优先查找状态为active的模型
            const activeModel = models.find(model => 
              model.status === 'active' || model.isActive === true);
            
            if (activeModel) {
              selectedModelId = activeModel.id;
              modelInfo = activeModel;
              console.log('找到活跃模型:', activeModel.name);
            } else {
              // 如果没有active的模型，使用列表中的第一个
              selectedModelId = models[0].id;
              modelInfo = models[0];
              console.log('没有找到活跃模型，使用第一个模型:', models[0].name);
            }
          }
        } else {
          // 如果已经找到选定的模型ID，获取更多模型信息
          const models = getModelList();
          if (models && models.length > 0) {
            modelInfo = models.find(model => model.id === selectedModelId);
            if (modelInfo) {
              console.log('获取到模型详细信息:', 
                          modelInfo.name, 
                          '提供商:', modelInfo.provider || '未知');
            }
          }
        }
        
        // 3. 确保使用后端能识别的模型ID
        // MongoDB ObjectID必须是24个字符的十六进制字符串
        if (selectedModelId) {
          if (/^[0-9a-fA-F]{24}$/.test(selectedModelId)) {
            // 如果已经是有效的ObjectID格式，直接使用
            console.log('使用有效的MongoDB ObjectID:', selectedModelId);
          } else {
            // 对于任何非ObjectID格式的ID，都使用空字符串，让后端选择默认模型
            console.log(`模型ID "${selectedModelId}" 不是有效的MongoDB ObjectID，改为使用默认模型`);
            selectedModelId = '';  // 让后端使用默认模型
          }
        }
        
        // 4. 获取并验证API密钥
        if (modelInfo && modelInfo.apiKey) {
          apiKey = modelInfo.apiKey;
          
          // 验证API密钥格式
          if (typeof apiKey !== 'string' || apiKey.length < 10) {
            console.warn(`API密钥格式可能不正确: 类型=${typeof apiKey}, 长度=${apiKey.length}`);
          } else {
            // 检查特定提供商的格式
            if (modelInfo.provider === 'deepseek' && !apiKey.startsWith('sk-')) {
              console.warn('DeepSeek API密钥通常应以sk-开头');
            } else if (modelInfo.provider === 'openai' && !apiKey.startsWith('sk-')) {
              console.warn('OpenAI API密钥通常应以sk-开头');
            } else if (modelInfo.provider === 'anthropic' && !apiKey.startsWith('sk-')) {
              console.warn('Anthropic API密钥格式可能不正确');
            }
            
            console.log(`已获取API密钥，长度: ${apiKey.length}，格式有效`);
          }
        } else if (modelInfo) {
          console.warn(`模型 ${modelInfo.name || selectedModelId} 没有设置API密钥`);
          
          // 尝试从单独存储的密钥中读取
          try {
            apiKey = localStorage.getItem(`${selectedModelId}_api_key`);
            if (apiKey) {
              console.log(`从单独存储中获取到API密钥，长度: ${apiKey.length}`);
            } else {
              console.warn('未找到单独存储的API密钥');
            }
          } catch (keyError) {
            console.error('读取API密钥失败:', keyError);
          }
        }
      } catch (e) {
        console.warn('获取AI模型设置失败:', e);
        selectedModelId = ''; // 让后端使用默认模型
      }
      
      // 创建请求体对象
      const requestBody = {
        ruleIds: ruleIds, // 使用传入的规则ID列表
        aiModelId: selectedModelId, // 使用选定的模型ID
        isProject: isProject // 标记是否为项目分析
      };
      
      // 如果获取到了API密钥，也将其添加到请求中
      if (apiKey) {
        requestBody.apiKey = apiKey;
      }
      
      // 记录要应用的规则数量和分析模式
      console.log(`应用 ${ruleIds.length} 个规则进行分析，${isProject ? '项目' : '单文件'}模式`);
      
      // 日志记录请求信息（隐藏敏感信息）
      const safeRequestBody = { ...requestBody };
      if (safeRequestBody.apiKey) {
        safeRequestBody.apiKey = `${safeRequestBody.apiKey.substring(0, 4)}...${
          safeRequestBody.apiKey.substring(safeRequestBody.apiKey.length - 4)}`;
      }
      console.log('分析请求体:', JSON.stringify(safeRequestBody));
      
      // 如果是项目分析，添加项目信息
      if (isProject && files.length > 0 && files[0].webkitRelativePath) {
        const firstFilePath = files[0].webkitRelativePath;
        const pathParts = firstFilePath.split('/');
        if (pathParts.length > 0) {
          requestBody.projectName = pathParts[0]; // 项目根目录名称
        }
        
        // 添加文件类型统计
        const extensions = {};
        files.forEach(file => {
          const ext = file.name.split('.').pop().toLowerCase();
          extensions[ext] = (extensions[ext] || 0) + 1;
        });
        
        requestBody.fileStats = {
          totalCount: files.length,
          extensions: extensions
        };
      }
      
      // 如果有完整的模型信息，添加相关字段
      if (modelInfo) {
        if (modelInfo.endpoint) {
          requestBody.aiEndpoint = modelInfo.endpoint;
        }
        
        if (modelInfo.provider) {
          requestBody.aiProvider = modelInfo.provider;
        }
        
        if (modelInfo.modelId) {
          requestBody.aiModelType = modelInfo.modelId;
        }
      }
      
      console.log('分析请求体:', {
        ...requestBody,
        apiKey: requestBody.apiKey ? `${requestBody.apiKey.substring(0, 5)}...（${requestBody.apiKey.length}字符）` : undefined,
        aiModelId: requestBody.aiModelId || '(使用默认)',
        aiProvider: requestBody.aiProvider || '(未指定)',
        aiModelType: requestBody.aiModelType || '(未指定)'
      });
      
      const startResponse = await fetchWithRetry(`${API_ANALYSIS_V1_URL}/${taskId}/start`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        // 使用JSON.stringify序列化请求体
        body: JSON.stringify(requestBody)
      });

      if (!startResponse.ok) {
        // 尝试读取错误详情
        try {
          const errorDetails = await startResponse.text();
          throw new Error(`开始分析失败: ${startResponse.status} ${startResponse.statusText} - ${errorDetails}`);
        } catch (readError) {
          throw new Error(`开始分析失败: ${startResponse.status} ${startResponse.statusText}`);
        }
      }

      const startData = await startResponse.json();
      console.log('开始分析成功:', startData);
      return startData;
    } catch (error) {
      console.error('启动分析失败:', error);
      throw error;
    }
  },

  // 获取分析进度
  async getAnalysisProgress(taskId) {
    try {
      const headers = await getAuthHeaders();
      
      try {
        // 尝试从API获取进度
        const progressResponse = await fetchWithRetry(`${API_ANALYSIS_V1_URL}/progress/${taskId}`, {
          method: 'GET',
          headers: headers
        });
  
        if (!progressResponse.ok) {
          const errorText = await progressResponse.text().catch(() => 'No error details');
          console.warn(`获取分析进度API返回错误: ${progressResponse.status} ${progressResponse.statusText}`, errorText);
          
          // 对于认证错误，返回一个特殊状态
          if (progressResponse.status === 401) {
            return {
              status: 'auth_error',
              progress: 0,
              message: '认证已过期，请重新登录',
              offline: true
            };
          }
          
          // 对于其他错误，尝试从本地恢复
          throw new Error(`获取分析进度失败: ${progressResponse.status} ${progressResponse.statusText}`);
        }
  
        // 解析并返回进度数据
        try {
          const progressData = await progressResponse.json();
          
          // 如果状态为失败，尝试获取具体错误原因
          if (progressData.status === 'failed') {
            console.warn('分析任务失败:', progressData);
            
            // 尝试获取更详细的错误信息
            try {
              const resultsResponse = await fetchWithRetry(`${API_ANALYSIS_V1_URL}/results/${taskId}`, {
                method: 'GET',
                headers: headers
              });
              
              if (resultsResponse.ok) {
                const resultsData = await resultsResponse.json();
                if (resultsData && resultsData.error) {
                  console.log('从结果中获取到错误信息:', resultsData.error);
                  progressData.message = resultsData.error;
                  progressData.errorDetails = resultsData;
                }
              }
            } catch (resultError) {
              console.warn('获取失败结果详情失败:', resultError);
            }
            
            // 如果消息中包含"未找到可用的AI模型"，提供更具体的错误信息
            if (progressData.message && progressData.message.includes('未找到可用的AI模型')) {
              progressData.message = '未找到可用的AI模型，请确保已配置AI模型并保存API密钥';
              progressData.aiModelError = true;
              
              // 检查本地是否有可用的模型信息
              try {
                const aiModelsStr = localStorage.getItem('aiModels');
                const backupModelsStr = localStorage.getItem('aiModelsBackup');
                
                if ((!aiModelsStr || aiModelsStr === '[]') && (!backupModelsStr || backupModelsStr === '[]')) {
                  progressData.message += '。未在本地找到任何已保存的模型配置。';
                } else {
                  progressData.message += '。本地已有模型配置，但可能未正确传递给后端或API密钥无效。';
                }
              } catch (e) {}
            }
          }
          
          return progressData;
        } catch (parseError) {
          console.error('解析进度响应失败:', parseError);
          throw new Error(`解析进度响应失败: ${parseError.message}`);
        }
      } catch (apiError) {
        // API调用失败，尝试从本地获取进度信息
        console.warn('从API获取进度失败，尝试本地进度恢复:', apiError);
        
        // 尝试从localStorage读取可能存在的进度信息
        try {
          const localProgress = localStorage.getItem(`analysis_progress_${taskId}`);
          if (localProgress) {
            const parsedProgress = JSON.parse(localProgress);
            parsedProgress.offline = true; // 标记为离线数据
            return parsedProgress;
          }
        } catch (localError) {
          console.warn('读取本地进度失败:', localError);
        }
        
        // 如果没有本地进度，模拟一个进行中的状态
        return {
          status: 'processing',
          progress: 30, // 假设30%进度
          message: '正在本地分析中(API连接异常)',
          offline: true
        };
      }
    } catch (error) {
      console.error('获取分析进度失败:', error);
      
      // 返回一个安全的响应，不抛出异常
      return {
        status: 'error',
        progress: 0,
        message: error.message || '未知错误',
        error: true
      };
    }
  },

  // 获取分析结果
  async getAnalysisResults(taskId) {
    console.log(`正在获取分析结果，任务ID: ${taskId}`);
    
    try {
      const token = localStorage.getItem('token');
      // 准备请求头
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('获取分析结果时没有找到认证令牌，可能无法获取结果');
      }
      
      // 显示请求信息
      console.log(`请求URL: ${import.meta.env.VITE_API_BASE_URL}/v1/code-analysis/results/${taskId}`);
      console.log('认证头: ', token ? '已设置' : '未设置');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/code-analysis/results/${taskId}`, {
        method: 'GET',
        headers: headers
      });
      
      // 记录响应状态
      console.log(`获取分析结果API响应状态: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`获取分析结果失败，HTTP状态: ${response.status}，错误信息: ${errorText}`);
        
        // 检查是否是认证问题
        if (response.status === 401) {
          console.error('认证已过期或无效，需要重新登录');
          return {
            error: true, 
            status: response.status,
            message: '认证已过期，请重新登录'
          };
        }
        
        // 其他错误
        return {
          error: true,
          status: response.status,
          message: `获取分析结果失败: ${errorText || response.statusText}`
        };
      }
      
      // 成功获取响应
      const data = await response.json();
      
      // 检查响应大小和内容
      console.log(`分析结果响应大小: 约${JSON.stringify(data).length / 1024}KB`);
      console.log('服务器返回结果预览:', 
                  JSON.stringify(data).substring(0, 200) + 
                  (JSON.stringify(data).length > 200 ? '...(截断)' : ''));
      
      // 检查结果中是否包含AI结果
      if (data && data.aiResults) {
        console.log('AI分析结果已获取，包含数据:', Object.keys(data.aiResults).join(', '));
      } else {
        console.warn('返回的数据中没有找到AI分析结果，可能是接口格式不匹配或分析尚未完成');
      }
      
      return data;
    } catch (error) {
      console.error('获取分析结果过程中发生错误:', error);
      return {
        error: true,
        message: `获取分析结果失败: ${error.message}`,
        details: error.stack
      };
    }
  },

  // 检查结果中是否包含AI分析结果
  checkForAiResults(data) {
    const result = {
      has: false,
      location: null
    };
    
    // 检查常见的AI结果位置
    if (data.aiResults || data.aiAnalysis) {
      result.has = true;
      result.location = data.aiResults ? 'aiResults' : 'aiAnalysis';
      return result;
    }
    
    // 检查嵌套结构
    if (data.results) {
      if (data.results.aiResults || data.results.aiAnalysis) {
        result.has = true;
        result.location = 'results.' + (data.results.aiResults ? 'aiResults' : 'aiAnalysis');
        return result;
      }
      
      // 检查代码质量中的AI结果
      if (data.results.codeQuality && data.results.codeQuality.aiComments) {
        result.has = true;
        result.location = 'results.codeQuality.aiComments';
        return result;
      }
    }
    
    // 检查文件结果中的AI注释
    if (data.fileResults) {
      for (let i = 0; i < data.fileResults.length; i++) {
        const file = data.fileResults[i];
        if (file.aiComments || file.aiAnalysis) {
          result.has = true;
          result.location = `fileResults[${i}].${file.aiComments ? 'aiComments' : 'aiAnalysis'}`;
          return result;
        }
        
        // 检查问题中的AI注释
        if (file.issues) {
          for (let j = 0; j < file.issues.length; j++) {
            const issue = file.issues[j];
            if (issue.aiSuggestion || issue.aiComment) {
              result.has = true;
              result.location = `fileResults[${i}].issues[${j}].${issue.aiSuggestion ? 'aiSuggestion' : 'aiComment'}`;
              return result;
            }
          }
        }
      }
    }
    
    return result;
  },

  // 辅助方法：将各种结果格式标准化
  standardizeResults(data) {
    console.log('标准化结果数据');
    
    // 创建标准结构
    const standardized = {
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
    };
    
    // 检查常见的结果格式
    if (data.results) {
      console.log('检测到结果包含results字段');
      standardized.results = data.results;
      
      // 如果还有嵌套数据，确保它们也被复制
      if (data.fileResults) {
        standardized.fileResults = [...data.fileResults];
      }
      
      if (data.summary) {
        standardized.summary = {...standardized.summary, ...data.summary};
      }
    } 
    // 检查API响应格式（常见的code/data格式）
    else if (data.code !== undefined && (data.data || data.message)) {
      console.log('检测到API响应格式');
      
      if (data.data && typeof data.data === 'object') {
        // 如果data对象中有results或analysis字段，使用它
        if (data.data.results || data.data.analysis) {
          standardized.results = data.data.results || data.data.analysis;
        } else {
          // 否则使用整个data对象
          standardized.results = data.data;
        }
        
        // 如果有文件结果，复制它们
        if (data.data.fileResults) {
          standardized.fileResults = [...data.data.fileResults];
        }
        
        // 如果有摘要，复制它
        if (data.data.summary) {
          standardized.summary = {...standardized.summary, ...data.data.summary};
        }
      } else {
        // 只有消息，没有结构化数据
        standardized.results = {
          message: data.message || '服务器返回了结果，但没有详细数据'
        };
      }
    }
    // 检查直接包含分析结果的格式
    else if (data.codeQuality || data.security || data.performance) {
      console.log('检测到直接包含分析结果的格式');
      standardized.results = data;
      
      // 如果有文件结果，复制它们
      if (data.fileResults) {
        standardized.fileResults = [...data.fileResults];
      }
      
      // 如果有摘要，复制它
      if (data.summary) {
        standardized.summary = {...standardized.summary, ...data.summary};
      }
    }
    // 检查只包含fileResults的格式
    else if (data.fileResults && Array.isArray(data.fileResults)) {
      console.log('检测到只包含fileResults的格式');
      standardized.fileResults = [...data.fileResults];
      
      // 可能是只有文件结果没有其他数据的情况
      standardized.results = { onlyFileResults: true };
    }
    // 检查是否是数组格式
    else if (Array.isArray(data)) {
      console.log('检测到数组格式');
      
      // 先检查是不是文件结果数组
      if (data.length > 0 && typeof data[0] === 'object' && (data[0].fileName || data[0].issues)) {
        console.log('检测到数组是文件结果列表');
        standardized.fileResults = [...data];
        standardized.results = { arrayOfFiles: true };
      }
      // 检查是否是问题列表
      else if (data.length > 0 && typeof data[0] === 'object' && (data[0].message || data[0].severity)) {
        console.log('检测到数组是问题列表');
        
        // 构建一个虚拟的codeQuality结构
        standardized.results = {
          codeQuality: {
            issues: [...data]
          }
        };
        
        // 尝试按文件名分组
        this.groupIssuesByFile(data, standardized);
      }
      // 无法识别的数组格式
      else {
        console.warn('无法识别的数组格式');
        standardized.results = { rawArray: data };
      }
    }
    // 其他未知格式
    else {
      console.warn('未识别的结果格式');
      standardized.results = {...data, unknownFormat: true};
    }
    
    // 如果没有文件结果但有codeQuality.issues，尝试构建fileResults
    if (standardized.fileResults.length === 0 && 
        standardized.results && 
        standardized.results.codeQuality && 
        standardized.results.codeQuality.issues) {
      console.log('从codeQuality.issues构建fileResults');
      
      this.groupIssuesByFile(standardized.results.codeQuality.issues, standardized);
    }
    
    // 如果仍然没有fileResults，创建一个空的兼容结构
    if (standardized.fileResults.length === 0) {
      console.log('创建空的fileResults结构');
      
      // 尝试从results中提取任何可能的问题
      const syntheticIssues = this.extractIssuesFromResults(standardized.results);
      
      if (syntheticIssues.length > 0) {
        console.log(`提取了 ${syntheticIssues.length} 个问题`);
        standardized.fileResults = [{
          fileName: '合成结果',
          issues: syntheticIssues,
          score: this.calculateFileScore(syntheticIssues),
          language: '未知'
        }];
      } else {
        standardized.fileResults = [{
          fileName: '未找到文件结果',
          issues: [],
          score: 0,
          language: '未知'
        }];
      }
    }
    
    // 确保每个文件记录都有必要的字段
    standardized.fileResults = standardized.fileResults.map(file => {
      return {
        fileName: file.fileName || '未命名文件',
        issues: Array.isArray(file.issues) ? file.issues : [],
        score: file.score !== undefined ? file.score : this.calculateFileScore(file.issues || []),
        language: file.language || this.guessLanguageFromFileName(file.fileName || '')
      };
    });
    
    // 更新summary信息
    this.updateSummaryInformation(standardized);
    
    return standardized;
  },
  
  // 根据文件名分组问题
  groupIssuesByFile(issues, standardized) {
    const issuesByFile = {};
    
    issues.forEach(issue => {
      // 确保每个问题都有文件名
      const fileName = issue.fileName || '未知文件';
      
      if (!issuesByFile[fileName]) {
        issuesByFile[fileName] = [];
      }
      
      issuesByFile[fileName].push(issue);
    });
    
    // 构建fileResults数组
    standardized.fileResults = Object.entries(issuesByFile).map(([fileName, fileIssues]) => {
      return {
        fileName,
        issues: fileIssues,
        score: this.calculateFileScore(fileIssues),
        language: this.guessLanguageFromFileName(fileName)
      };
    });
  },
  
  // 从结果中提取问题
  extractIssuesFromResults(results, path = '') {
    let issues = [];
    
    if (!results || typeof results !== 'object') return issues;
    
    // 递归查找任何可能的问题
    if (Array.isArray(results)) {
      if (results.length > 0 && typeof results[0] === 'object') {
        // 检查是否是问题数组
        if (results[0].message || results[0].severity || results[0].rule) {
          console.log(`在 ${path} 发现可能的问题数组`);
          return [...results];
        }
        
        // 递归检查数组中的每个元素
        results.forEach((item, index) => {
          const foundIssues = this.extractIssuesFromResults(item, `${path}[${index}]`);
          issues = [...issues, ...foundIssues];
        });
      }
    } else {
      // 检查当前对象是否像问题
      if (results.message && (results.severity || results.level)) {
        return [results];
      }
      
      // 递归检查对象的每个属性
      Object.keys(results).forEach(key => {
        const foundIssues = this.extractIssuesFromResults(
          results[key], 
          path ? `${path}.${key}` : key
        );
        issues = [...issues, ...foundIssues];
      });
    }
    
    return issues;
  },
  
  // 计算文件得分
  calculateFileScore(issues) {
    if (!issues || !Array.isArray(issues) || issues.length === 0) return 100;
    
    // 计算各种严重性级别的问题数量
    const criticalCount = issues.filter(
      i => i.severity === 'critical' || i.severity === 'high' || i.severity === 'error'
    ).length;
    
    const majorCount = issues.filter(
      i => i.severity === 'major' || i.severity === 'medium' || i.severity === 'warning'
    ).length;
    
    const minorCount = issues.filter(
      i => i.severity === 'minor' || i.severity === 'low' || i.severity === 'info'
    ).length;
    
    // 简单评分算法：满分100，每个严重问题-15，每个重要问题-5，每个次要问题-1
    let score = 100 - (criticalCount * 15) - (majorCount * 5) - (minorCount * 1);
    
    // 确保分数在0-100范围内
    return Math.max(0, Math.min(100, score));
  },
  
  // 根据文件名猜测语言
  guessLanguageFromFileName(fileName) {
    if (!fileName) return '未知';
    
    const ext = fileName.split('.').pop().toLowerCase();
    
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
      'h': 'C/C++ Header',
      'hpp': 'C++ Header',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'vue': 'Vue',
      'json': 'JSON',
      'md': 'Markdown',
      'sql': 'SQL'
    };
    
    return langMap[ext] || '未知';
  },
  
  // 更新摘要信息
  updateSummaryInformation(standardized) {
    // 文件数量
    if (!standardized.summary.totalFiles || standardized.summary.totalFiles === 0) {
      standardized.summary.totalFiles = standardized.fileResults.length;
    }
    
    // 计算问题总数和各种严重性级别的问题数量
    let totalIssues = 0;
    let criticalIssues = 0;
    let majorIssues = 0;
    let minorIssues = 0;
    
    standardized.fileResults.forEach(file => {
      if (Array.isArray(file.issues)) {
        totalIssues += file.issues.length;
        
        criticalIssues += file.issues.filter(
          i => i.severity === 'critical' || i.severity === 'high' || i.severity === 'error'
        ).length;
        
        majorIssues += file.issues.filter(
          i => i.severity === 'major' || i.severity === 'medium' || i.severity === 'warning'
        ).length;
        
        minorIssues += file.issues.filter(
          i => i.severity === 'minor' || i.severity === 'low' || i.severity === 'info'
        ).length;
      }
    });
    
    // 更新统计信息
    if (!standardized.summary.totalIssues || standardized.summary.totalIssues === 0) {
      standardized.summary.totalIssues = totalIssues;
    }
    
    if (!standardized.summary.criticalIssues || standardized.summary.criticalIssues === 0) {
      standardized.summary.criticalIssues = criticalIssues;
    }
    
    if (!standardized.summary.majorIssues || standardized.summary.majorIssues === 0) {
      standardized.summary.majorIssues = majorIssues;
    }
    
    if (!standardized.summary.minorIssues || standardized.summary.minorIssues === 0) {
      standardized.summary.minorIssues = minorIssues;
    }
    
    // 计算代码质量得分
    if (!standardized.summary.codeQualityScore || standardized.summary.codeQualityScore === 0) {
      if (standardized.fileResults.length > 0) {
        const scores = standardized.fileResults.map(file => file.score || 0);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        standardized.summary.codeQualityScore = Math.round(avgScore);
      } else {
        standardized.summary.codeQualityScore = 0;
      }
    }
  },

  // 获取分析历史
  async getAnalysisHistory() {
    console.log('获取分析历史...');
    try {
      const headers = await getAuthHeaders();
      
      const historyResponse = await fetchWithRetry(`${API_ANALYSIS_V1_URL}/history`, {
        method: 'GET',
        headers: headers
      });

      if (!historyResponse.ok) {
        throw new Error(`获取分析历史失败: ${historyResponse.status} ${historyResponse.statusText}`);
      }

      const historyData = await historyResponse.json();
      console.log('获取分析历史成功:', historyData);
      return historyData;
    } catch (error) {
      console.error('获取分析历史失败:', error);
      throw error;
    }
  },
  
  // 使用规则分析代码
  analyzeWithRules(fileContents) {
    console.log('使用规则分析代码...');
    
    // 获取规则
    const rules = this.getDefaultRules();
    
    // 分析结果
    const results = {
      summary: {
        totalFiles: fileContents.length,
        totalIssues: 0,
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 0,
        codeQualityScore: 0
      },
      fileResults: []
    };
    
    // 对每个文件应用规则
    fileContents.forEach(fileContent => {
      const fileName = fileContent.name;
      const content = fileContent.content;
      const language = fileContent.language;
      
      // 跳过不支持的文件类型
      if (!language || language === 'Unknown') return;
      
      console.log(`分析文件: ${fileName}, 语言: ${language}`);
      
      // 应用规则
      const issues = [];
      
      // 获取适用于该语言的规则
      const applicableRules = rules.filter(rule => 
        rule.languages.includes('all') || rule.languages.includes(language)
      );
      
      // 对文件内容应用每条规则
      applicableRules.forEach(rule => {
        try {
          // 将内容分割成行
          const lines = content.split('\n');
          
          // 对每一行应用规则
          lines.forEach((line, lineIndex) => {
            // 使用正则表达式检查
            if (rule.pattern && new RegExp(rule.pattern, 'i').test(line)) {
              issues.push({
                id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ruleId: rule.id,
                severity: rule.severity,
                message: rule.message,
                lineNumber: lineIndex + 1,
                column: line.search(new RegExp(rule.pattern, 'i')) + 1,
                source: line.trim()
              });
            }
            
            // 使用关键词检查
            if (rule.keywords && rule.keywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))) {
              issues.push({
                id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ruleId: rule.id,
                severity: rule.severity,
                message: rule.message,
                lineNumber: lineIndex + 1,
                column: 1,
                source: line.trim()
              });
            }
          });
          
          // 对整个文件内容应用规则
          if (rule.filePattern && new RegExp(rule.filePattern, 'i').test(content)) {
            issues.push({
              id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              ruleId: rule.id,
              severity: rule.severity,
              message: rule.message,
              lineNumber: 1,
              column: 1,
              source: '整个文件'
            });
          }
        } catch (error) {
          console.error(`应用规则 ${rule.id} 失败:`, error);
        }
      });
      
      // 计算文件得分 (0-100)
      const fileScore = Math.max(0, 100 - issues.length * 5);
      
      // 添加文件结果
      results.fileResults.push({
        fileName: fileName,
        language: language,
        issues: issues,
        score: fileScore,
        summary: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          majorIssues: issues.filter(i => i.severity === 'major').length,
          minorIssues: issues.filter(i => i.severity === 'minor').length
        }
      });
      
      // 更新总结
      results.summary.totalIssues += issues.length;
      results.summary.criticalIssues += issues.filter(i => i.severity === 'critical').length;
      results.summary.majorIssues += issues.filter(i => i.severity === 'major').length;
      results.summary.minorIssues += issues.filter(i => i.severity === 'minor').length;
    });
    
    // 计算总体得分
    if (results.fileResults.length > 0) {
      results.summary.codeQualityScore = Math.round(
        results.fileResults.reduce((sum, file) => sum + file.score, 0) / results.fileResults.length
      );
    }
    
    console.log('规则分析完成，发现问题数:', results.summary.totalIssues);
    return results;
  },

  // 获取默认规则
  getDefaultRules() {
    return [
      { 
        id: 'security-1', 
        severity: 'critical', 
        message: '发现潜在的SQL注入漏洞', 
        pattern: '(\\w+\\s*=\\s*[\\\'\\\"])\\s*\\+\\s*\\w+|\\w+\\.execute\\(.*\\+.*\\)',
        languages: ['JavaScript', 'Java', 'PHP', 'Python'],
        description: '代码中可能存在SQL注入漏洞，请使用参数化查询'
      }, 
      { 
        id: 'security-2', 
        severity: 'critical', 
        message: '使用了eval函数，存在安全风险', 
        keywords: ['eval(', 'eval ('],
        languages: ['JavaScript', 'PHP', 'Python'],
        description: '避免使用eval函数，它可能导致代码注入攻击'
      }, 
      { 
        id: 'security-3', 
        severity: 'critical', 
        message: '发现硬编码的密码或密钥', 
        pattern: '(password|secret|key|token)\\s*=\\s*[\\\'\\"][^\\\'\\"]+[\\\'\\"]',
        languages: ['all'],
        description: '避免在代码中硬编码敏感信息'
      }, 
      { 
        id: 'performance-1', 
        severity: 'major', 
        message: '检测到可能的内存泄漏', 
        pattern: 'new\\s+\\w+\\(.*\\)(?!.*=)',
        languages: ['JavaScript', 'Java', 'C++', 'C#'],
        description: '创建对象后未赋值给变量，可能导致内存泄漏'
      }, 
      { 
        id: 'performance-2', 
        severity: 'major', 
        message: '在循环中创建函数，可能影响性能', 
        pattern: 'for\\s*\\(.*\\)\\s*\\{[^\\}]*function',
        languages: ['JavaScript'],
        description: '避免在循环中创建函数，这会影响性能'
      }, 
      { 
        id: 'quality-1', 
        severity: 'minor', 
        message: '函数过长，建议拆分', 
        filePattern: '(function|def|public|private)\\s+\\w+\\s*\\([^\\)]*\\)\\s*\\{[\\s\\S]{500,}?\\}',
        languages: ['all'],
        description: '函数过长，建议拆分为更小的函数以提高可读性和可维护性'
      }, 
      { 
        id: 'quality-2', 
        severity: 'minor', 
        message: '变量命名不规范', 
        pattern: '\\b[a-z]{1,2}\\b\\s*=',
        languages: ['all'],
        description: '变量名过短或不具描述性，建议使用更有意义的名称'
      }, 
      { 
        id: 'quality-3', 
        severity: 'minor', 
        message: '注释不足', 
        filePattern: '^(?:(?!\\/\\/|\\*|\\/\\*|#).)*$',
        languages: ['all'],
        description: '代码缺少注释，建议添加适当的注释以提高可读性'
      }, 
      { 
        id: 'quality-4', 
        severity: 'major', 
        message: '存在TODO注释', 
        keywords: ['TODO', 'FIXME', 'XXX'],
        languages: ['all'],
        description: '代码中存在TODO注释，表明有未完成的工作'
      }, 
      { 
        id: 'quality-5', 
        severity: 'major', 
        message: '代码复杂度过高', 
        pattern: '(if|for|while|switch)\\s*\\([^\\)]*\\)\\s*\\{[\\s\\S]*?(if|for|while|switch)\\s*\\([^\\)]*\\)\\s*\\{[\\s\\S]*?(if|for|while|switch)',
        languages: ['all'],
        description: '代码嵌套层次过多，复杂度高，建议重构'
      }
    ];
  },
  
  // 根据文件扩展名获取语言
  getLanguageFromExtension(extension) {
    const languageMap = {
      'js': 'JavaScript',
      'jsx': 'JavaScript (React)',
      'ts': 'TypeScript',
      'tsx': 'TypeScript (React)',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'less': 'LESS',
      'json': 'JSON',
      'md': 'Markdown',
      'py': 'Python',
      'java': 'Java',
      'go': 'Go',
      'c': 'C',
      'cpp': 'C++',
      'h': 'C/C++ Header',
      'hpp': 'C++ Header',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'rs': 'Rust',
      'sql': 'SQL'
    };
    
    return languageMap[extension.toLowerCase()] || 'Unknown';
  },

  // 清理测试数据（删除后端存储的用户测试数据）
  async cleanupTestData() {
    console.log('清理测试数据...');
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetchWithRetry(`${API_ANALYSIS_V1_URL}/cleanup`, {
        method: 'DELETE',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`清理测试数据失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('清理测试数据成功:', result);
      return result;
    } catch (error) {
      console.error('清理测试数据失败:', error);
      throw error;
    }
  },

  // 创建分析任务
  async createAnalysisTask(type = 'file') {
    console.log('创建分析任务, 类型:', type);
    try {
      const headers = await getAuthHeaders();
      
      const requestData = {
        type: type // 'file' 或 'project'
      };
      
      const response = await fetch(`${API_ANALYSIS_V1_URL}/create`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`创建分析任务失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('分析任务创建成功:', data);
      
      return {
        taskId: data.taskId || `local_${Date.now()}`,
        message: data.message || '任务创建成功',
        type: type
      };
    } catch (error) {
      console.error('创建分析任务失败:', error);
      
      // 如果API调用失败，创建本地任务ID
      return {
        taskId: `local_${Date.now()}`,
        message: '使用本地模式创建任务',
        type: type,
        offline: true
      };
    }
  },
};

export default analysisService; 