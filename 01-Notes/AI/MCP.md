---
study_status: "学习中"
---

# Model Context Protocol（MCP）

## 为什么需要 MCP

- MCP 是一个开放协议，用来把“模型需要的上下文”和“可调用工具”标准化并与模型解耦。
- 可以把它理解为 LLM 的“USB-C 接口”：任何应用都能通过统一的协议，暴露数据源、工具和提示模板给模型或智能体。
- 作用：降低集成成本、提升可移植性与安全性，让不同模型或应用之间共享同一套上下文与工具能力。

## 核心组件与原理

- 客户端（Client）：运行 AI 应用或代理的一侧，负责初始化连接、声明自身能力（capabilities），并向服务端发起调用（例如工具、提示、资源读取、采样）。
- 服务端（Server）：提供上下文与能力的一侧，暴露资源（如文件/数据库）、提示库（prompts）、工具（tools）等。
- 传输（Transport）：常见为 Stdio（本地进程标准输入/输出）、HTTP+SSE、WebSocket 等。协议层采用 JSON-RPC 2.0 双向消息模型。
- 能力（Capabilities）：按模块声明与协作，主要包括：
  - tools：列出与调用工具，工具输入采用精简 JSON Schema（扁平对象+原始类型）。
  - resources：按 `uri` 读取资源内容，返回文本或其他类型。
  - prompts：列出/获取提示模板，生成结构化消息供模型使用。
  - sampling：客户端侧触发模型生成（“把模型调用抽象成能力”）。
  - elicitation：面向用户的表单式信息收集（声明期望字段，客户端引导用户填写）。

## 整体架构图

```mermaid
architecture-beta
    group client_side(cloud)[Client Side]
    group transport_layer(cloud)[Transport Layer]
    group server_side(cloud)[Server Side]

    service app(server)[MCP Host] in client_side
    service client(internet)[MCP Client] in client_side
    
    service stdio_transport(disk)[stdio] in transport_layer
    service http_transport(internet)[HTTP with SSE] in transport_layer
    
    service server(server)[MCP Server] in server_side
    service resources(database)[Resources] in server_side
    service tools(disk)[Tools] in server_side
    service prompts(disk)[Prompts] in server_side

    app:B -- T:client
    
    client:R -- L:stdio_transport
    client:R -- L:http_transport
    
    stdio_transport:R -- L:server
    http_transport:R -- L:server
    
    server:R -- L:resources
    server:R -- L:tools
    server:R -- L:prompts
```

## 输入/输出与约束

- 工具输入 Schema：扁平对象、原始类型（string/number/integer/boolean），支持 title/description/min/max/format 等基本校验；不支持嵌套对象或数组。
- 工具输出内容：以 `content[]` 表示，每个 item 带类型（例如 `text`、`image`），文本项示例：`{ type: "text", text: "..." }`。
- 资源文本结构：包含 `uri`、可选 `mimeType`、`text` 字段及可选 `_meta` 元数据。

## 交互时序图

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Client as 💻 MCP Client
    participant Server as 🔧 MCP Server
    participant External as 🌐 External System

    rect rgb(240, 248, 255)
    Note over User,Server: 🚀 Initialization Phase
    User->>Client: Start application
    activate Client
    Client->>Server: Initialize (declare capabilities)
    activate Server
    Note right of Server: Validate capabilities<br/>and establish session
    Server-->>Client: Handshake acknowledgment<br/>Session established
    deactivate Server
    Client-->>User: ✅ System ready
    deactivate Client
    end

    rect rgb(255, 250, 240)
    Note over Client,Server: 🔍 Capability Discovery Phase
    activate Client
    Client->>Server: listTools request
    activate Server
    Server-->>Client: Available tools<br/>(with input schemas)
    deactivate Server
    Client->>Server: listPrompts request
    activate Server
    Server-->>Client: Available prompts<br/>(with parameters)
    deactivate Server
    deactivate Client
    end

    rect rgb(240, 255, 240)
    Note over User,External: 🎯 User Request Execution Phase
    Note over Client,Server: ⚠️ ONE of the following will execute per request
    User->>Client: 📝 Send user request
    activate Client
    
    alt Capability 1: Call Tool
        Note over Client,External: Execute tool function
        Client->>Server: callTool {name, arguments}
        activate Server
        Server->>External: Execute external operation
        activate External
        Note right of External: Process request<br/>Access resources
        External-->>Server: Return data / result
        deactivate External
        Server-->>Client: Response content[]
        deactivate Server
    else Capability 2: Read Resource
        Note over Client,Server: Read resource content
        Client->>Server: resources/read {uri}
        activate Server
        Note right of Server: Read file or resource
        Server-->>Client: TextResourceContents
        deactivate Server
    else Capability 3: Get Prompt Template
        Note over Client,Server: Retrieve prompt template
        Client->>Server: prompts/get {name, args}
        activate Server
        Note right of Server: Retrieve prompt template
        Server-->>Client: Structured messages[]
        deactivate Server
    end
    
    opt Optional: Server Requests AI Assistance
        Note over Server,User: Server needs intelligent decision
        Server->>Client: sampling/createMessage
        activate Server
        Note over Client,User: Human review required
        Client->>User: Review sampling request
        User-->>Client: Approve or modify
        Client->>Client: Send to LLM
        Note right of Client: LLM generates response
        Client->>User: Review LLM response
        User-->>Client: Approve or modify
        Client-->>Server: Approved sampling result
        deactivate Server
    end
    
    Client-->>User: 📊 Display final result
    deactivate Client
    end
    
    rect rgb(255, 240, 240)
    Note over Server,Client: ⚠️ Error Handling
    alt Error or Timeout Occurs
        activate Server
        Server-->>Client: ❌ Error response<br/>content[] + isError: true
        deactivate Server
        activate Client
        Client-->>User: Show error message
        deactivate Client
    end
    end
```

## 安全与权限

- 推荐遵循 OAuth 2.1 最佳实践，客户端应使用 PKCE；令牌轮换与生命周期限制为可取策略。
- 服务端应对访问范围进行显式限制（例如：允许目录白名单、限制环境变量/API Key、对外部 API 做速率与错误保护）。

## 运行与部署

- 本地调试：Stdio 传输，客户端与服务端均作为进程运行，便于快速开发工具与资源适配。
- 远程部署：HTTP+SSE 或 WebSocket 传输；可做服务端扩展为 API 网关，把内部 REST/数据库能力通过 MCP 暴露给多种客户端（包含桌面 App，如 Claude Desktop 的 `claude_desktop_config.json`）。

## 参考链接

- 官方介绍（Introduction）：(<https://modelcontextprotocol.io/docs/getting-started/intro>)
