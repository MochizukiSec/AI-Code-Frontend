import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useAiModelsStore } from '@/stores/aiModels'

// 路由组件
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
        meta: { requiresGuest: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: RegisterView,
        meta: { requiresGuest: true }
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('@/views/CodeAnalysisView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analysis/:id',
    name: 'AnalysisReport',
    component: () => import('@/views/AnalysisReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analysis-report',
    name: 'AnalysisReportGeneral',
    component: () => import('@/views/AnalysisReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rules',
    name: 'Rules',
    component: () => import('@/views/RulesManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: () => import('@/views/ApiTestView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 检查是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  
  // 获取认证状态
  const authStore = useAuthStore();
  
  // 每次路由变化时都强制检查认证状态
  try {
    const response = await authStore.checkAuth(true); // 强制检查
    
    const isAuthenticated = authStore.isAuthenticated;
    
    // 如果路由需要认证
    if (requiresAuth) {
      if (isAuthenticated) {
        next();
      } else {
        next({
          path: '/auth/login',
          query: { redirect: to.fullPath }
        });
      }
    } 
    // 如果路由需要游客状态（未登录）
    else if (requiresGuest) {
      if (isAuthenticated) {
        next({ path: '/dashboard' });
      } else {
        next();
      }
    } 
    // 其他路由不需要特殊权限
    else {
      next();
    }
  } catch (error) {
    // 如果是设置页面，尝试从本地存储加载设置
    if (to.path === '/settings') {
      const aiModelsStore = useAiModelsStore();
      const loadedFromLocal = aiModelsStore.loadFromLocalStorage();
      
      if (loadedFromLocal) {
        next();
        return;
      }
    }
    
    // 如果路由需要认证，重定向到登录页面
    if (requiresAuth) {
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }
      });
    } else {
      // 否则直接访问
      next();
    }
  }
});

export default router
