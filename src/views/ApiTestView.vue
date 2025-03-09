<template>
  <div class="api-test-container">
    <h1>API 测试页面</h1>
    
    <div class="test-section">
      <h2>健康检查</h2>
      <button @click="testHealth" :disabled="healthLoading">测试健康检查 API</button>
      <div v-if="healthResult" class="result" :class="{ success: healthResult.success, error: !healthResult.success }">
        <pre>{{ JSON.stringify(healthResult.data, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>AI 模型</h2>
      <button @click="testGetModels" :disabled="modelsLoading">获取 AI 模型列表</button>
      <div v-if="modelsResult" class="result" :class="{ success: modelsResult.success, error: !modelsResult.success }">
        <pre>{{ JSON.stringify(modelsResult.data, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>规则</h2>
      <button @click="testGetRules" :disabled="rulesLoading">获取规则列表</button>
      <div v-if="rulesResult" class="result" :class="{ success: rulesResult.success, error: !rulesResult.success }">
        <pre>{{ JSON.stringify(rulesResult.data, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>分析</h2>
      <div class="code-input">
        <textarea v-model="codeToAnalyze" placeholder="输入要分析的代码"></textarea>
        <select v-model="language">
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="go">Go</option>
          <option value="csharp">C#</option>
        </select>
      </div>
      <button @click="testAnalyzeCode" :disabled="analysisLoading">分析代码</button>
      <div v-if="analysisResult" class="result" :class="{ success: analysisResult.success, error: !analysisResult.success }">
        <pre>{{ JSON.stringify(analysisResult.data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.service';

export default {
  name: 'ApiTestView',
  data() {
    return {
      // 健康检查
      healthLoading: false,
      healthResult: null,
      
      // AI 模型
      modelsLoading: false,
      modelsResult: null,
      
      // 规则
      rulesLoading: false,
      rulesResult: null,
      
      // 分析
      codeToAnalyze: 'function test() {\n  console.log("Hello, world!");\n}',
      language: 'javascript',
      analysisLoading: false,
      analysisResult: null
    };
  },
  methods: {
    // 测试健康检查 API
    async testHealth() {
      this.healthLoading = true;
      this.healthResult = null;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/health`);
        const data = await response.json();
        
        this.healthResult = {
          success: true,
          data
        };
      } catch (error) {
        console.error('健康检查失败:', error);
        this.healthResult = {
          success: false,
          data: { error: error.message }
        };
      } finally {
        this.healthLoading = false;
      }
    },
    
    // 测试获取 AI 模型列表
    async testGetModels() {
      this.modelsLoading = true;
      this.modelsResult = null;
      
      try {
        const data = await apiService.getAIModels();
        
        this.modelsResult = {
          success: true,
          data
        };
      } catch (error) {
        console.error('获取 AI 模型列表失败:', error);
        this.modelsResult = {
          success: false,
          data: { error: error.message }
        };
      } finally {
        this.modelsLoading = false;
      }
    },
    
    // 测试获取规则列表
    async testGetRules() {
      this.rulesLoading = true;
      this.rulesResult = null;
      
      try {
        const data = await apiService.getRules();
        
        this.rulesResult = {
          success: true,
          data
        };
      } catch (error) {
        console.error('获取规则列表失败:', error);
        this.rulesResult = {
          success: false,
          data: { error: error.message }
        };
      } finally {
        this.rulesLoading = false;
      }
    },
    
    // 测试分析代码
    async testAnalyzeCode() {
      if (!this.codeToAnalyze) {
        alert('请输入要分析的代码');
        return;
      }
      
      this.analysisLoading = true;
      this.analysisResult = null;
      
      try {
        const data = await apiService.createAnalysis(this.codeToAnalyze, this.language);
        
        this.analysisResult = {
          success: true,
          data
        };
      } catch (error) {
        console.error('分析代码失败:', error);
        this.analysisResult = {
          success: false,
          data: { error: error.message }
        };
      } finally {
        this.analysisLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.api-test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.result {
  margin-top: 15px;
  padding: 15px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}

.success {
  background-color: #e7f7e7;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

pre {
  margin: 0;
  white-space: pre-wrap;
}

.code-input {
  margin-bottom: 15px;
}

textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  margin-bottom: 10px;
}

select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style> 