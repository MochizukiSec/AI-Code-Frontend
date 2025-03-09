<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#312E81] to-[#581C87] relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
      <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
    </div>

    <!-- 导航栏 -->
    <NavBar />

    <!-- 仪表盘内容 -->
    <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
      <header class="dashboard-header">
        <div class="welcome-section">
          <div class="greeting-badge">
            <span class="greeting-icon">👋</span>
            <span class="greeting-text">欢迎回来</span>
          </div>
          <h1>{{ user?.username || '用户' }}</h1>
          <p class="last-login" v-if="user?.lastLogin">
            上次登录: {{ formatDate(user.lastLogin) }}
          </p>
        </div>
        <div class="user-actions">
          <div class="refresh-controls">
            <button @click="refreshData" class="btn btn-refresh" :disabled="isLoading">
              <svg class="refresh-icon" :class="{ 'rotating': isLoading }" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              刷新
            </button>
            <div class="sync-settings">
              <label class="sync-toggle">
                <input type="checkbox" v-model="autoSync">
                <span class="sync-label">自动同步</span>
              </label>
              <div v-if="autoSync" class="interval-selector">
                <button @click="decreaseInterval" class="interval-btn">-</button>
                <span class="interval-value">{{ syncInterval }}秒</span>
                <button @click="increaseInterval" class="interval-btn">+</button>
              </div>
            </div>
          </div>
          <div class="profile-actions">
            <router-link to="/profile" class="btn btn-profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              个人资料
            </router-link>
            <button @click="handleLogout" class="btn btn-logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              登出
            </button>
          </div>
        </div>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div class="stat-info">
            <h3>代码分析</h3>
            <p class="stat-number">{{ dashboardData.analysisCount }}</p>
            <p class="stat-label">今日分析次数</p>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: getProgressWidth(dashboardData.analysisCount, 10) }"></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div class="stat-info">
            <h3>问题发现</h3>
            <p class="stat-number">{{ dashboardData.issuesCount }}</p>
            <p class="stat-label">发现的问题数</p>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: getProgressWidth(dashboardData.issuesCount, 50) }"></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="stat-info">
            <h3>规则数量</h3>
            <p class="stat-number">{{ dashboardData.rulesCount }}</p>
            <p class="stat-label">已配置规则</p>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: getProgressWidth(dashboardData.rulesCount, 6) }"></div>
          </div>
        </div>
      </div>

      <h2 class="section-title">快速操作</h2>

      <div class="action-cards">
        <router-link to="/analysis" class="action-card">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </div>
          <div class="action-content">
            <h3>开始分析</h3>
            <p>上传或粘贴代码开始分析</p>
          </div>
          <div class="action-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </router-link>

        <router-link to="/rules" class="action-card">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
          <div class="action-content">
            <h3>规则管理</h3>
            <p>配置和管理分析规则</p>
          </div>
          <div class="action-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </router-link>

        <router-link to="/settings" class="action-card">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div class="action-content">
            <h3>系统设置</h3>
            <p>配置系统参数</p>
          </div>
          <div class="action-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </router-link>
      </div>

      <div class="recent-activity">
        <h2 class="section-title">最近活动</h2>
        <div v-if="recentActivities.length === 0" class="activity-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>暂无活动记录</p>
          <router-link to="/analysis" class="btn btn-start">开始第一次分析</router-link>
        </div>
        <div v-else class="activity-list">
          <div v-for="(activity, index) in recentActivities" :key="index" class="activity-item">
            <div class="activity-icon">
              <svg v-if="activity.type === 'analysis'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div class="activity-content">
              <h4>代码分析</h4>
              <p class="activity-time">{{ formatDate(activity.date) }}</p>
            </div>
            <router-link :to="`/analysis/${activity.id}`" class="activity-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '../stores/user';
import NavBar from '../components/NavBar.vue';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const user = authStore.user;

const isLoading = ref(false);
const error = ref(null);
const dashboardData = ref({
  analysisCount: 0,
  issuesCount: 0,
  rulesCount: 0
});
const lastRefreshed = ref(null);
const recentActivities = ref([]);
const broadcastChannel = ref(null);
const refreshInterval = ref(null);
const autoSync = ref(false);
const syncInterval = ref(15);

// 获取仪表板数据
const fetchDashboardData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    console.log('开始获取仪表板数据...');
    
    // 获取分析统计数据
    const analysisStats = await getAnalysisStats();
    console.log('获取到分析统计数据:', analysisStats);
    
    // 获取规则数量
    const rulesCount = await getRulesCount();
    console.log('获取到规则数量:', rulesCount);
    
    // 更新数据
    dashboardData.value = {
      analysisCount: analysisStats.totalAnalysis || 0,
      issuesCount: analysisStats.totalIssues || 0,
      rulesCount: rulesCount || 0
    };
    console.log('更新后的仪表板数据:', dashboardData.value);
    
    // 更新刷新时间
    lastRefreshed.value = new Date();
    
    // 获取最近活动
    recentActivities.value = await getRecentActivity();
    console.log('获取到最近活动:', recentActivities.value);
    
    isLoading.value = false;
  } catch (err) {
    console.error('获取仪表板数据失败:', err);
    error.value = err.message || '获取数据失败';
    isLoading.value = false;
  }
};

// 获取分析统计数据
const getAnalysisStats = async () => {
  try {
    // 尝试从API获取分析统计数据
    try {
      console.log('尝试从API获取分析统计数据...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/code-analysis/statistics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        console.warn(`API获取分析统计失败: ${response.status} ${response.statusText}`);
        throw new Error('API获取分析统计失败');
      }
      
      const data = await response.json();
      console.log('API获取分析统计成功:', data);
      
      // 如果API返回了统计数据，直接使用
      if (data && data.data) {
        return {
          totalAnalysis: data.data.totalAnalysis || 0,
          totalIssues: data.data.totalIssues || 0
        };
      } else {
        throw new Error('API返回的分析统计数据格式不正确');
      }
    } catch (apiError) {
      // API获取失败，尝试从localStorage获取
      console.warn('API获取分析统计失败，尝试从localStorage获取:', apiError);
      
      // 从localStorage中获取分析结果
      const allResults = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('analysis_results_')) {
          try {
            const resultsJson = localStorage.getItem(key);
            if (resultsJson) {
              const results = JSON.parse(resultsJson);
              allResults.push(results);
            }
          } catch (e) {
            console.error('解析分析结果失败:', e);
          }
        }
      }
      
      // 计算今日的分析次数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 仅保留今日的分析结果
      const todayResults = allResults.filter(result => {
        if (result.timestamp) {
          const resultDate = new Date(result.timestamp);
          return resultDate >= today;
        }
        return false;
      });
      
      // 计算统计数据
      const totalAnalysis = todayResults.length;
      const totalIssues = todayResults.reduce((sum, result) => {
        return sum + (result.summary?.totalIssues || 0);
      }, 0);
      
      console.log(`从localStorage获取到 ${todayResults.length} 条今日分析结果`);
      
      return {
        totalAnalysis,
        totalIssues
      };
    }
  } catch (error) {
    console.error('获取分析统计数据失败:', error);
    return {
      totalAnalysis: 0,
      totalIssues: 0
    };
  }
};

// 获取规则数量
const getRulesCount = async () => {
  try {
    // 从API获取规则数量
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/rules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取规则失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('从API获取规则成功:', data);
      
      // 如果API返回了规则数组，返回其长度
      if (data && data.data && Array.isArray(data.data)) {
        return data.data.length;
      } else {
        console.warn('API返回的规则数据格式不正确');
        return 0;
      }
    } catch (apiError) {
      console.error('API获取规则失败:', apiError);
      
      // 如果API调用失败，尝试从localStorage中读取规则数量
      const rulesConfig = localStorage.getItem('analysis_rules_config');
      if (rulesConfig) {
        try {
          const config = JSON.parse(rulesConfig);
          if (Array.isArray(config.rules)) {
            return config.rules.length;
          }
        } catch (e) {
          console.error('解析本地规则配置失败:', e);
        }
      }
      
      // 无法从任何来源获取规则数量
      return 0;
    }
  } catch (error) {
    console.error('获取规则数量失败:', error);
    return 0;
  }
};

// 使用 BroadcastChannel 创建一个实时通信渠道
const createBroadcastChannel = () => {
  try {
    // 创建一个广播通道用于跨标签页和组件通信
    const dataChannel = new BroadcastChannel('dashboard-updates');
    
    // 监听其他标签页或组件的更新
    dataChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'update') {
        console.log('收到数据更新通知，刷新数据');
        fetchDashboardData();
      }
    };
    
    return dataChannel;
  } catch (error) {
    console.error('创建BroadcastChannel失败:', error);
    return null;
  }
};

// 通知其他标签页或组件数据已更新
const notifyDataUpdated = (channel) => {
  if (channel) {
    try {
      channel.postMessage({ type: 'update', timestamp: Date.now() });
    } catch (error) {
      console.error('发送更新通知失败:', error);
    }
  }
};

// 添加处理localStorage变化的函数
const handleStorageChange = (event) => {
  // 当localStorage发生变化时，特别是与分析相关的项
  if (event.key && (
      event.key.startsWith('analysis_') || 
      event.key === 'analysisResults')
  ) {
    console.log('检测到localStorage变化，刷新数据');
    fetchDashboardData();
  }
};

// 设置localStorage变化监听器
const setupLocalStorageListener = () => {
  window.addEventListener('storage', handleStorageChange);
  console.log('已设置localStorage变化监听器');
};

// 开始定时刷新
const startRefreshInterval = () => {
  // 清除现有定时器
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
  
  // 如果启用了自动同步，设置定时器
  if (autoSync.value) {
    console.log(`设置定时刷新：每 ${syncInterval.value} 秒刷新一次`);
    refreshInterval.value = setInterval(() => {
      console.log('执行定时刷新...');
      fetchDashboardData();
    }, syncInterval.value * 1000);
  } else {
    console.log('自动同步已禁用，不会定时刷新');
  }
};

// 手动刷新数据
const refreshData = () => {
  console.log('手动刷新仪表盘数据');
  fetchDashboardData();
  if (broadcastChannel.value) {
    broadcastChannel.value.postMessage({ type: 'refresh_dashboard' });
  }
};

// 计算进度条宽度
const getProgressWidth = (value, max = 100) => {
  return Math.min(Math.max((value / max) * 100, 0), 100) + '%';
};

// 获取最近活动
const getRecentActivity = async () => {
  try {
    // 先尝试从API获取最近活动
    try {
      console.log('尝试从API获取最近活动...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/v1/code-analysis/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取最近活动失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 确保API返回了活动数组
      if (data && data.data && Array.isArray(data.data)) {
        // 格式化API返回的活动数据
        const activities = data.data.map(activity => ({
          id: activity.id || activity.taskId,
          date: new Date(activity.createdAt || activity.timestamp),
          type: activity.type || 'analysis'
        }));
        console.log('从API获取到最近活动:', activities.length, '条');
        return activities;
      }
      
      throw new Error('API返回的活动数据格式不正确');
    } catch (apiError) {
      console.warn('从API获取最近活动失败，尝试从localStorage获取:', apiError);
      
      // 从localStorage中获取最近的分析活动
      const activities = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('analysis_results_')) {
          const taskId = key.replace('analysis_results_', '');
          const timeStamp = parseInt(taskId.replace('local_', ''));
          if (!isNaN(timeStamp)) {
            activities.push({
              id: taskId,
              date: new Date(timeStamp),
              type: 'analysis'
            });
          }
        }
      }
      
      // 按时间排序，最新的在前
      activities.sort((a, b) => b.date - a.date);
      console.log('从localStorage获取到最近活动:', activities.length, '条');
      return activities.slice(0, 5); // 返回最近5条
    }
  } catch (error) {
    console.error('获取最近活动失败:', error);
    return [];
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/auth/login');
  } catch (error) {
    console.error('登出失败:', error);
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 组件挂载时获取数据并开始定时刷新
onMounted(() => {
  // 加载同步设置
  loadSyncSettings();
  
  // 立即获取数据
  fetchDashboardData();
  
  // 开始定时刷新
  startRefreshInterval();
  
  // 设置localStorage变化监听器
  setupLocalStorageListener();
  
  // 设置广播通道
  broadcastChannel.value = createBroadcastChannel();
});

// 增加刷新间隔时间
const increaseInterval = () => {
  // 最大允许300秒（5分钟）
  syncInterval.value = Math.min(syncInterval.value + 5, 300);
  startRefreshInterval();
  saveSyncSettings();
};

// 减少刷新间隔时间
const decreaseInterval = () => {
  // 最小允许5秒
  syncInterval.value = Math.max(syncInterval.value - 5, 5);
  startRefreshInterval();
  saveSyncSettings();
};

// 保存同步设置
const saveSyncSettings = () => {
  try {
    localStorage.setItem('dashboard_sync_settings', JSON.stringify({
      autoSync: autoSync.value,
      interval: syncInterval.value
    }));
    console.log('已保存仪表盘同步设置');
  } catch (e) {
    console.error('保存同步设置失败:', e);
  }
};

// 加载同步设置
const loadSyncSettings = () => {
  try {
    const savedSettings = localStorage.getItem('dashboard_sync_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      autoSync.value = settings.autoSync || false;
      syncInterval.value = settings.interval || 15;
      console.log('已加载同步设置:', settings);
    }
  } catch (e) {
    console.error('加载同步设置失败:', e);
  }
};

// 监听自动同步设置变化
watch(autoSync, (newValue) => {
  console.log('自动同步设置变更为:', newValue);
  startRefreshInterval();
  saveSyncSettings();
});

// 组件卸载时清除定时器和频道
onUnmounted(() => {
  console.log('仪表盘组件卸载，清理资源');
  
  // 清理定时刷新器
  if (refreshInterval.value) {
    console.log('清理定时刷新器');
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
  
  // 清理广播通道
  if (broadcastChannel.value) {
    console.log('关闭广播通道');
    broadcastChannel.value.close();
    broadcastChannel.value = null;
  }
  
  // 移除localStorage事件监听器
  window.removeEventListener('storage', handleStorageChange);
  console.log('已移除所有事件监听器');
});
</script>

<style scoped>
/* 主容器样式 */
.min-h-screen {
  min-height: 100vh;
}

/* 保留原有的样式特性但适应新的容器结构 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.welcome-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  width: fit-content;
}

.greeting-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.greeting-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.last-login {
  font-size: 0.9rem;
  color: #a7a9be;
  margin: 0;
}

.user-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

/* 刷新控件样式 */
.refresh-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(127, 90, 240, 0.2);
  color: #7f5af0;
  border: 1px solid #7f5af0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover {
  background: rgba(127, 90, 240, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  transition: transform 0.5s ease;
}

.refresh-icon.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sync-settings {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sync-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #94a1b2;
  white-space: nowrap;
}

.sync-toggle input[type="checkbox"] {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1px solid #7f5af0;
  border-radius: 0.25rem;
  background-color: transparent;
  cursor: pointer;
  position: relative;
}

.sync-toggle input[type="checkbox"]:checked {
  background-color: #7f5af0;
}

.sync-toggle input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 0.75rem;
  top: -0.125rem;
  left: 0.125rem;
}

.interval-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.interval-btn {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(127, 90, 240, 0.2);
  color: #7f5af0;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
}

.interval-btn:hover {
  background: rgba(127, 90, 240, 0.3);
}

.interval-value {
  min-width: 1.5rem;
  text-align: center;
  color: #fffffe;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-profile,
.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: none;
}

.btn-profile {
  background: rgba(255, 255, 255, 0.1);
  color: #fffffe;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-profile:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-logout {
  background: rgba(242, 95, 76, 0.1);
  color: #f25f4c;
  border: 1px solid rgba(242, 95, 76, 0.3);
}

.btn-logout:hover {
  background: rgba(242, 95, 76, 0.2);
  transform: translateY(-2px);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 1rem;
  color: white;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #ff8906, #f25f4c);
  border-radius: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #ff8906, #f25f4c);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  color: #ff8906;
}

.stat-info {
  flex: 1;
}

.stat-card h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #a7a9be;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  color: #a7a9be;
  font-size: 0.9rem;
  margin: 0;
}

.stat-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 1rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff8906, #f25f4c);
  border-radius: 2px;
  transition: width 1s ease-in-out;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.action-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.action-card:hover .action-arrow {
  transform: translateX(5px);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  margin-right: 1rem;
  color: #ff8906;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #fffffe;
}

.action-card p {
  color: #a7a9be;
  font-size: 0.9rem;
  margin: 0;
}

.action-arrow {
  color: #ff8906;
  transition: transform 0.3s ease;
}

.recent-activity {
  margin-bottom: 3rem;
}

.activity-empty {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #a7a9be;
}

.activity-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  color: white;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s ease;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  margin-right: 1rem;
  color: #ff8906;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  font-weight: 600;
  font-size: 1rem;
  margin: 0 0 0.25rem 0;
  color: #fffffe;
}

.activity-time {
  color: #a7a9be;
  font-size: 0.85rem;
  margin: 0;
}

.activity-link {
  color: #ff8906;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.activity-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

.activity-empty svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.activity-empty p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.btn-start {
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  color: #fffffe;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(242, 95, 76, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(242, 95, 76, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .user-actions {
    width: 100%;
    align-items: flex-start;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .refresh-controls {
    flex-wrap: wrap;
    width: 100%;
  }
  
  .profile-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  
  .stats-grid, .action-cards {
    grid-template-columns: 1fr;
  }
}
</style>
