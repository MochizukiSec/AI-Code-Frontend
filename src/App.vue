<script setup>
import { onMounted, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.store';
import { useUserStore } from './stores/user';
import { useAiModelsStore } from './stores/aiModels';
// import { useToast } from 'vue-toastification'; // 需要安装此包才能使用

const authStore = useAuthStore();
const userStore = useUserStore();
const aiModelsStore = useAiModelsStore();
const router = useRouter();
// const toast = useToast(); // 需要安装vue-toastification包才能使用

// 应用程序状态
const appState = ref({
  initialized: false,
  authChecked: false,
  backendReachable: false,
  aiModelsLoaded: false,
  error: null
});

// 简单的消息显示函数
function showErrorMessage(message) {
  console.error(message);
  // 这里可以使用alert或其他方式显示错误
  alert(message);
}

// 后端健康检查
async function checkBackendHealth() {
  try {
    console.log('正在检查后端服务健康状态...');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('后端服务健康检查通过');
      appState.value.backendReachable = true;
      return true;
    } else {
      console.warn(`后端服务健康检查失败，状态码: ${response.status}`);
      appState.value.backendReachable = false;
      return false;
    }
  } catch (error) {
    console.error('后端服务健康检查出错:', error);
    appState.value.backendReachable = false;
    return false;
  }
}

// 初始化应用程序 - 统一的应用初始化函数
async function initializeApp() {
  console.log('开始初始化应用...');
  
  try {
    // 1. 检查后端健康状态
    await checkBackendHealth();
    
    // 2. 检查认证状态和加载用户
    try {
      console.log('检查用户认证状态...');
      const authResult = await authStore.checkAuth();
      
      if (authResult && authResult.data) {
        if (authResult.anonymous) {
          console.log('以访客模式继续:', authResult.message || '未知原因');
          userStore.setGuestMode();
        } else if (authResult.offline) {
          console.log('使用离线数据:', authResult.message || '网络连接问题');
          userStore.login(authResult.data);
        } else {
          userStore.login(authResult.data);
          console.log('用户已认证:', authResult.data.username);
        }
      } else {
        userStore.logout();
        console.log('用户未认证:', authResult ? authResult.message : '未知原因');
      }
      
      appState.value.authChecked = true;
    } catch (authError) {
      console.error('认证检查失败:', authError);
      userStore.setGuestMode();
      appState.value.authChecked = true;
    }
    
    // 3. 初始化和加载AI模型
    try {
      console.log('初始化AI模型...');
      
      // 检查模型是否已经加载
      if (aiModelsStore.models && aiModelsStore.models.length > 0) {
        console.log('AI模型已经加载，跳过初始化');
      } else {
        // 尝试从localStorage加载
        console.log('从localStorage加载AI模型...');
        const loadedFromStorage = aiModelsStore.loadFromLocalStorage();
        
        // 如果加载失败，初始化默认模型
        if (!loadedFromStorage || aiModelsStore.models.length === 0) {
          console.log('需要初始化默认模型');
          aiModelsStore.autoInitialize();
          
          // 立即保存到localStorage以确保持久化
          aiModelsStore.saveToLocalStorage();
        }
      }
      
      // 注册页面卸载事件，确保数据保存
      aiModelsStore.registerBeforeUnloadEvent();
      
      appState.value.aiModelsLoaded = true;
    } catch (modelError) {
      console.error('AI模型初始化失败，尝试恢复:', modelError);
      try {
        aiModelsStore.autoInitialize();
      } catch (e) {
        console.error('AI模型恢复失败:', e);
      }
    }
    
    // 标记应用已初始化
    appState.value.initialized = true;
    console.log('应用初始化完成');
  } catch (error) {
    console.error('应用初始化过程中发生错误:', error);
    appState.value.error = error.message;
    
    // 即使出错，也标记为已初始化以允许应用继续运行
    appState.value.initialized = true;
    
    // 显示错误通知，使用简单函数替代toast
    showErrorMessage(`初始化过程中发生错误: ${error.message}`);
  }
}

// 组件挂载时初始化
onMounted(() => {
  console.log('App组件已挂载，开始初始化');
  initializeApp();
});

// 组件卸载前保存状态
onBeforeUnmount(() => {
  console.log('App组件即将卸载，保存状态');
  try {
    aiModelsStore.saveToLocalStorage();
  } catch (error) {
    console.error('保存状态失败:', error);
  }
});
</script>

<template>
  <router-view></router-view>
</template>

<style>
/* 全局样式 */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>
