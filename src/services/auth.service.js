import axios from 'axios';
import storageService from './storage.service';
import errorHandler from '../utils/errorHandler';

// 使用环境变量或默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_URL = `${API_BASE_URL}/v1`;

// 创建axios实例
const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允许跨域请求携带cookie
  timeout: 10000, // 增加超时时间
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 添加请求拦截器，用于添加认证令牌
authApi.interceptors.request.use(
  config => {
    // 添加认证令牌
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 只在开发环境记录请求信息，且不记录敏感数据
    if (import.meta.env.DEV) {
      const safeData = config.data ? { ...config.data } : {};
      // 移除密码等敏感字段
      if (safeData.password) safeData.password = '[HIDDEN]';
      if (safeData.currentPassword) safeData.currentPassword = '[HIDDEN]';
      if (safeData.newPassword) safeData.newPassword = '[HIDDEN]';
      
      console.log(`${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  error => {
    const processedError = errorHandler.handleError(error, { logToConsole: true });
    return Promise.reject(processedError);
  }
);

// 添加响应拦截器，用于处理认证错误
authApi.interceptors.response.use(
  response => response,
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 如果页面不是登录页，重定向到登录页
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
      }
    }
    
    const processedError = errorHandler.handleError(error);
    return Promise.reject(processedError);
  }
);

// 获取认证头
const getAuthHeaders = () => {
  const token = storageService.getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * 用户注册
 * @param {string} username 用户名
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @returns {Promise} 注册结果
 */
const register = async (username, email, password) => {
  try {
    const response = await authApi.post('/auth/register', { username, email, password });
    
    // 保存token到本地存储
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    const processedError = errorHandler.handleError(error);
    throw processedError;
  }
};

/**
 * 用户登录
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @returns {Promise} 登录结果
 */
const login = async (email, password) => {
  try {
    const response = await authApi.post('/auth/login', { email, password });
    
    // 保存token到本地存储
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    // 直接返回响应数据，不做转换
    return response.data;
  } catch (error) {
    const processedError = errorHandler.handleError(error);
    throw processedError;
  }
};

/**
 * 用户登出
 * @returns {Promise} 登出结果
 */
const logout = async () => {
  try {
    // 尝试调用登出接口
    await authApi.post('/auth/logout');
    
    // 无论成功与否，清除本地存储的认证信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return { success: true };
  } catch (error) {
    // 即使调用API失败，也清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 不需要抛出错误，因为已经完成了本地登出
    return { success: true };
  }
};

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} 返回用户信息
 */
const getCurrentUser = async () => {
  console.log('正在获取当前用户信息...');
  try {
    const response = await authApi.get('/user/profile', {
      timeout: 10000,
      validateStatus: (status) => status < 500 // 只有状态码大于等于500的才会被视为错误
    });
    
    // 检查响应状态并增强调试信息
    if (response.status !== 200) {
      console.warn(`获取用户资料返回非200状态: ${response.status}, 响应数据:`, response.data);
      
      // 尝试从本地获取用户信息作为备份
      const localUserStr = localStorage.getItem('user');
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          console.log('使用本地存储的用户信息作为备份');
          return {
            status: 200,
            data: localUser,
            source: 'local_backup'
          };
        } catch (parseError) {
          console.error('解析本地用户数据失败:', parseError);
        }
      }
      
      // 如果本地也没有数据，返回一个默认的匿名用户对象
      return {
        status: 200,
        data: {
          id: 'anonymous',
          username: '访客用户',
          role: 'anonymous',
          isAnonymous: true
        },
        source: 'fallback'
      };
    }
    
    console.log('成功获取用户信息');
    return response;
  } catch (error) {
    console.warn('获取用户信息发生错误:', error);
    
    // 自定义处理网络错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('获取用户资料请求超时');
      
      // 尝试从本地获取用户信息
      try {
        const localUserStr = localStorage.getItem('user');
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr);
          console.log('请求超时，使用本地存储的用户信息继续');
          return {
            status: 200,
            data: localUser,
            source: 'local_timeout'
          };
        }
      } catch (localError) {
        console.error('读取本地用户数据失败:', localError);
      }
      
      // 返回默认匿名用户
      return {
        status: 200,
        data: {
          id: 'anonymous',
          username: '访客用户(网络超时)',
          role: 'anonymous',
          isAnonymous: true,
          networkTimeout: true
        },
        source: 'timeout_fallback'
      };
    }
    
    if (error.message && error.message.includes('Network Error')) {
      console.warn('网络连接错误');
      
      // 尝试从本地获取用户信息
      try {
        const localUserStr = localStorage.getItem('user');
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr);
          console.log('网络错误，使用本地存储的用户信息继续');
          return {
            status: 200,
            data: localUser,
            source: 'local_network_error'
          };
        }
      } catch (localError) {
        console.error('读取本地用户数据失败:', localError);
      }
      
      // 返回默认匿名用户
      return {
        status: 200,
        data: {
          id: 'anonymous',
          username: '访客用户(网络错误)',
          role: 'anonymous',
          isAnonymous: true,
          networkError: true
        },
        source: 'network_error_fallback'
      };
    }
    
    // 处理404错误 - 如果服务器找不到用户
    if (error.response && error.response.status === 404) {
      console.warn('服务器未找到用户资料');
      return {
        status: 200,
        data: {
          id: 'anonymous',
          username: '访客用户(未找到)',
          role: 'anonymous',
          isAnonymous: true,
          notFound: true
        },
        source: 'not_found_fallback'
      };
    }
    
    // 处理401权限错误 - 如果令牌已过期或无效
    if (error.response && error.response.status === 401) {
      console.warn('认证令牌已过期或无效');
      // 清除无效令牌
      localStorage.removeItem('token');
      
      return {
        status: 200,
        data: {
          id: 'anonymous',
          username: '访客用户(请重新登录)',
          role: 'anonymous',
          isAnonymous: true,
          tokenExpired: true
        },
        source: 'unauthorized_fallback'
      };
    }
    
    // 对于任何其他未处理的错误，也返回一个默认用户对象
    console.error('未能处理的错误:', error);
    return {
      status: 200,
      data: {
        id: 'anonymous',
        username: '访客用户(未知错误)',
        role: 'anonymous',
        isAnonymous: true,
        unknownError: true
      },
      source: 'unknown_error_fallback'
    };
  }
};

/**
 * 更新用户资料
 * @param {Object} profileData 用户资料数据
 * @returns {Promise} 更新结果
 */
const updateProfile = async (profileData) => {
  try {
    const response = await authApi.put('/user/profile', profileData);
    
    // 如果更新成功，同时更新本地存储的用户信息
    if (response.data && response.data.user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const updatedUser = { ...user, ...response.data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('更新本地用户数据失败:', error);
        }
      }
    }
    
    return response.data;
  } catch (error) {
    const processedError = errorHandler.handleError(error);
    throw processedError;
  }
};

/**
 * 修改密码
 * @param {string} currentPassword 当前密码
 * @param {string} newPassword 新密码
 * @returns {Promise} 修改结果
 */
const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await authApi.put('/user/password', {
      currentPassword,
      newPassword
    });
    
    return response.data;
  } catch (error) {
    const processedError = errorHandler.handleError(error);
    throw processedError;
  }
};

/**
 * 请求重置密码
 * @param {string} email 注册邮箱
 * @returns {Promise} 请求结果
 */
const requestPasswordReset = async (email) => {
  try {
    const response = await authApi.post('/password-reset', { email });
    return response.data;
  } catch (error) {
    const processedError = errorHandler.handleError(error);
    throw processedError;
  }
};

/**
 * 获取认证令牌
 * @returns {string|null} 令牌
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * 刷新令牌
 * @returns {Promise} 新的令牌
 */
const refreshToken = async () => {
  try {
    const response = await authApi.post('/auth/refresh');
    
    // 更新本地存储的token
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    const processedError = errorHandler.handleError(error);
    throw processedError;
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  getAuthToken,
  refreshToken
}; 