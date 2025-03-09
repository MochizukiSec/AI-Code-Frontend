<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <div class="actions">
        <router-link to="/" class="btn">返回首页</router-link>
        <button @click="goBack" class="btn btn-outline">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  text-align: center;
}

.not-found-content {
  padding: 2rem;
}

h1 {
  font-size: 8rem;
  font-weight: bold;
  color: #4a90e2;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin: 1rem 0;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn:not(.btn-outline) {
  background-color: #4a90e2;
  color: white;
  border: none;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #4a90e2;
  color: #4a90e2;
}

.btn:hover:not(.btn-outline) {
  background-color: #357abd;
}

.btn-outline:hover {
  background-color: #4a90e2;
  color: white;
}
</style> 