<template>
  <div class="register-container">
    <!-- 背景动画元素 -->
    <div class="bg-animation">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
    </div>

    <div class="register-box">
      <div class="register-header">
        <router-link to="/" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          返回首页
        </router-link>
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">AI Code Analyzer</span>
        </div>
      </div>

      <h2>创建账户</h2>
      <p class="subtitle">注册以使用AI代码分析工具，提升您的编程效率</p>

      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-container" :class="{ 'error': usernameError && formTouched }">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              :disabled="loading"
              placeholder="请输入用户名（3-30个字符）"
              @blur="formTouched = true; validateUsername()"
            >
          </div>
          <div v-if="usernameError && formTouched" class="field-error">{{ usernameError }}</div>
        </div>

        <div class="form-group">
          <label for="email">邮箱</label>
          <div class="input-container" :class="{ 'error': emailError && formTouched }">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              :disabled="loading"
              placeholder="请输入邮箱地址"
              @blur="formTouched = true; validateEmail()"
            >
          </div>
          <div v-if="emailError && formTouched" class="field-error">{{ emailError }}</div>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-container" :class="{ 'error': passwordError && formTouched }">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              :disabled="loading"
              placeholder="请输入密码（至少6个字符）"
              @blur="formTouched = true; validatePassword()"
            >
          </div>
          <div v-if="passwordError && formTouched" class="field-error">{{ passwordError }}</div>
          <div class="password-requirements">
            <div class="requirements-header">密码必须包含：</div>
            <ul>
              <li :class="{ valid: hasUpperCase }">
                <span class="check-icon">{{ hasUpperCase ? '✓' : '✕' }}</span>
                至少一个大写字母
              </li>
              <li :class="{ valid: hasLowerCase }">
                <span class="check-icon">{{ hasLowerCase ? '✓' : '✕' }}</span>
                至少一个小写字母
              </li>
              <li :class="{ valid: hasNumber }">
                <span class="check-icon">{{ hasNumber ? '✓' : '✕' }}</span>
                至少一个数字
              </li>
              <li :class="{ valid: hasMinLength }">
                <span class="check-icon">{{ hasMinLength ? '✓' : '✕' }}</span>
                至少6个字符
              </li>
              <li :class="{ valid: isAlphaNumeric }">
                <span class="check-icon">{{ isAlphaNumeric ? '✓' : '✕' }}</span>
                仅允许字母和数字（不能包含特殊字符）
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <div class="input-container" :class="{ 'error': confirmPasswordError && formTouched }">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              :disabled="loading"
              placeholder="请再次输入密码"
              @blur="formTouched = true; validateConfirmPassword()"
            >
          </div>
          <div v-if="confirmPasswordError && formTouched" class="field-error">{{ confirmPasswordError }}</div>
        </div>

        <div class="form-group">
          <div class="terms-checkbox">
            <input 
              id="agreeTerms" 
              v-model="agreeTerms" 
              type="checkbox" 
              :disabled="loading"
            >
            <label for="agreeTerms">我同意 <a href="#" class="terms-link">服务条款</a> 和 <a href="#" class="terms-link">隐私政策</a></label>
          </div>
        </div>

        <div v-if="error" class="error-container">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="error-message">{{ error }}</div>
        </div>

        <button 
          type="submit" 
          :disabled="loading || !isFormValid" 
          class="submit-btn"
          :class="{ 'loading': loading }"
        >
          <span v-if="!loading">注册</span>
          <span v-else class="loading-spinner">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
          </span>
        </button>

        <div class="divider">
          <span>或者</span>
        </div>

        <div class="social-login">
          <button type="button" class="social-btn github">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub注册
          </button>
          <button type="button" class="social-btn google">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
            Google注册
          </button>
        </div>

        <div class="links">
          <span>已有账号？</span>
          <router-link to="/auth/login" class="login-link">立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

// 表单状态
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const agreeTerms = ref(false);
const formTouched = ref(false);
const formSubmitted = ref(false);

// 字段验证状态
const usernameError = ref('');
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

// 密码验证规则
const hasUpperCase = computed(() => /[A-Z]/.test(password.value));
const hasLowerCase = computed(() => /[a-z]/.test(password.value));
const hasNumber = computed(() => /[0-9]/.test(password.value));
const hasMinLength = computed(() => password.value.length >= 6);
const isAlphaNumeric = computed(() => /^[A-Za-z0-9]+$/.test(password.value));

// 表单验证
const isFormValid = computed(() => {
  return username.value.length >= 3 &&
         username.value.length <= 30 &&
         email.value &&
         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email.value) &&
         hasUpperCase.value &&
         hasLowerCase.value &&
         hasNumber.value &&
         hasMinLength.value &&
         isAlphaNumeric.value &&
         password.value === confirmPassword.value &&
         agreeTerms.value;
});

// 验证用户名
const validateUsername = () => {
  if (!username.value) {
    usernameError.value = '请输入用户名';
    return false;
  } else if (username.value.length < 3) {
    usernameError.value = '用户名至少需要3个字符';
    return false;
  } else if (username.value.length > 30) {
    usernameError.value = '用户名最多30个字符';
    return false;
  }
  usernameError.value = '';
  return true;
};

// 验证邮箱
const validateEmail = () => {
  if (!email.value) {
    emailError.value = '请输入邮箱地址';
    return false;
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email.value)) {
    emailError.value = '请输入有效的邮箱地址';
    return false;
  }
  emailError.value = '';
  return true;
};

// 验证密码
const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '请输入密码';
    return false;
  } else if (!hasMinLength.value) {
    passwordError.value = '密码长度至少为6个字符';
    return false;
  } else if (!hasUpperCase.value) {
    passwordError.value = '密码必须包含至少一个大写字母';
    return false;
  } else if (!hasLowerCase.value) {
    passwordError.value = '密码必须包含至少一个小写字母';
    return false;
  } else if (!hasNumber.value) {
    passwordError.value = '密码必须包含至少一个数字';
    return false;
  } else if (!isAlphaNumeric.value) {
    passwordError.value = '密码只能包含字母和数字';
    return false;
  }
  passwordError.value = '';
  return true;
};

// 验证确认密码
const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = '请确认密码';
    return false;
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = '两次输入的密码不一致';
    return false;
  }
  confirmPasswordError.value = '';
  return true;
};

// 验证整个表单
const validateForm = () => {
  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();
  
  if (!agreeTerms.value) {
    error.value = '请同意服务条款和隐私政策';
    return false;
  }
  
  return isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
};

// 监听输入变化，实时验证
watch(username, () => {
  if (formTouched.value) validateUsername();
});

watch(email, () => {
  if (formTouched.value) validateEmail();
});

watch(password, () => {
  if (formTouched.value) validatePassword();
});

watch(confirmPassword, () => {
  if (formTouched.value) validateConfirmPassword();
});

// 表单提交处理
const handleSubmit = async () => {
  formTouched.value = true;
  formSubmitted.value = true;
  
  try {
    // 清除之前的错误
    error.value = '';
    
    // 验证表单
    if (!validateForm()) {
      return;
    }

    // 开始注册
    loading.value = true;
    console.log('开始注册流程，提交数据:', { 
      username: username.value, 
      email: email.value, 
      password: '***' 
    });
    
    const response = await authStore.register(username.value, email.value, password.value);
    console.log('注册成功，响应:', response);
    
    // 注册成功，跳转到仪表盘
    router.push('/dashboard');
  } catch (err) {
    console.error('注册错误:', err);
    
    // 处理不同类型的错误
    if (err.response && err.response.data) {
      const responseData = err.response.data;
      console.error('服务器响应数据:', responseData);
      
      if (responseData.errors && responseData.errors.length > 0) {
        // 显示第一个验证错误
        error.value = responseData.errors[0].message || '注册失败，请检查输入';
      } else if (responseData.message && responseData.message.includes('用户名已被使用')) {
        error.value = '用户名已被使用，请尝试其他用户名';
        usernameError.value = '用户名已被使用';
      } else if (responseData.message && responseData.message.includes('邮箱已被注册')) {
        error.value = '邮箱已被注册，请使用其他邮箱或尝试找回密码';
        emailError.value = '邮箱已被注册';
      } else {
        error.value = responseData.message || '注册失败，请稍后再试';
      }
    } else if (err.message && err.message.includes('网络')) {
      error.value = '无法连接到服务器，请检查网络连接';
    } else {
      error.value = err.message || '注册失败，请稍后再试';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0f0e17;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 背景动画 */
.bg-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
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

.blob-4 {
  top: 10%;
  left: 20%;
  width: 40%;
  height: 40%;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  animation: float 22s ease-in-out infinite alternate;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(100px, 50px) rotate(20deg);
  }
}

.register-box {
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  background: rgba(22, 22, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.6s ease-out;
  position: relative;
  z-index: 1;
}

.register-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a7a9be;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #fffffe;
  transform: translateX(-3px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  font-size: 1rem;
}

.register-form {
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
  margin-left: 0.25rem;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a7a9be;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 1rem;
  color: #fffffe;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #ff8906;
  box-shadow: 0 0 0 3px rgba(255, 137, 6, 0.2);
}

input[type="text"]::placeholder,
input[type="email"]::placeholder,
input[type="password"]::placeholder {
  color: #a7a9be;
  opacity: 0.6;
}

.password-requirements {
  margin-top: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 0.9rem;
  color: #a7a9be;
  animation: fadeIn 0.4s ease-out;
}

.requirements-header {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.password-requirements ul {
  list-style: none;
  padding-left: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f25f4c;
  transition: color 0.3s ease;
}

.password-requirements li.valid {
  color: #2cb67d;
}

.check-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.8rem;
  background: rgba(242, 95, 76, 0.2);
  color: #f25f4c;
  transition: all 0.3s ease;
}

.valid .check-icon {
  background: rgba(44, 182, 125, 0.2);
  color: #2cb67d;
}

.password-mismatch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f25f4c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.terms-checkbox {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #a7a9be;
}

.terms-checkbox input {
  margin-right: 0.5rem;
}

.terms-link {
  color: #ff8906;
  text-decoration: none;
  transition: all 0.3s ease;
}

.terms-link:hover {
  color: #f25f4c;
  text-decoration: underline;
}

.submit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  color: #fffffe;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 20px rgba(242, 95, 76, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(242, 95, 76, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn svg {
  transition: transform 0.3s ease;
}

.submit-btn:hover:not(:disabled) svg {
  transform: translateX(5px);
}

.submit-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fffffe;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #a7a9be;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.divider::before {
  margin-right: 1rem;
}

.divider::after {
  margin-left: 1rem;
}

.social-login {
  display: flex;
  gap: 1rem;
}

.social-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fffffe;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.github {
  color: #fffffe;
}

.google {
  color: #fffffe;
}

.error-container {
  display: flex;
  align-items: flex-start;
  background-color: rgba(255, 87, 87, 0.1);
  border-left: 3px solid #ff5757;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in-out;
}

.error-icon {
  color: #ff5757;
  margin-right: 10px;
  flex-shrink: 0;
}

.error-message {
  color: #ff5757;
  font-size: 14px;
  line-height: 1.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 20px;
  height: 20px;
}

.path {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.links {
  text-align: center;
  color: #a7a9be;
  font-size: 0.95rem;
}

.login-link {
  color: #ff8906;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #f25f4c;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-box {
    padding: 2rem 1.5rem;
  }
  
  h2 {
    font-size: 1.8rem;
  }
  
  .social-login {
    flex-direction: column;
  }
  
  .password-requirements ul {
    grid-template-columns: 1fr;
  }
}

.input-container.error {
  border-color: #ff5757;
  background-color: rgba(255, 87, 87, 0.05);
}

.field-error {
  color: #ff5757;
  font-size: 12px;
  margin-top: 4px;
  animation: fadeIn 0.3s ease-in-out;
}
</style> 