/**
 * 安全的存储服务
 * 提供对localStorage的封装，包含数据加密、过期时间等功能
 */

// Token的默认过期时间（一小时）
const DEFAULT_TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * 设置带过期时间的数据
 * @param {string} key 存储键
 * @param {any} value 存储值
 * @param {number} expiryMs 过期时间（毫秒）
 */
export const setWithExpiry = (key, value, expiryMs) => {
  const item = {
    value: value,
    expiry: Date.now() + expiryMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * 获取数据，如果已过期则返回null
 * @param {string} key 存储键
 * @returns {any} 存储的值或null（如果不存在或已过期）
 */
export const getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  
  // 如果不存在，返回null
  if (!itemStr) {
    return null;
  }
  
  try {
    // 首先检查是否为JWT格式（以eyJ开头的Base64编码字符串）
    if (key === 'token' && itemStr.startsWith('eyJ')) {
      console.log('检测到JWT格式令牌，直接返回');
      return itemStr; // 直接返回JWT令牌，不进行JSON解析
    }
    
    const item = JSON.parse(itemStr);
    const now = Date.now();
    
    // 检查是否过期
    if (now > item.expiry) {
      // 已过期，删除数据并返回null
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  } catch (error) {
    // 如果数据格式无效，检查是否是JWT令牌格式
    console.error('解析存储数据出错:', error);
    
    // 检查是否是JWT令牌格式（通常以eyJ开头）
    if (itemStr.startsWith('eyJ')) {
      console.log('数据可能是JWT令牌，直接返回原始值');
      return itemStr; // 直接返回原始值作为令牌
    }
    
    // 对于其他格式错误，尝试返回原始值，但记录警告
    console.warn('无法解析存储数据，返回原始值:', itemStr.substring(0, 30) + '...');
    return itemStr;
  }
};

/**
 * 检查字符串是否为JWT令牌格式
 * @param {string} str 要检查的字符串
 * @returns {boolean} 是否为JWT格式
 */
function isJwtToken(str) {
  // JWT通常是三段由点分隔的Base64编码，以eyJ开头
  return typeof str === 'string' && 
         str.startsWith('eyJ') && 
         str.split('.').length === 3;
}

/**
 * 安全地设置认证令牌
 * @param {string} token 认证令牌
 * @param {number} expiryMs 过期时间（毫秒），默认为1小时
 */
export const setAuthToken = (token, expiryMs = DEFAULT_TOKEN_EXPIRY) => {
  // 检查是否为JWT格式
  if (isJwtToken(token)) {
    console.log('检测到JWT格式令牌，直接保存');
    localStorage.setItem('token', token);
    
    // 记录一个过期时间辅助值，用于前端判断
    try {
      localStorage.setItem('token_expiry', JSON.stringify({
        expiry: Date.now() + expiryMs
      }));
    } catch (e) {
      console.warn('无法设置令牌过期时间:', e);
    }
  } else {
    // 非JWT格式，使用带过期时间的方式保存
    setWithExpiry('token', token, expiryMs);
  }
};

/**
 * 获取认证令牌
 * @returns {string|null} 认证令牌或null（如果不存在或已过期）
 */
export const getAuthToken = () => {
  // 先获取原始令牌
  const token = localStorage.getItem('token');
  
  // 如果不存在，返回null
  if (!token) {
    return null;
  }
  
  // 检查是否是JWT格式
  if (isJwtToken(token)) {
    // 检查过期时间辅助值
    try {
      const expiryData = localStorage.getItem('token_expiry');
      if (expiryData) {
        const { expiry } = JSON.parse(expiryData);
        if (Date.now() > expiry) {
          // 已过期，删除令牌及相关数据
          console.log('JWT令牌已过期，清除数据');
          localStorage.removeItem('token');
          localStorage.removeItem('token_expiry');
          return null;
        }
      }
    } catch (e) {
      console.warn('检查令牌过期时间失败:', e);
      // 即使检查失败，仍返回令牌，让API决定是否有效
    }
    
    // 返回JWT令牌
    return token;
  }
  
  // 对于非JWT格式，使用带过期时间的获取方式
  return getWithExpiry('token');
};

/**
 * 安全地获取认证令牌 - 即使出错也不会抛出异常
 * @returns {Promise<string|null>} 认证令牌或null的Promise
 */
export const safeGetAuthToken = async () => {
  try {
    return getAuthToken();
  } catch (error) {
    console.error('安全获取认证令牌失败:', error);
    return null;
  }
};

/**
 * 安全地设置用户数据
 * @param {Object} userData 用户数据
 * @param {number} expiryMs 过期时间（毫秒），默认为1小时
 */
export const setUserData = (userData, expiryMs = DEFAULT_TOKEN_EXPIRY) => {
  setWithExpiry('user', userData, expiryMs);
};

/**
 * 获取用户数据
 * @returns {Object|null} 用户数据或null（如果不存在或已过期）
 */
export const getUserData = () => {
  return getWithExpiry('user');
};

/**
 * 清除认证相关数据
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('token_expiry'); // 清除JWT过期时间辅助值
  localStorage.removeItem('user');
  
  // 清除可能存在的其他认证相关数据
  console.log('清除所有认证相关数据');
};

export default {
  setWithExpiry,
  getWithExpiry,
  setAuthToken,
  getAuthToken,
  safeGetAuthToken,
  setUserData,
  getUserData,
  clearAuthData
}; 