import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const lastChecked = ref(0); // 上次检查认证状态的时间戳

  // 计算属性
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  // 方法
  const register = async (username, email, password) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.register(username, email, password);
      user.value = response.data;
      // 保存用户信息到本地存储
      localStorage.setItem('user', JSON.stringify(response.data));
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = async (usernameOrEmail, password) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authService.login(usernameOrEmail, password);
      
      if (response && response.user) {
        // 获取用户数据
        const userData = response.user;
        
        // 确保用户有username字段
        if (!userData.username && userData.email) {
          userData.username = userData.email.split('@')[0];
        }
        
        user.value = userData;
        // 保存用户信息到本地存储
        localStorage.setItem('user', JSON.stringify(userData));
        
        // 确保状态更新
        lastChecked.value = Date.now();
      } else {
        // 响应中没有用户数据，记录错误
        error.value = "服务器返回的响应缺少用户数据";
        return { error: "登录响应格式错误" };
      }
      
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      error.value = null;
      await authService.logout();
      user.value = null;
      lastChecked.value = Date.now();
    } catch (err) {
      error.value = err.message;
      // 即使API调用失败，也清除本地状态
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const checkAuth = async () => {
    try {
      const now = new Date().getTime();
      // 如果30秒内已经检查过，不再重复检查
      if (lastChecked.value && (now - lastChecked.value < 30000)) {
        return { data: user.value, status: 200, cached: true };
      }
      
      console.log('正在检查用户认证状态...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('未找到认证令牌，用户未登录');
        user.value = null;
        lastChecked.value = now;
        return { data: null, status: 401, message: '未登录' };
      }
      
      try {
        // 尝试从API获取用户数据
        const response = await authService.getCurrentUser();
        
        // 检查是否返回了匿名用户（API错误情况下的备用用户）
        if (response.data && response.data.isAnonymous) {
          console.log('获取到匿名用户，原因:', 
                      response.source || '未知');
          
          // 尝试从本地存储获取用户信息
          try {
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (localUser && localUser.username && !localUser.isAnonymous) {
              console.log('使用本地保存的用户信息继续');
              user.value = localUser;
              lastChecked.value = now;
              return {
                data: localUser,
                status: 200,
                offline: true,
                message: `使用本地数据(${response.source})`
              };
            }
          } catch (parseErr) {
            console.warn('解析本地用户数据失败:', parseErr);
          }
          
          // 判断是否是认证过期
          if (response.data.tokenExpired) {
            console.log('认证已过期，清除认证信息');
            localStorage.removeItem('token');
            user.value = null;
            lastChecked.value = now;
            return { 
              data: null, 
              status: 401, 
              message: '认证已过期，请重新登录' 
            };
          }
          
          // 其他类型的错误，使用匿名用户继续
          user.value = response.data;
          lastChecked.value = now;
          return {
            data: response.data,
            status: 200,
            anonymous: true,
            message: `匿名用户(${response.source})`
          };
        }
        
        // 获取服务器返回的用户数据
        const userData = response.data;
        
        // 如果服务器返回的用户数据缺少username，尝试从localStorage中获取
        if (!userData.username) {
          try {
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (localUser && localUser.username) {
              userData.username = localUser.username;
            } else if (userData.email) {
              // 从邮箱中提取用户名
              userData.username = userData.email.split('@')[0];
            }
          } catch (e) {
            // 静默处理错误，保持应用功能正常
            console.warn('提取用户名失败:', e);
          }
        }
        
        console.log('成功获取用户数据:', userData.username);
        user.value = userData;
        // 更新本地存储中的用户信息
        localStorage.setItem('user', JSON.stringify(userData));
        lastChecked.value = now;
        return response;
      } catch (apiError) {
        console.warn('API请求用户信息失败，尝试使用本地存储数据:', apiError.message);
        
        // API请求失败，尝试从本地存储获取用户信息
        try {
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (localUser && localUser.username) {
            console.log('使用本地存储的用户信息继续:', localUser.username);
            user.value = localUser;
            lastChecked.value = now;
            // 返回一个模拟的响应，避免级联错误
            return {
              data: localUser,
              status: 200,
              offline: true // 标记此响应为离线获取
            };
          }
        } catch (localError) {
          console.error('读取本地用户数据失败:', localError);
        }
        
        // 如果本地也没有数据，清除认证信息（仅在特定错误时）
        if (apiError.message && (
            apiError.message.includes('未授权') || 
            apiError.message.includes('Unauthorized') || 
            apiError.message.includes('认证已过期'))) {
          console.log('认证已失效，清除令牌');
          user.value = null;
          localStorage.removeItem('token');
          lastChecked.value = now;
          return {
            data: null,
            status: 401,
            message: apiError.message
          };
        }
        
        // 如果是网络错误，创建一个匿名用户继续
        if (apiError.isNetworkError) {
          console.log('网络错误，使用访客模式继续');
          const anonymousUser = {
            id: 'anonymous',
            username: '访客用户',
            role: 'anonymous',
            isAnonymous: true
          };
          user.value = anonymousUser;
          lastChecked.value = now;
          return {
            data: anonymousUser,
            status: 200,
            anonymous: true,
            message: apiError.message
          };
        }
        
        // 其他类型的错误，返回错误信息
        lastChecked.value = now;
        return {
          status: 500,
          error: apiError,
          message: apiError.message || '检查认证失败'
        };
      }
    } catch (error) {
      console.error('检查认证状态时发生意外错误:', error);
      
      // 意外错误发生时，创建一个匿名用户继续
      const anonymousUser = {
        id: 'anonymous',
        username: '访客用户(错误恢复)',
        role: 'anonymous',
        isAnonymous: true,
        errorRecovery: true
      };
      
      user.value = anonymousUser;
      lastChecked.value = new Date().getTime();
      
      return {
        data: anonymousUser,
        status: 200,
        anonymous: true,
        recovered: true,
        message: error.message || '意外错误'
      };
    }
  };

  const updateProfile = async (data) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.updateProfile(data);
      user.value = response.data;
      // 更新本地存储
      localStorage.setItem('user', JSON.stringify(response.data));
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // 初始化时检查一次认证状态
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      // 在应用初始化时检查一下认证状态
      setTimeout(() => {
        checkAuth();
      }, 0);
    }
  }

  return {
    // 状态
    user,
    loading,
    error,

    // 计算属性
    isAuthenticated,
    isAdmin,

    // 方法
    register,
    login,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
    clearError
  };
}); 