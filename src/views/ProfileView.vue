<template>
  <div class="profile-container">
    <!-- 背景动画 -->
    <div class="bg-animation">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="profile-box">
      <div class="profile-header">
        <router-link to="/dashboard" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          返回仪表板
        </router-link>
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      </div>

      <h2>个人资料</h2>
      <p class="subtitle">管理您的账户信息和安全设置</p>

      <form @submit.prevent="handleUpdateProfile" class="profile-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-container">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <input
              id="username"
              v-model="username"
              type="text"
              disabled
              class="disabled"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="email">邮箱</label>
          <div class="input-container" :class="{ 'has-error': updateError }">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              :disabled="loading"
              placeholder="请输入新的邮箱地址"
            >
          </div>
        </div>

        <div v-if="updateError" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {{ updateError }}
        </div>

        <button type="submit" :disabled="loading || !isEmailChanged" class="submit-btn">
          <span class="btn-content">
            <svg v-if="loading" class="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            {{ loading ? '更新中...' : '更新资料' }}
          </span>
        </button>
      </form>

      <div class="divider">
        <span>密码管理</span>
      </div>

      <form @submit.prevent="handleChangePassword" class="profile-form">
        <div class="form-group">
          <label for="currentPassword">当前密码</label>
          <div class="input-container" :class="{ 'has-error': passwordError }">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <input
              id="currentPassword"
              v-model="currentPassword"
              type="password"
              required
              :disabled="loading"
              placeholder="请输入当前密码"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="newPassword">新密码</label>
          <div class="input-container" :class="{ 'has-error': passwordError }">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              required
              :disabled="loading"
              placeholder="请输入新密码"
            >
          </div>
          <div class="password-requirements">
            <div class="password-strength">
              <div class="strength-bar">
                <div class="strength-progress" :style="{ width: passwordStrength + '%' }"></div>
              </div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
            <ul>
              <li :class="{ valid: hasUpperCase }">至少一个大写字母</li>
              <li :class="{ valid: hasLowerCase }">至少一个小写字母</li>
              <li :class="{ valid: hasNumber }">至少一个数字</li>
              <li :class="{ valid: hasMinLength }">至少6个字符</li>
              <li :class="{ valid: isAlphaNumeric }">仅包含字母和数字</li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmNewPassword">确认新密码</label>
          <div class="input-container" :class="{ 'has-error': passwordError }">
            <div class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <input
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              type="password"
              required
              :disabled="loading"
              placeholder="请再次输入新密码"
            >
          </div>
          <div v-if="confirmNewPassword && newPassword !== confirmNewPassword" class="password-match-error">
            两次输入的密码不匹配
          </div>
        </div>

        <div v-if="passwordError" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {{ passwordError }}
        </div>

        <button 
          type="submit" 
          :disabled="loading || !isPasswordValid" 
          class="submit-btn"
        >
          <span class="btn-content">
            <svg v-if="loading" class="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
            {{ loading ? '更新中...' : '更改密码' }}
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const user = authStore.user;

// 个人资料表单
const username = ref(user?.username || '');
const email = ref(user?.email || '');
const loading = ref(false);
const updateError = ref('');

// 密码表单
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const passwordError = ref('');

// 密码验证规则
const hasUpperCase = computed(() => /[A-Z]/.test(newPassword.value));
const hasLowerCase = computed(() => /[a-z]/.test(newPassword.value));
const hasNumber = computed(() => /[0-9]/.test(newPassword.value));
const hasMinLength = computed(() => newPassword.value.length >= 6);
const isAlphaNumeric = computed(() => /^[A-Za-z0-9]+$/.test(newPassword.value));

// 密码强度计算
const passwordStrength = computed(() => {
  if (!newPassword.value) return 0;
  
  let strength = 0;
  if (hasUpperCase.value) strength += 20;
  if (hasLowerCase.value) strength += 20;
  if (hasNumber.value) strength += 20;
  if (hasMinLength.value) strength += 20;
  if (isAlphaNumeric.value) strength += 20;
  
  return strength;
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength === 0) return '未输入';
  if (strength < 40) return '弱';
  if (strength < 80) return '中';
  return '强';
});

// 表单验证
const isEmailChanged = computed(() => email.value !== user?.email);
const isPasswordValid = computed(() => {
  return currentPassword.value &&
         hasUpperCase.value &&
         hasLowerCase.value &&
         hasNumber.value &&
         hasMinLength.value &&
         isAlphaNumeric.value &&
         newPassword.value === confirmNewPassword.value;
});

// 更新个人资料
const handleUpdateProfile = async () => {
  if (!isEmailChanged.value) return;

  try {
    loading.value = true;
    updateError.value = '';
    
    await authStore.updateProfile({ email: email.value });
  } catch (err) {
    updateError.value = err.message;
  } finally {
    loading.value = false;
  }
};

// 更改密码
const handleChangePassword = async () => {
  if (!isPasswordValid.value) {
    passwordError.value = '请检查输入是否符合要求';
    return;
  }

  try {
    loading.value = true;
    passwordError.value = '';
    
    await authStore.changePassword(currentPassword.value, newPassword.value);
    
    // 清空密码表单
    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
  } catch (err) {
    passwordError.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0f0e17;
  color: #fffffe;
  padding: 2rem 0;
  position: relative;
  overflow: hidden;
}

/* 背景动画 */
.bg-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.2;
}

.blob-1 {
  top: -10%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: linear-gradient(135deg, #ff8ba7 0%, #ffc6c7 100%);
  animation: float 20s ease-in-out infinite alternate;
}

.blob-2 {
  bottom: -20%;
  right: -10%;
  width: 60%;
  height: 60%;
  background: linear-gradient(135deg, #3da9fc 0%, #90b4ce 100%);
  animation: float 25s ease-in-out infinite alternate-reverse;
}

.blob-3 {
  top: 40%;
  left: 60%;
  width: 30%;
  height: 30%;
  background: linear-gradient(135deg, #7f5af0 0%, #2cb67d 100%);
  animation: float 18s ease-in-out infinite alternate;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(100px, 50px) rotate(20deg);
  }
}

.profile-box {
  width: 100%;
  max-width: 550px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  border-radius: 50%;
  color: #fffffe;
}

h2 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #fffffe;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  text-align: center;
  color: #a7a9be;
  margin-bottom: 2rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.9rem;
  color: #a7a9be;
  font-weight: 500;
}

.input-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-container:focus-within {
  border-color: #ff8906;
  box-shadow: 0 0 0 2px rgba(255, 137, 6, 0.2);
}

.input-container.has-error {
  border-color: #f25f4c;
  background: rgba(242, 95, 76, 0.05);
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  color: #a7a9be;
}

input {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  font-size: 1rem;
  color: #fffffe;
  width: 100%;
}

input:focus {
  outline: none;
}

input::placeholder {
  color: rgba(167, 169, 190, 0.5);
}

input.disabled {
  color: #a7a9be;
  cursor: not-allowed;
}

.password-requirements {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #a7a9be;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1rem;
}

.password-strength {
  margin-bottom: 1rem;
}

.strength-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-progress {
  height: 100%;
  background: linear-gradient(90deg, #f25f4c, #ff8906);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.strength-text {
  font-size: 0.8rem;
  color: #a7a9be;
}

.password-requirements ul {
  list-style: none;
  padding-left: 0.5rem;
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.password-requirements li {
  display: flex;
  align-items: center;
  color: #f25f4c;
  font-size: 0.8rem;
}

.password-requirements li::before {
  content: '✕';
  margin-right: 0.5rem;
  font-size: 0.8rem;
}

.password-requirements li.valid {
  color: #2cb67d;
}

.password-requirements li.valid::before {
  content: '✓';
}

.password-match-error {
  color: #f25f4c;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.submit-btn {
  padding: 0.75rem;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  color: #fffffe;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 20px rgba(242, 95, 76, 0.3);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(242, 95, 76, 0.4);
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: #a7a9be;
  box-shadow: none;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #f25f4c;
  font-size: 0.9rem;
  text-align: center;
  background: rgba(242, 95, 76, 0.1);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(242, 95, 76, 0.2);
}

.divider {
  position: relative;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 2.5rem 0;
  text-align: center;
}

.divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #0f0e17;
  padding: 0 1rem;
  color: #a7a9be;
  font-size: 0.9rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a7a9be;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #ff8906;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }
  
  .profile-box {
    padding: 1.5rem;
  }
  
  .password-requirements ul {
    grid-template-columns: 1fr;
  }
}
</style> 