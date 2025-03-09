import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user: null
  }),
  
  actions: {
    /**
     * 同步用户登录状态
     * @param {Object} userData 用户数据
     */
    login(userData) {
      if (!userData) return;
      
      this.isLoggedIn = true;
      this.user = userData;
      
      // 不再单独设置本地存储，依赖auth.store管理存储
    },
    
    /**
     * 清除用户状态
     */
    logout() {
      this.isLoggedIn = false;
      this.user = null;
      
      // 不再操作本地存储，由auth.store负责管理
    },
    
    /**
     * 检查用户认证状态
     * 注意：这是一个备用方法，主要认证应当通过authStore进行
     */
    checkAuth() {
      // 应当使用authStore作为主要认证源
      const authStore = useAuthStore();
      
      if (authStore.isAuthenticated && authStore.user) {
        this.login(authStore.user);
      } else {
        // 尝试从本地存储恢复（作为备用）
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData && token) {
          try {
            this.login(JSON.parse(userData));
          } catch (e) {
            this.logout();
          }
        } else {
          this.logout();
        }
      }
    },
    
    /**
     * 处理认证错误
     */
    handleAuthError() {
      this.logout();
      
      // 让auth.store处理认证错误和路由重定向
      const authStore = useAuthStore();
      authStore.logout();
    },
    
    /**
     * 设置为访客模式
     * 在认证失败但需要继续使用应用时调用
     * @param {Object} customData 可选的自定义用户数据
     */
    setGuestMode(customData) {
      // 创建一个访客用户
      const guestUser = customData || {
        id: 'guest',
        username: '访客用户',
        role: 'guest',
        isGuest: true,
        permissions: ['read'] // 访客只有基本浏览权限
      };
      
      // 设置用户信息但不执行完整登录
      this.user = guestUser;
      this.isLoggedIn = false; // 显式标记为未登录状态
      
      console.log('已切换到访客模式:', guestUser.username);
    }
  }
}) 