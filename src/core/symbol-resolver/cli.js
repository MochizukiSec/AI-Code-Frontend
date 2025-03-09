#!/usr/bin/env node

/**
 * 符号解析器命令行工具
 * 用于从Go后端调用Node.js符号解析器
 */

const { SymbolResolver, SymbolType } = require('./index');
const fs = require('fs');
const path = require('path');

// 创建符号解析器实例
const symbolResolver = new SymbolResolver();

/**
 * 分析文件或目录
 * @param {string} targetPath 目标路径
 */
async function analyze(targetPath) {
  try {
    const stats = fs.statSync(targetPath);
    
    let result;
    if (stats.isDirectory()) {
      // 分析目录
      console.log(`分析目录: ${targetPath}`);
      
      const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue'];
      const excludeDirs = ['node_modules', 'dist', 'build', '.git'];
      
      result = symbolResolver.analyzeProject(targetPath, extensions, excludeDirs);
    } else if (stats.isFile()) {
      // 分析单个文件
      console.log(`分析文件: ${targetPath}`);
      
      const content = fs.readFileSync(targetPath, 'utf8');
      const fileResult = symbolResolver.analyzeFile(targetPath, content);
      
      if (fileResult) {
        result = {
          path: targetPath,
          stats: symbolResolver.getProjectStats(),
          symbols: symbolResolver.getFileSymbols(targetPath)
        };
      } else {
        throw new Error(`分析文件失败: ${targetPath}`);
      }
    } else {
      throw new Error(`不支持的路径类型: ${targetPath}`);
    }
    
    // 将结果转换为JSON输出
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('分析错误:', error);
    console.log(JSON.stringify({
      error: error.message || '未知错误'
    }));
    process.exit(1);
  }
}

/**
 * 查找符号
 * @param {string} name 符号名称
 * @param {string} filePath 文件路径（可选）
 */
async function findSymbol(name, filePath) {
  try {
    // 先加载项目
    if (filePath) {
      // 如果提供了文件路径，从该文件所在目录开始分析
      const dirPath = path.dirname(filePath);
      symbolResolver.analyzeDirectory(dirPath);
    } else {
      // 否则尝试从当前目录分析
      symbolResolver.analyzeDirectory(process.cwd());
    }
    
    // 构建跨文件引用
    symbolResolver.buildCrossReferences();
    
    // 查找符号
    const symbol = symbolResolver.findSymbol(name, filePath);
    
    // 输出结果
    console.log(JSON.stringify({ symbol }));
  } catch (error) {
    console.error('查找符号错误:', error);
    console.log(JSON.stringify({
      error: error.message || '未知错误'
    }));
    process.exit(1);
  }
}

/**
 * 查找符号引用
 * @param {string} name 符号名称
 * @param {string} filePath 文件路径（可选）
 */
async function findReferences(name, filePath) {
  try {
    // 先加载项目
    if (filePath) {
      // 如果提供了文件路径，从该文件所在目录开始分析
      const dirPath = path.dirname(filePath);
      symbolResolver.analyzeDirectory(dirPath);
    } else {
      // 否则尝试从当前目录分析
      symbolResolver.analyzeDirectory(process.cwd());
    }
    
    // 构建跨文件引用
    symbolResolver.buildCrossReferences();
    
    // 查找符号引用
    const references = symbolResolver.findAllReferences(name);
    
    // 输出结果
    console.log(JSON.stringify({ references }));
  } catch (error) {
    console.error('查找符号引用错误:', error);
    console.log(JSON.stringify({
      error: error.message || '未知错误'
    }));
    process.exit(1);
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
符号解析器命令行工具

用法:
  node cli.js [命令] [参数]

命令:
  analyze <路径>                分析文件或目录中的符号
  find-symbol <名称> [--file 文件路径]  查找指定名称的符号
  find-references <名称> [--file 文件路径]  查找符号的所有引用
  help                        显示帮助信息

示例:
  node cli.js analyze src/index.js
  node cli.js analyze src/
  node cli.js find-symbol useState --file src/App.js
  node cli.js find-references fetchData
  `);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'analyze':
      if (args.length < 2) {
        console.error('错误: 请提供要分析的路径');
        process.exit(1);
      }
      await analyze(args[1]);
      break;
      
    case 'find-symbol':
      if (args.length < 2) {
        console.error('错误: 请提供要查找的符号名称');
        process.exit(1);
      }
      
      const symbolName = args[1];
      let filePath = null;
      
      // 检查是否提供了文件路径
      const fileArgIndex = args.indexOf('--file');
      if (fileArgIndex !== -1 && args.length > fileArgIndex + 1) {
        filePath = args[fileArgIndex + 1];
      }
      
      await findSymbol(symbolName, filePath);
      break;
      
    case 'find-references':
      if (args.length < 2) {
        console.error('错误: 请提供要查找引用的符号名称');
        process.exit(1);
      }
      
      const refName = args[1];
      let refFilePath = null;
      
      // 检查是否提供了文件路径
      const refFileArgIndex = args.indexOf('--file');
      if (refFileArgIndex !== -1 && args.length > refFileArgIndex + 1) {
        refFilePath = args[refFileArgIndex + 1];
      }
      
      await findReferences(refName, refFilePath);
      break;
      
    case 'help':
      showHelp();
      break;
      
    default:
      console.error(`错误: 未知命令 "${command}"`);
      showHelp();
      process.exit(1);
  }
}

// 启动程序
main().catch(error => {
  console.error('程序执行错误:', error);
  process.exit(1);
}); 