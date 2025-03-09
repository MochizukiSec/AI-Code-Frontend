<template>
  <div class="home">
    <!-- 背景动画元素 -->
    <div class="bg-animation">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
    </div>

    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo-icon">⚡</span>
        <span>AI Code Analyzer</span>
      </div>
      <div class="nav-links">
        <router-link to="/auth/login" class="login-btn">登录</router-link>
        <router-link to="/auth/register" class="register-btn">注册</router-link>
      </div>
    </nav>

    <main class="hero">
      <div class="hero-content">
        <div class="badge">AI驱动 · 高效分析</div>
        <h1>智能代码分析平台</h1>
        <p class="subtitle">使用AI技术，让代码审查更简单、更高效</p>
        <div class="cta-buttons">
          <router-link to="/auth/login" class="cta-primary">
            <span>立即开始</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </router-link>
          <a href="#features" class="cta-secondary">了解更多</a>
        </div>
      </div>
      <div class="hero-image">
        <div class="code-window">
          <div class="window-header">
            <div class="window-buttons">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="window-title">code-analyzer.js</div>
          </div>
          <div class="window-content">
            <pre><code><span class="code-comment">// AI代码分析示例</span>
<span class="code-keyword">async</span> <span class="code-function">function</span> <span class="code-name">analyzeCode</span>(code) {
  <span class="code-keyword">const</span> result = <span class="code-keyword">await</span> ai.analyze(code);
  
  <span class="code-keyword">return</span> {
    quality: result.quality,
    security: result.security,
    performance: result.performance,
    suggestions: result.suggestions
  };
}</code></pre>
          </div>
        </div>
      </div>
    </main>

    <section id="features" class="features">
      <h2 class="section-title">核心功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>智能分析</h3>
          <p>快速识别代码中的潜在问题和优化空间</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡️</div>
          <h3>实时反馈</h3>
          <p>即时获取分析结果，提高开发效率</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🛡️</div>
          <h3>安全保障</h3>
          <p>全方位检测代码安全隐患</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>性能优化</h3>
          <p>智能推荐代码性能提升方案</p>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-content">
        <h2>准备好提升你的代码质量了吗？</h2>
        <p>立即登录，体验AI驱动的代码分析</p>
        <router-link to="/auth/login" class="cta-button">免费开始</router-link>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <p>© 2023 AI Code Analyzer. 保留所有权利。</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #0f0e17;
  color: #fffffe;
  overflow-x: hidden;
  position: relative;
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
  top: 60%;
  left: 10%;
  width: 25%;
  height: 25%;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  animation: float 15s ease-in-out infinite alternate-reverse;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(100px, 50px) rotate(20deg);
  }
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2.5rem;
  background: rgba(15, 14, 23, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-icon {
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.login-btn, .register-btn {
  padding: 0.6rem 1.8rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-decoration: none;
}

.login-btn {
  color: #fffffe;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.register-btn {
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  color: #fffffe;
  box-shadow: 0 4px 20px rgba(242, 95, 76, 0.3);
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(242, 95, 76, 0.4);
}

/* 英雄区域 */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5rem;
  position: relative;
  z-index: 1;
}

.hero-content {
  max-width: 600px;
  text-align: left;
  animation: fadeInLeft 1s ease-out;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: #ff8906;
  border: 1px solid rgba(255, 137, 6, 0.3);
}

.hero h1 {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  background: linear-gradient(135deg, #fffffe 60%, #ff8906 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.5rem;
  color: #a7a9be;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
}

.cta-primary, .cta-secondary {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cta-primary {
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  color: #fffffe;
  box-shadow: 0 4px 20px rgba(242, 95, 76, 0.3);
}

.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(242, 95, 76, 0.4);
}

.cta-primary svg {
  transition: transform 0.3s ease;
}

.cta-primary:hover svg {
  transform: translateX(5px);
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #fffffe;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

/* 代码窗口 */
.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeInRight 1s ease-out;
  max-width: 600px;
}

.code-window {
  width: 100%;
  background: #16161e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.window-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.window-buttons {
  display: flex;
  gap: 0.5rem;
  margin-right: 1rem;
}

.window-buttons span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.window-buttons span:nth-child(1) {
  background: #ff5f56;
}

.window-buttons span:nth-child(2) {
  background: #ffbd2e;
}

.window-buttons span:nth-child(3) {
  background: #27c93f;
}

.window-title {
  color: #a7a9be;
  font-size: 0.9rem;
}

.window-content {
  padding: 1.5rem;
  overflow-x: auto;
}

.window-content pre {
  margin: 0;
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
}

.code-comment {
  color: #7f8c98;
}

.code-keyword {
  color: #ff8906;
}

.code-function {
  color: #7f5af0;
}

.code-name {
  color: #3da9fc;
}

/* 特性部分 */
.features {
  padding: 6rem 5rem;
  background: #16161e;
  position: relative;
  z-index: 1;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #fffffe 60%, #ff8906 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 137, 6, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  position: relative;
}

.feature-icon::after {
  content: '';
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgba(255, 137, 6, 0.1);
  border-radius: 50%;
  z-index: -1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fffffe;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #a7a9be;
  line-height: 1.6;
}

/* CTA 部分 */
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, rgba(255, 137, 6, 0.1) 0%, rgba(242, 95, 76, 0.1) 100%);
  text-align: center;
  position: relative;
  z-index: 1;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fffffe;
}

.cta-section p {
  font-size: 1.2rem;
  color: #a7a9be;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 3rem;
  background: linear-gradient(135deg, #ff8906 0%, #f25f4c 100%);
  color: #fffffe;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 20px rgba(242, 95, 76, 0.3);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(242, 95, 76, 0.4);
}

/* 页脚 */
.footer {
  padding: 2rem;
  background: #0f0e17;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.footer-content {
  color: #a7a9be;
  font-size: 0.9rem;
}

/* 动画 */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .hero {
    flex-direction: column;
    padding: 8rem 2rem 4rem;
    text-align: center;
  }
  
  .hero-content {
    max-width: 100%;
    text-align: center;
    margin-bottom: 4rem;
  }
  
  .cta-buttons {
    justify-content: center;
  }
  
  .hero-image {
    max-width: 100%;
  }
  
  .features {
    padding: 4rem 2rem;
  }
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 3rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-primary, .cta-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-section h2 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 1rem;
  }
  
  .nav-brand {
    font-size: 1.2rem;
  }
  
  .login-btn, .register-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .badge {
    font-size: 0.8rem;
  }
}
</style> 