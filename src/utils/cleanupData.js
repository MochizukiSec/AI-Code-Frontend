/**
 * 清理工具 - 用于删除本地存储中的所有测试数据
 */

// 需要保护的键列表 - 这些键不会被删除
const PROTECTED_KEYS = [
  'aiModels',
  'aiModelsSettings',
  'aiModelsBackup',
  'aiModelsMinimal',
  'defaultAiModel',
  'aiModels_last_saved'
];

// 检查键是否受保护
function isProtectedKey(key) {
  if (!key) return false;
  
  // 1. 检查是否在保护列表中
  if (PROTECTED_KEYS.includes(key)) return true;
  
  // 2. 检查是否是API密钥
  if (key.endsWith('_api_key')) return true;
  
  // 3. 检查是否是模型数据
  if (key.startsWith('model_')) return true;
  
  // 4. 检查通用模式
  if (key.includes('aiModel') || key.includes('AIModel')) return true;
  
  // 5. 特别保护DeepSeek模型相关的键
  if (key.includes('deepseek') || key.includes('Deepseek')) return true;
  
  return false;
}

// 清理与分析相关的所有本地存储数据
export function cleanupAnalysisData() {
  console.log('开始清理本地存储中的分析数据...');
  
  // 计数器
  let removedItems = 0;
  
  // 删除所有以analysis开头的项
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && (
        key.startsWith('analysis_') || 
        key.includes('analysis') ||
        key === 'analysisResults' ||
        key === 'current_analysis_task' ||
        key === 'db_rule_count'
    )) {
      // 保护AI模型数据
      if (isProtectedKey(key)) {
        console.log(`跳过受保护的数据: ${key}`);
        continue;
      }
      
      console.log(`删除数据: ${key}`);
      localStorage.removeItem(key);
      removedItems++;
    }
  }
  
  console.log(`清理完成，共删除 ${removedItems} 项数据。`);
  return removedItems;
}

// 清理与规则相关的所有本地存储数据
export function cleanupRuleData() {
  console.log('开始清理本地存储中的规则数据...');
  
  let removedItems = 0;
  
  // 删除所有与规则相关的项
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && (
        key.startsWith('rule_') || 
        key.includes('rule') ||
        key === 'rules' ||
        key === 'analysis_rules_config'
    )) {
      // 保护AI模型数据
      if (isProtectedKey(key)) {
        console.log(`跳过受保护的数据: ${key}`);
        continue;
      }
      
      console.log(`删除数据: ${key}`);
      localStorage.removeItem(key);
      removedItems++;
    }
  }
  
  console.log(`清理完成，共删除 ${removedItems} 项数据。`);
  return removedItems;
}

// 清理所有用户测试数据
export function cleanupAllTestData() {
  console.log('开始清理所有测试数据...');
  
  // 清理分析数据
  const analysisItems = cleanupAnalysisData();
  
  // 清理规则数据
  const ruleItems = cleanupRuleData();
  
  // 清理其他测试数据
  let otherItems = 0;
  const otherTestKeys = ['test_', 'demo_', 'temp_', 'mock_'];
  
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key) {
      // 保护AI模型数据
      if (isProtectedKey(key)) {
        console.log(`跳过受保护的数据: ${key}`);
        continue;
      }
      
      // 检查是否是测试数据的键
      const isTestData = otherTestKeys.some(prefix => key.startsWith(prefix));
      if (isTestData) {
        console.log(`删除数据: ${key}`);
        localStorage.removeItem(key);
        otherItems++;
      }
    }
  }
  
  console.log(`=== 数据清理完成 ===`);
  console.log(`- 分析数据: ${analysisItems} 项`);
  console.log(`- 规则数据: ${ruleItems} 项`);
  console.log(`- 其他测试数据: ${otherItems} 项`);
  console.log(`- 总计: ${analysisItems + ruleItems + otherItems} 项`);
  
  // 显示未删除的保护键
  console.log('=== 受保护的数据项（未删除）===');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (isProtectedKey(key)) {
      console.log(`- ${key}`);
    }
  }
  
  return {
    analysisItems,
    ruleItems,
    otherItems,
    total: analysisItems + ruleItems + otherItems
  };
}

export default {
  cleanupAnalysisData,
  cleanupRuleData,
  cleanupAllTestData
}; 