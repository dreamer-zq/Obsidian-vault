---
type: Note
status: Active
related_to:
  - "[[llm-agent-architecture]]"
  - "[[agent-planning]]"
  - "[[agent-memory]]"
  - "[[agent-tool-use]]"
  - "[[agent-prompt-engineering]]"
  - "[[agent-context-engineering]]"
  - "[[agent-engineering-practices]]"
---

# Agent 学习清单

本清单系统化整理基于 LLM 的智能体（Agent）相关知识，覆盖架构、规划、记忆、工具调用、Prompt/Context 工程及工程实践。原始材料来自 [[Extra01-参考答案]] 第 4 章。

## 学习路径建议

按以下顺序由浅入深，每个主题对应一篇独立笔记：

1. **架构基础** → [[llm-agent-architecture]]
2. **规划能力** → [[agent-planning]]
3. **记忆系统** → [[agent-memory]]
4. **工具调用** → [[agent-tool-use]]
5. **Prompt 工程** → [[agent-prompt-engineering]]
6. **Context 工程** → [[agent-context-engineering]]
7. **工程实践** → [[agent-engineering-practices]]

## 知识地图

```
┌─────────────────────────────────────────────────┐
│                  LLM Agent                      │
│                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │  Brain   │  │ Planning │  │  Memory  │    │
│   │  (LLM)   │  │ (CoT/    │  │ (短/长期) │    │
│   │          │  │  ToT/GoT)│  │          │    │
│   └──────────┘  └──────────┘  └──────────┘    │
│                                                 │
│   ┌──────────────────────────────────────┐     │
│   │     Tool Use (Function Calling)      │     │
│   └──────────────────────────────────────┘     │
│                                                 │
│   ┌──────────────────────────────────────┐     │
│   │   Prompt Eng + Context Eng (上下文)   │     │
│   └──────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
         ↓ 工程化落地 ↓
   框架选型 / 多智能体 / 安全 / 评估 / 微调
```

## 复习 Checklist

### 一、智能体架构（[[llm-agent-architecture]]）

- [ ] 能用自己的话定义"LLM Agent"，并区分它和"调用 LLM 的程序"
- [ ] 说出 Agent 的四大核心组件，并解释每个组件的职责
- [ ] 详细讲清楚 ReAct 的循环流程：`Thought → Action → Observation → ...`
- [ ] 解释 ReAct 中的 Thought 与 CoT 的关系与差异

### 二、规划能力（[[agent-planning]]）

- [ ] 区分隐式规划（CoT、ReAct）vs 显式搜索规划（ToT、GoT）
- [ ] 画出 ToT 思维树的搜索过程
- [ ] 解释 GoT 相对 ToT 的两个核心扩展：**合并** 和 **循环**
- [ ] 能够选择合适的规划方法应对不同任务类型
- [ ] 说出"任务分解规划"的实现方式与局限

### 三、记忆系统（[[agent-memory]]）

- [ ] 区分短期记忆和长期记忆的作用与实现
- [ ] 列举三种常用的对话历史缓冲策略（Buffer/Window/Summary）
- [ ] 描述基于向量数据库的长期记忆"写入-检索-使用"流程
- [ ] 说出至少 3 种向量数据库工具
- [ ] 知道何时该用知识图谱/SQL 而不是向量库

### 四、Tool Use（[[agent-tool-use]]）

- [ ] 描述 Function Calling 的 5 个完整步骤
- [ ] 能写出一个标准的 Function Schema（JSON Schema 格式）
- [ ] 解释为什么"函数描述"对调用准确性至关重要
- [ ] 了解 MCP（Model Context Protocol）及其与 Function Calling 的关系
- [ ] 知道如何处理工具调用失败、参数错误的常见错误模式

### 五、Prompt 工程（[[agent-prompt-engineering]]）

- [ ] 掌握 Zero-shot / Few-shot / CoT Prompting 的差异
- [ ] 能写出结构化 Prompt 模板（角色、任务、约束、输出格式）
- [ ] 了解 Self-Consistency、Self-Refine、Reflexion 等进阶技巧
- [ ] 知道如何防御 Prompt Injection
- [ ] 学会 Prompt 的迭代调试方法

### 六、Context 工程（[[agent-context-engineering]]）

- [ ] 理解"Context Engineering"概念以及它与 Prompt Engineering 的区别
- [ ] 掌握上下文窗口管理的常见策略：截断、摘要、检索、缓存
- [ ] 了解 RAG 在 Context 工程中的定位
- [ ] 理解 KV Cache 与 Prefix Caching 的工程价值
- [ ] 学会如何为长任务设计上下文压缩与传递策略

### 七、工程实践（[[agent-engineering-practices]]）

- [ ] 能对比 LangChain vs LlamaIndex vs AutoGen 的差异并给出选型决策
- [ ] 列出复杂 Agent 落地的 4 大挑战及对应解法
- [ ] 解释多智能体协作的优势与新引入的复杂性
- [ ] 区分"软件 Agent"与"具身 Agent"的 5 个本质差异
- [ ] 了解 A2A 协议的定位及其与单 Agent 框架的抽象层次差异
- [ ] 知道 Agent 安全对齐的 6 类保障方法
- [ ] 描述如何为 Agent 微调收集"决策轨迹"数据
- [ ] 给出 Agent 评估的三大维度指标体系

## 延伸阅读

- [[Superpowers]] — AI 编程 Agent 工作流系统实例
- [[Extra01-参考答案]] — 原始面试参考答案
