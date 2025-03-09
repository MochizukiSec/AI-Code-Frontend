# AI代码分析前端

这个项目是AI代码分析工具的前端部分，使用Vue 3和Vite构建。通过结合先进的人工智能技术，本系统能够对代码进行多维度分析，帮助开发者更快速地发现并解决代码中的问题，提高代码质量。

## 项目截图
<img width="1458" alt="WeCom20250307-232251@2x" src="https://github.com/user-attachments/assets/9df75deb-9a1d-4068-a7b4-4df2a2ef34cc" />

<img width="1458" alt="WeCom20250307-232306@2x" src="https://github.com/user-attachments/assets/91f6a921-a769-4bbe-9f7d-7c777cf5617e" />
<img width="1458" alt="WeCom20250307-232325@2x" src="https://github.com/user-attachments/assets/cd98b426-510b-4ed0-b30c-8de58e08e913" />
<img width="1458" alt="WeCom20250307-232317@2x" src="https://github.com/user-attachments/assets/4939b2e6-9973-4584-899c-a71ccea693f9" />


## 功能特性

### 代码质量分析
- 代码风格检查
- 代码结构分析
- 代码复杂度评估
- 代码冗余检测
- 最佳实践建议

### 性能优化建议
- 性能瓶颈识别
- 资源使用分析
- 优化建议生成
- 性能优化前后对比

### 安全漏洞检测
- 常见安全漏洞扫描
- 依赖包安全检查
- 安全风险等级评估
- 修复建议提供

### 符号解析与导航
- 代码符号提取
- 跨文件引用分析
- 智能代码导航
- 符号依赖图谱生成

### 规则管理系统
- 自定义分析规则
- 规则模板库
- 规则优先级设置
- 规则效果评估

## 技术栈

- **前端框架**: Vue 3 (组合式API)
- **构建工具**: Vite
- **UI框架**: Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **代码分析**: 自研符号解析引擎
- **国际化**: Vue-i18n (计划中)
- **测试**: Vitest (计划中)

## 系统架构

```
前端 (Vue.js) <---> 后端 API (Go) <---> AI 服务
    |                   |
    |                   |
    V                   V
用户界面             数据库存储
```

## 开发指南

### 前提条件

- Node.js 16+
- npm 或 yarn
- Git

### 安装

```bash
# 克隆项目
git clone https://github.com/MochizukiSec/AI-Code-Frontend.git
cd AI-Code-Frontend

# 安装依赖
npm install
```

### 环境配置

创建 `.env.local` 文件，添加以下配置（根据实际情况修改）:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000
```

### 开发

```bash
# 启动开发服务器
npm run dev
```

### 构建

```bash
# 类型检查和构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码规范

本项目使用 ESLint 和 Prettier 进行代码规范检查和格式化：

```bash
# 运行 linter
npm run lint

# 格式化代码
npm run format
```

## API集成

前端通过RESTful API与后端通信。主要API端点包括：

- `/api/v1/auth` - 用户认证
- `/api/v1/code-analysis` - 代码分析
- `/api/v1/symbols` - 符号解析
- `/api/v1/ai` - AI模型管理
- `/api/v1/rules` - 规则管理

详细的API文档可在启动后端服务后访问：`http://localhost:8080/api/docs`

## 部署指南

### Docker部署

```bash
# 构建Docker镜像
docker build -t ai-code-frontend .

# 运行容器
docker run -d -p 80:80 --name ai-code-frontend ai-code-frontend
```

### 标准部署

1. 运行 `npm run build` 生成 `dist` 目录
2. 将 `dist` 目录部署到任何静态文件服务器（如Nginx、Apache等）
3. 确保正确配置了API端点和其他环境变量

### 示例Nginx配置

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://your-backend-api:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 项目结构

```
├── public/             # 静态资源
├── src/
│   ├── assets/         # 图片、样式等资源
│   │   ├── analysis/   # 分析相关组件
│   │   └── rules/      # 规则相关组件
│   ├── core/           # 核心功能模块
│   │   └── symbol-resolver/ # 符号解析引擎
│   ├── router/         # 路由配置
│   ├── services/       # API服务
│   ├── stores/         # Pinia状态仓库
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   │   └── auth/       # 认证相关页面
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .env                # 环境变量
├── index.html          # HTML模板
├── package.json        # 包管理配置
├── tailwind.config.js  # Tailwind配置
└── vite.config.js      # Vite配置
```

## 贡献指南

1. Fork此仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

项目负责人: Liam
