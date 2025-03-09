// API服务
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 获取认证token
function getAuthHeaders() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('未找到认证令牌，请求可能会失败');
      return {};
    }
    
    // 验证token格式
    if (typeof token !== 'string' || token.length < 10) {
      console.warn(`令牌格式无效: ${typeof token}, 长度: ${token ? token.length : 0}`);
      return {};
    }
    
    console.log('已设置认证令牌，长度:', token.length);
    return { 'Authorization': `Bearer ${token}` };
  } catch (error) {
    console.error('获取认证头时出错:', error);
    return {};
  }
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

// API服务
const apiService = {
  // 获取AI模型列表
  async getAIModels() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/ai/models`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 创建AI模型
  async createAIModel(model) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/ai/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(model)
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 更新AI模型
  async updateAIModel(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/ai/models/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updates)
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 删除AI模型
  async deleteAIModel(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/ai/models/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 直接测试AI模型连接
  async testAIModelConnection(modelData) {
    try {
      // 如果传入的是ID字符串而不是对象，尝试转换
      let testPayload = typeof modelData === 'string' 
        ? { id: modelData } 
        : modelData;
        
      console.log('测试AI模型连接:', {
        ...testPayload,
        apiKey: testPayload.apiKey ? '******' : undefined
      });
      
      // 如果是DeepSeek模型，使用直接调用方式测试
      if (testPayload.provider === 'deepseek' || 
          (testPayload.id && testPayload.id.includes('deepseek'))) {
        try {
          const endpoint = testPayload.endpoint || 'https://api.deepseek.com';
          
          // 确保使用有效的DeepSeek模型ID
          let modelId = testPayload.modelId || 'deepseek-chat';
          
          // 修正无效的模型ID
          if (!modelId.startsWith('deepseek-') && modelId.startsWith('model-')) {
            console.warn(`检测到无效的DeepSeek模型ID: ${modelId}，将使用默认模型ID: deepseek-chat`);
            modelId = 'deepseek-chat';
          }
          
          // 有效的DeepSeek模型列表
          const validDeepSeekModels = ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'];
          if (!validDeepSeekModels.includes(modelId)) {
            console.warn(`不常见的DeepSeek模型ID: ${modelId}，可能导致API调用失败`);
          }
          
          // 检查API密钥是否存在
          if (!testPayload.apiKey) {
            console.error('未提供DeepSeek API密钥');
            return {
              success: false,
              message: 'DeepSeek API连接失败: 未提供API密钥'
            };
          }
          
          console.log(`尝试直接连接DeepSeek API: ${endpoint}，模型ID: ${modelId}`);
          
          // 直接调用DeepSeek API测试连接
          try {
            const response = await fetch(`${endpoint}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${testPayload.apiKey}`
              },
              body: JSON.stringify({
                model: modelId,
                messages: [
                  {role: "system", content: "You are a helpful assistant."},
                  {role: "user", content: "Hello! This is a connection test."}
                ],
                max_tokens: 5
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('DeepSeek API测试成功:', data);
              return {
                success: true,
                message: 'DeepSeek API连接成功!'
              };
            } else {
              let errorMessage = '未知错误';
              try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorData.message || response.statusText;
                console.error('DeepSeek API响应错误:', errorData);
              } catch (jsonError) {
                errorMessage = `HTTP错误: ${response.status} ${response.statusText}`;
                console.error('DeepSeek API响应无法解析为JSON:', jsonError);
              }
              
              return {
                success: false,
                message: `DeepSeek API连接失败: ${errorMessage}`
              };
            }
          } catch (networkError) {
            console.error('DeepSeek API网络错误:', networkError);
            return {
              success: false,
              message: `无法连接到DeepSeek API: ${networkError.message}`
            };
          }
        } catch (deepseekError) {
          console.error('DeepSeek API连接错误:', deepseekError);
          return {
            success: false,
            message: `DeepSeek API连接错误: ${deepseekError.message}`
          };
        }
      }
      
      // 默认使用后端API测试
      try {
        const response = await fetch(`${API_BASE_URL}/v1/ai/models/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(testPayload)
        });
        
        return await handleApiResponse(response);
      } catch (apiError) {
        console.error('API服务器测试失败:', apiError);
        return {
          success: false,
          message: `服务器API测试失败: ${apiError.message}`
        };
      }
    } catch (error) {
      console.error('测试AI模型连接失败:', error);
      return {
        success: false,
        message: `连接测试失败: ${error.message}`
      };
    }
  },
  
  // 获取规则列表
  async getRules() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/rules`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 创建规则
  async createRule(rule) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(rule)
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 更新规则
  async updateRule(id, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updates)
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 删除规则
  async deleteRule(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/rules/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 测试规则
  async testRule(id, code) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/rules/${id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ code })
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 创建分析
  async createAnalysis(codeSnippet, language, ruleIds = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/code-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          codeSnippet,
          language,
          ruleIds
        })
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 获取分析结果
  async getAnalysis(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/code-analysis/${id}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 获取用户分析列表
  async getUserAnalyses() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/code-analysis`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  },
  
  // 删除分析
  async deleteAnalysis(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/code-analysis/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      throw error;
    }
  }
};

export default apiService; 