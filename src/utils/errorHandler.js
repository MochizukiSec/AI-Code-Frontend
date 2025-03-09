/**
 * 全局错误处理工具
 * 统一处理、分类和记录应用程序中的错误
 */

// 错误类型
export const ErrorTypes = {
  NETWORK: 'network_error',
  AUTH: 'authentication_error',
  VALIDATION: 'validation_error',
  API: 'api_error',
  UNKNOWN: 'unknown_error',
  RECOVERABLE: 'recoverable_error' // 新增可恢复错误类型
};

/**
 * 根据错误信息分类错误类型
 * @param {Error|Object} error 错误对象
 * @returns {string} 错误类型
 */
export const categorizeError = (error) => {
  const message = error.message || '';
  
  // 网络错误 - 可恢复
  if (message.includes('Network') || 
      message.includes('网络') || 
      message.includes('timeout') || 
      message.includes('ECONNABORTED') ||
      message.includes('连接') ||
      message.includes('404') ||
      error.isNetworkError === true) {
    return ErrorTypes.NETWORK;
  }
  
  // 认证错误
  if (message.includes('未授权') || 
      message.includes('Unauthorized') || 
      message.includes('认证已过期') || 
      message.includes('token') || 
      message.includes('登录')) {
    return ErrorTypes.AUTH;
  }
  
  // 验证错误
  if (message.includes('验证') || 
      message.includes('无效') || 
      message.includes('格式') || 
      message.includes('required') || 
      message.includes('必填')) {
    return ErrorTypes.VALIDATION;
  }
  
  // API错误 - 状态码404表示资源不存在，可能是临时问题
  if (error.status === 404 || error.statusCode === 404 || 
      (error.response && error.response.status === 404)) {
    return ErrorTypes.RECOVERABLE;
  }
  
  // 其他API错误
  if (error.status || error.statusCode || message.includes('服务器')) {
    return ErrorTypes.API;
  }
  
  // 默认为未知错误
  return ErrorTypes.UNKNOWN;
};

/**
 * 根据环境处理错误
 * @param {Error|Object} error 错误对象
 * @param {Object} options 选项
 * @returns {Object} 处理后的错误信息
 */
export const handleError = (error, options = {}) => {
  // 默认选项
  const defaults = {
    logToConsole: true,
    logToServer: false, // 是否发送到服务器日志
    notifyUser: false,  // 是否显示给用户
    ignoreRecoverable: true // 可恢复错误是否显示给用户
  };
  
  const settings = { ...defaults, ...options };
  const errorType = categorizeError(error);
  
  // 创建统一的错误对象
  const processedError = {
    type: errorType,
    message: error.message || '未知错误',
    originalError: error,
    timestamp: new Date().toISOString(),
    isRecoverable: errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.RECOVERABLE
  };
  
  // 控制台日志 - 对于网络错误仅警告不报错
  if (settings.logToConsole) {
    if (processedError.isRecoverable) {
      console.warn(`[${errorType}]`, error.message || error);
    } else if (!import.meta.env.PROD) {
      console.error(`[${errorType}]`, error);
    }
  }
  
  // 发送到服务器（可以在生产环境实现）
  if (settings.logToServer && import.meta.env.PROD && !processedError.isRecoverable) {
    // 这里可以实现发送到服务器的逻辑
    // 例如：sendToErrorLogging(processedError);
  }
  
  return processedError;
};

/**
 * 用户友好的错误消息生成
 * @param {Error|Object} error 错误对象
 * @returns {string} 用户友好的错误消息
 */
export const getUserFriendlyMessage = (error) => {
  const errorType = categorizeError(error);
  const message = error.message || '';
  
  switch (errorType) {
    case ErrorTypes.NETWORK:
      return '网络连接异常，正在使用本地数据继续工作';
    
    case ErrorTypes.RECOVERABLE:
      return '服务暂时不可用，正在使用本地数据继续工作';
    
    case ErrorTypes.AUTH:
      if (message.includes('过期')) {
        return '您的登录状态已过期，请重新登录';
      }
      return '认证失败，请重新登录';
    
    case ErrorTypes.VALIDATION:
      return message; // 验证错误通常已经是用户友好的
    
    case ErrorTypes.API:
      return '服务器处理请求时出错，请稍后再试';
    
    default:
      return '操作失败，请稍后重试';
  }
};

/**
 * 判断错误是否可恢复
 * @param {Error|Object} error 错误对象
 * @returns {boolean} 是否可恢复
 */
export const isRecoverableError = (error) => {
  const errorType = categorizeError(error);
  return errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.RECOVERABLE;
};

export default {
  ErrorTypes,
  categorizeError,
  handleError,
  getUserFriendlyMessage,
  isRecoverableError
}; 