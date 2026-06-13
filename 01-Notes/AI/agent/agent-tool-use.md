---
type: Note
status: Active
related_to:
  - "[[agent-learning-checklist]]"
  - "[[llm-agent-architecture]]"
  - "[[agent-prompt-engineering]]"
---

# Agent Tool Use 与 Function Calling

Tool Use 是让 LLM 从纯粹的"语言模型"转变为"行动执行者"的关键能力。核心是让 LLM **理解何时需要使用工具**，以及**如何以结构化方式表达使用哪个工具、传递什么参数**。

## 1. 为什么需要工具

LLM 本身存在三类局限：

| 局限 | 例子 | 工具的补救 |
| :--- | :--- | :--- |
| 无法获取实时信息 | "今天的股价" | Search、API |
| 无法执行精确计算 | "1349 × 7821" | Code Interpreter、Calculator |
| 无法影响外部世界 | "发送邮件" | Email API、文件系统 |

Tool Use 把 LLM 从"知识库"扩展为"行动者"。

## 2. Function Calling 的 5 步流程

Function Calling 是目前最主流的工具调用实现方式。

```
┌─────────────────────────────────────────────┐
│ ① 工具定义与注册                              │
│   用 JSON Schema 描述函数：名称、说明、参数    │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ ② LLM 决策与意图识别                          │
│   把用户问题 + 工具列表一起送给 LLM            │
│   LLM 判断是否需要调用、调用哪个                │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ ③ 生成结构化调用指令                          │
│   LLM 输出 JSON：函数名 + 参数                │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ ④ 外部执行与结果返回                          │
│   Orchestrator 解析 → 真实调用函数 → 拿到结果  │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ ⑤ 整合结果并生成最终回复                       │
│   结果回灌 LLM → 生成自然语言回答              │
└─────────────────────────────────────────────┘
```

### 2.1 步骤 ①：工具定义

用 JSON Schema 描述工具，关键字段：

```json
{
  "name": "get_current_weather",
  "description": "获取指定城市的实时天气信息",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "城市名，例如 'Singapore'"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "温度单位"
      }
    },
    "required": ["location"]
  }
}
```

**关键经验**：
- `description` 字段**决定调用准确性**——LLM 是根据它判断是否使用这个工具
- 参数描述要清晰、给出例子
- 必填项用 `required` 明确标注

### 2.2 步骤 ②③：LLM 输出结构化调用

经过指令微调的 LLM（GPT-4、Claude、Qwen 等）能理解工具描述，并输出特定格式：

```json
{
  "tool_call": {
    "name": "get_current_weather",
    "arguments": {
      "location": "Singapore",
      "unit": "celsius"
    }
  }
}
```

### 2.3 步骤 ④：实际执行

Orchestrator（Agent 控制器）负责：

1. 捕获 LLM 的工具调用输出
2. 解析 JSON，找到函数和参数
3. 在外部环境（沙箱、生产环境）实际调用
4. 处理异常、超时、错误

### 2.4 步骤 ⑤：结果回灌

```
LLM 输入历史 + Tool Call + Tool Result
              ↓
       生成自然语言回答
              ↓
   "今天新加坡晴天，32°C"
```

## 3. 工具设计的最佳实践

### 3.1 工具粒度

- ❌ 不要：一个工具做太多事（`do_everything()`）
- ❌ 不要：工具过于细碎（一个简单任务需要调 10 次）
- ✅ 应该：每个工具职责单一、命名直观

### 3.2 工具描述

- 用**清晰的自然语言**描述功能，避免行话
- 给出**典型用例**，例如："用于查询股票实时价格，输入股票代码"
- 明确**不适用场景**，例如："不支持历史价格查询"

### 3.3 参数设计

- 优先使用**枚举值**而不是自由字符串
- 关键参数标记为 `required`
- 给参数加 `description` 和示例
- 数值类型给出合理的范围/单位

### 3.4 错误处理

- 工具应返回**结构化错误信息**，方便 LLM 理解和重试
- 区分"参数错误"vs"业务失败"vs"系统异常"
- 让 LLM 能从错误信息中知道下一步怎么做

## 4. 常见错误模式

| 错误 | 表现 | 解决 |
| :--- | :--- | :--- |
| 工具描述不清 | LLM 选错工具 | 加例子、明确边界 |
| 参数幻觉 | LLM 编造参数值 | 强制 enum、加校验 |
| 死循环调用 | 同一工具反复调用 | 加调用次数限制、检测重复 |
| 忽视工具结果 | LLM 不用观察结果 | Prompt 强调"基于观察回答" |
| 工具失败无兜底 | 一次失败任务终止 | 重试机制、备用方案 |

## 5. MCP（Model Context Protocol）

Anthropic 提出的开放协议，把工具调用标准化为 **Server-Client** 架构。

```
┌───────────────┐         MCP          ┌──────────────┐
│  LLM Client   │ ←──────────────────→ │  MCP Server  │
│ (Claude/IDE)  │   标准化的工具协议    │ (工具提供方)  │
└───────────────┘                       └──────────────┘
                                              │
                                              ↓
                                       ┌──────────────┐
                                       │ 实际工具/数据  │
                                       │ (DB/API/文件) │
                                       └──────────────┘
```

### 5.1 MCP vs Function Calling

| 维度 | Function Calling | MCP |
| :--- | :--- | :--- |
| 定位 | 模型能力（如何调用） | 协议标准（如何连接） |
| 范围 | LLM 内部输出格式 | LLM 与工具间的通信 |
| 工具复用 | 需要每个项目自己实现 | 一次实现，跨客户端复用 |
| 状态管理 | 通常无状态 | 支持 Session、长连接 |

二者**互补**：MCP 在协议层定义如何"接入"工具，Function Calling 在模型层定义如何"调用"工具。

### 5.2 MCP 的核心概念

- **Tools**：函数调用（同 Function Calling）
- **Resources**：可读资源（如文件、数据库）
- **Prompts**：模板化的提示词

## 6. 工具集成的进阶模式

### 6.1 工具检索（Tool Retrieval）

当工具数量巨大（数百个）时，全部塞入 Prompt 不现实：

```
用户问题 → Embedding → 检索 Top-K 相关工具 → 注入 Prompt
```

### 6.2 工具组合（Tool Composition）

让 LLM 把多个原子工具组合成复杂任务：

```
get_weather(city) + get_flights(city) + send_email()
→ "查询新加坡天气，如果下雨就查询航班并通知我"
```

### 6.3 代码作为工具（Code as Action）

让 LLM 直接生成 Python/JS 代码并在沙箱执行（如 OpenAI Code Interpreter、Open Interpreter），通用性极强但安全风险更高。

## 7. 学习要点

- ✅ Function Calling = **"LLM 输出结构化 JSON" + "外部解析执行"**
- ✅ 工具描述质量 > 工具数量
- ✅ MCP 是协议标准，与 Function Calling 互补而非替代
- ✅ 工具粒度、错误处理是工程实践的两大难点
- ✅ 大规模工具集需要"工具检索"机制

## 8. 延伸阅读

- OpenAI Function Calling 官方文档
- Anthropic Model Context Protocol（MCP）规范
- 论文：*Toolformer: Language Models Can Teach Themselves to Use Tools*
- 论文：*Gorilla: LLM Connected with Massive APIs*
