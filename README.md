# AI聊天应用

一个基于Next.js构建的现代化、功能完整的AI聊天应用，支持多会话管理和上下文对话。

## 功能特性

- 💬 **上下文对话**：AI回复基于完整的对话历史
- 💡 **多会话管理**：创建和切换多个聊天会话
- 📱 **响应式设计**：在桌面和移动设备上无缝工作
- 🔒 **安全认证**：使用Logto提供安全的用户认证
- ⚡ **流式响应**：实时AI响应，采用流式技术
- 🎨 **现代化UI**：使用Tailwind CSS构建的简洁、直观的界面

## 技术栈

- **框架**：[Next.js 14](https://nextjs.org)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **UI组件**：shadcn/ui
- **AI集成**：OpenAI API
- **认证**：Logto
- **存储**：本地存储

## 快速开始

### 前置条件

- Node.js 18.12.0 或更高版本
- npm 或 yarn
- OpenAI API密钥
- Logto账户和配置

### 安装步骤

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

在根目录创建 `.env.local` 文件，并添加以下内容：

```env
# OpenAI配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=your-openai-base-url

# Logto配置
LOGTO_ENDPOINT=your-logto-endpoint
LOGTO_APP_ID=your-logto-app-id
LOGTO_APP_SECRET=your-logto-app-secret
LOGTO_COOKIE_SECRET=your-logto-cookie-secret
```

3. 运行开发服务器：

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 代理配置（可选）

如果需要使用代理访问OpenAI API，可以使用代理设置运行开发服务器：

```bash
npm run dev:proxy
```

## 项目结构

```
├── app/
│   ├── api/
│   │   └── chat/           # 聊天API端点
│   ├── auth/               # 认证页面
│   ├── chat/               # 主聊天页面
│   └── actions.ts          # 服务器操作
├── components/             # React组件
│   ├── ui/                 # shadcn/ui组件
│   ├── ChatContainer.tsx   # 主聊天容器
│   ├── ChatInterface.tsx   # 聊天界面
│   └── ChatList.tsx        # 聊天会话列表
├── lib/                    # 工具函数
├── types/                  # TypeScript类型定义
└── public/                 # 静态资源
```

## 使用说明

1. **开始对话**：在输入框中输入消息，按Enter键或点击发送按钮
2. **创建新会话**：点击侧边栏中的"新建聊天"按钮
3. **切换会话**：点击侧边栏中的任意会话进行切换
4. **删除会话**：将鼠标悬停在会话上，点击删除按钮
5. **编辑会话标题**：点击聊天头部的"编辑标题"按钮

## API端点

### POST /api/chat

处理聊天请求，返回流式AI响应。

**请求体**：
```json
{
  "messages": [
    {
      "id": "string",
      "content": "string",
      "isUser": boolean,
      "timestamp": "date"
    }
  ]
}
```

**响应**：
- 流式 text/plain 响应，包含AI生成的内容

## 部署

部署Next.js应用最简单的方法是使用Next.js创建者提供的[Vercel平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

有关更多详细信息，请查看我们的[Next.js部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交Pull Request。
