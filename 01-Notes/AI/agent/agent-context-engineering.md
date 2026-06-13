---
type: Note
status: Active
related_to:
  - "[[agent-learning-checklist]]"
  - "[[agent-prompt-engineering]]"
  - "[[agent-memory]]"
---

# Agent Context 工程

**Context Engineering（上下文工程）** 是 2024-2025 年 Agent 工程领域兴起的新概念。如果说 Prompt 工程关注"如何提问"，那么 Context 工程关注"**如何为 LLM 准备完整、相关、高效的上下文**"。

> "Prompt engineering is a subset of context engineering."  — Andrej Karpathy

## 1. 为什么 Context 工程重要

随着 Agent 进入生产环境，遇到的核心矛盾是：

```
┌──────────────────────────────────────────────┐
│   LLM 能力上限 ≠ Agent 实际表现               │
│                                              │
│   失败案例分析：                               │
│   - 60%+ 失败源于"上下文不够"或"上下文太脏"     │
│   - LLM 自身没出错，是输入信息没准备好          │
└──────────────────────────────────────────────┘
```

Context 工程的目标：
- **足够（Complete）**：关键信息必须在窗口里
- **相关（Relevant）**：去除噪声，保留高价值内容
- **高效（Efficient）**：在 Token 预算内最大化信息密度

## 2. Context 工程 vs Prompt 工程

| 维度 | Prompt 工程 | Context 工程 |
| :--- | :--- | :--- |
| 范围 | 单次输入的设计 | 完整上下文窗口的管理 |
| 主要问题 | 如何提问 | 如何选择/组织信息 |
| 核心技术 | 模板、Few-shot、CoT | RAG、压缩、缓存、检索 |
| 主要参与者 | LLM 提示设计者 | 整个 Agent 系统 |
| 关注点 | 语义清晰 | 信息完备 + 成本可控 |

详见 [[agent-prompt-engineering]]。

## 3. Context 的组成

一个 Agent 调用 LLM 时的完整上下文通常包括：

```
┌─────────────────────────────────────┐
│ ① System Prompt                     │ ← 角色、规则、约束
├─────────────────────────────────────┤
│ ② 工具描述 (Tool Schemas)           │ ← Function Calling
├─────────────────────────────────────┤
│ ③ 长期记忆检索结果 (RAG)             │ ← 知识/经验
├─────────────────────────────────────┤
│ ④ 短期记忆 / 对话历史                │ ← Buffer
├─────────────────────────────────────┤
│ ⑤ 工具调用轨迹 (Scratchpad)         │ ← ReAct 中间步骤
├─────────────────────────────────────┤
│ ⑥ 当前用户输入                       │ ← 本轮任务
└─────────────────────────────────────┘
```

**Context 工程的核心问题**：在 Token 预算内，如何动态决定每个模块放什么、放多少、放哪个位置。

## 4. 上下文窗口管理策略

### 4.1 截断（Truncation）

最简单：超出窗口时丢弃最旧的内容。

- ✅ 实现简单
- ❌ 可能丢失关键信息（系统指令、初始目标）

### 4.2 摘要（Summarization）

用 LLM 把历史对话压缩成摘要：

```
对话历史超过 8K → 调用 LLM 总结成 1K 摘要 → 替换原文
```

- ✅ 保留信息密度
- ❌ 摘要本身可能丢失细节
- 实现：`ConversationSummaryBufferMemory`（详见 [[agent-memory]]）

### 4.3 检索（Retrieval）

不预先放入，而是按需检索：

```
对话历史 → 全部存向量库
当前问题 → 检索相关历史片段 → 注入 Prompt
```

适用于超长对话、文档库等场景。

### 4.4 分级缓存

把信息按"必须 / 重要 / 可选"分级：

```
Always-in:    系统指令、当前任务（不可丢）
Conditional:  工具描述（用到才放）
On-demand:    RAG 检索结果（按需注入）
Volatile:     旧对话（优先丢弃或压缩）
```

## 5. KV Cache 与 Prefix Caching

这是 Context 工程的**性能优化层**，对生产 Agent 至关重要。

### 5.1 原理

LLM 推理时，前缀相同的输入可以复用之前计算的 KV Cache，无需重新计算：

```
请求 1: [系统指令 + 对话 A] → 计算 KV Cache
请求 2: [系统指令 + 对话 B] → 复用前缀的 KV Cache，只算后半段
```

### 5.2 实践要点

- **保持前缀稳定**：系统指令、工具描述放最前面，且不要每次都变
- **可变内容放后面**：用户输入、时间戳等放最后
- **Anthropic Cache Control**：Claude API 显式支持 `cache_control` 标记
- **OpenAI Automatic Prefix Caching**：自动启用，前缀越长越固定，命中率越高

### 5.3 收益

| 指标 | 无缓存 | 命中缓存 |
| :--- | :--- | :--- |
| 延迟 | 基线 | 30-80% 降低 |
| 成本 | 基线 | 50-90% 降低 |

## 6. 长上下文（Long Context）的工程问题

随着模型上下文窗口扩展到 100K-2M，新的问题出现：

### 6.1 "Lost in the Middle"

**现象**：放在上下文中间的信息容易被模型忽略。

**对策**：
- 关键信息放**开头或结尾**
- 重要内容**重复出现**
- 用结构化标记（"## 重要", `<critical>` 标签）强调

### 6.2 信息过载

塞入大量无关信息反而降低准确率：

```
准确率
  ▲
  │     ╭─╮
  │   ╱     ╲___
  │ ╱            ─────
  └────────────────────→ Context Token 数
```

更多 ≠ 更好，需要做相关性过滤。

### 6.3 成本控制

100K context × 单次调用 = 高昂的成本和延迟。需要：

- 用小窗口 + RAG 替代大窗口塞文档
- 用 Prompt Caching 复用前缀
- 用更便宜的小模型做检索过滤

## 7. RAG 在 Context 工程中的定位

RAG 是 Context 工程最重要的实现手段之一：

```
不做 RAG：把整个文档库塞进上下文
        → 成本爆炸 + 信息淹没

做 RAG：按需检索 Top-K 片段注入
        → 信息密度高 + 成本可控
```

详细方案见 [[agent-memory]]。

## 8. 工程化清单

构建生产级 Agent Context 流水线时的检查项：

- [ ] 系统指令固化，前缀稳定，启用 Prompt Caching
- [ ] 工具描述按需注入（不是每次都全量塞）
- [ ] 长期记忆用 RAG 检索，不直接塞
- [ ] 对话历史超长时启用摘要或滚动窗口
- [ ] 关键信息放窗口首尾，避免 Lost-in-the-Middle
- [ ] 监控每次调用的 Context 组成、Token 用量
- [ ] 失败案例分析时区分"模型问题"和"上下文问题"

## 9. 进阶话题

### 9.1 Context Compression（上下文压缩）

用专门的压缩模型把长文本压缩成稠密表示：

- **LLMLingua**（微软）：Token 级别压缩，可降 20× 长度
- **Summary Chain**：分段摘要 + 总摘要

### 9.2 Hierarchical Context（分层上下文）

类似操作系统的内存分页：

```
L1: 当前活跃 Context（最快，最小）
L2: 摘要后的中期记忆（中速，中等）
L3: 完整对话日志（最慢，最大）
```

参考 MemGPT 架构（详见 [[agent-memory]]）。

### 9.3 Multi-Agent Context Sharing

多智能体场景下，如何在 Agent 之间高效传递上下文是一个开放问题：

- 共享一个全局 Context
- 各自维护私有 Context + 消息总线通信
- 详见 [[agent-engineering-practices]] 的多智能体部分

## 10. 学习要点

- ✅ Context 工程 ⊃ Prompt 工程，是更大的系统工程范畴
- ✅ 核心矛盾是"信息完备 vs Token 预算"的平衡
- ✅ KV Cache / Prefix Caching 是生产 Agent 的必修课
- ✅ 长上下文 ≠ 万能药，注意 Lost-in-the-Middle 和成本
- ✅ RAG 是 Context 工程的关键组件
- ✅ 失败归因要分清"模型不行"还是"上下文不行"

## 11. 延伸阅读

- 文章：*The rise of "context engineering"* — Andrej Karpathy
- 论文：*Lost in the Middle: How Language Models Use Long Contexts*
- 论文：*LLMLingua: Compressing Prompts for Accelerated Inference*
- 文档：Anthropic Prompt Caching、OpenAI Automatic Prefix Caching
