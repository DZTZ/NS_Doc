# NS_BlueprintToText

## 插件简介

NS_BlueprintToText 是一款为了快速理解项目内容而设计的插件，提供两大核心功能：

1. **蓝图转文本**：将蓝图资产导出为 AI 可读的文本格式，便于使用 AI 工具分析和理解蓝图内容
2. **批量翻译**：快速翻译蓝图中的注释，支持本地大语言模型（Ollama、llama.cpp 等）

## 主要特性

- 🔄 支持多种资产类型：普通蓝图、动画蓝图、数据表
- 📝 提取完整的蓝图结构：组件、变量、函数、节点、注释
- 🌐 批量翻译蓝图注释，支持文件夹和选中资产
- 🤖 兼容本地 AI 模型（Ollama、llama.cpp 等）
- ⚡ 智能重试机制，确保翻译稳定性
- 📦 导出为纯文本格式，易于 AI 处理


## 功能详解

### 1. 蓝图转文本

将蓝图资产导出为文本格式，提取以下内容：
组件、变量、函数、节点信息、注释、折叠节点


#### 使用方法
1. 在内容浏览器中右键点击文件夹或单个蓝图文件
2. 选择 **`Blueprint To Text`**
3. 插件会自动处理文件夹中的所有蓝图资产

![导出图片](../../images/ns-blueprinttotext/folder-export.png)


#### 导出结果

导出的文本文件保存在：`Content/BlueprintToText/` 文件格式为 `.txt`

### 2. 批量翻译注释

使用本地大语言模型批量翻译蓝图中的注释，支持多种语言对。

#### 配置翻译设置

1. 打开 **编辑 > 项目设置**
2. 找到 **Plugins > NS Blueprint To Text**
3. 配置以下参数：

![翻译设置](../../images/ns-blueprinttotext/translation-settings.png)

**配置项说明：**

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| HTTP API URL | 翻译服务的 API 地址 | `http://localhost:11434/api/generate` |
| Model Name | 使用的模型名称 | `gemma4:e4b` |
| Source Language | 源语言 | `English` |
| Target Language | 目标语言 | `Chinese` |
| Retry Count | 请求失败时的重试次数 | `2` |
| Request Timeout | 请求超时时间（秒） | `10` |

#### 使用方法

1. 在内容浏览器中右键点击文件夹或单个蓝图文件
2. 选择 **Translate Blueprint Comments**
3. 插件会自动翻译文件夹中所有蓝图的注释

![文件夹翻译](../../images/ns-blueprinttotext/folder-translate.png)


#### 翻译结果

翻译后的注释会直接更新到蓝图节点上，格式为：

![翻译结果](../../images/ns-blueprinttotext/translation-result.png)

#### 翻译特性

- ✅ 自动去重：相同的注释只翻译一次
- ✅ 智能过滤：跳过纯数字、符号的注释
- ✅ 顺序处理：按顺序翻译，避免 API 过载
- ✅ 自动重试：网络错误或超时自动重试
- ✅ 实时通知：显示翻译进度和结果

## 支持的 AI 模型

插件兼容所有支持 OpenAI 风格 API 的本地模型服务：

### Ollama

1. 安装 Ollama：https://ollama.ai/
2. 下载模型：`ollama pull gemma4:e4b`
3. 启动服务：`ollama serve`
4. 配置 URL：`http://localhost:11434/api/generate`

### llama.cpp

1. 编译 llama.cpp 服务器
2. 启动服务：`./server -m model.gguf --port 8080`
3. 配置 URL：`http://localhost:8080/completion`

### 其他兼容服务

任何支持以下 JSON 格式的服务都可以使用：

**请求格式：**
```json
{
  "model": "model-name",
  "prompt": "翻译文本",
  "stream": false
}
```

**响应格式：**
```json
{
  "response": "翻译结果"
}
```

## 使用场景

### 场景 1：AI 辅助蓝图分析

将复杂的蓝图导出为文本，使用 ChatGPT、Claude 等 AI 工具分析：

1. 导出蓝图为文本
2. 将文本内容复制到 AI 对话中
3. 询问 AI 关于蓝图逻辑、优化建议等

### 场景 2：多语言团队协作

团队成员使用不同语言时，快速翻译蓝图注释：

1. 配置源语言和目标语言
2. 批量翻译项目中的所有蓝图
3. 团队成员可以看到双语注释

### 场景 3：文档生成

导出蓝图内容用于生成项目文档：

1. 导出所有蓝图为文本
2. 使用脚本或 AI 工具生成文档
3. 自动化文档更新流程

## 注意事项

1. **翻译服务**：需要本地运行 AI 模型服务（如 Ollama）
2. **网络连接**：确保编辑器可以访问配置的 API 地址
3. **模型选择**：建议使用轻量级模型以提高翻译速度
4. **蓝图保存**：翻译完成后会自动标记蓝图为已修改，记得保存
5. **大批量翻译**：翻译大量蓝图时请耐心等待，插件会顺序处理避免 API 过载

## 常见问题

### Q: 翻译失败怎么办？

A: 检查以下几点：
- AI 模型服务是否正常运行
- API URL 配置是否正确
- 网络连接是否正常
- 查看输出日志获取详细错误信息

### Q: 支持哪些蓝图类型？

A: 支持以下类型：
- 普通蓝图（Blueprint）
- 动画蓝图（Animation Blueprint）
- 数据表（Data Table）

### Q: 导出的文本文件在哪里？

A: 导出文件保存在项目的 `Content/BlueprintToText/` 目录下。


## 技术支持

- 插件版本：1.0
- 引擎版本：Unreal Engine 5.6+
- 开发者：NodeSmith

## 更新日志

### v1.0（初始版本）

- ✅ 蓝图转文本功能
- ✅ 批量翻译注释功能
- ✅ 支持 Ollama 等本地 AI 模型
- ✅ 智能重试机制
- ✅ 文件夹和资产级别操作
