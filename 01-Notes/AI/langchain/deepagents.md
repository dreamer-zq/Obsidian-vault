# DeepAgents 技术分享

## 概述

DeepAgents 是 LangChain 生态系统中的独立库，专门用于构建能够处理复杂多步骤任务的智能代理。它基于 LangGraph 构建，灵感来源于 Claude Code、Deep Research 和 Manus 等应用，集成了规划能力、文件系统管理和子代理生成等先进功能。

DeepAgents 的核心优势在于其模块化的中间件架构，使开发者能够灵活组合各种功能组件，构建适合特定业务场景的智能代理系统。

## 核心能力

### 1. 规划与任务分解

DeepAgents 内置 `write_todos` 工具，使代理能够将复杂任务分解为离散的执行步骤。这一能力包含以下特点：

- **智能任务分解**：自动将复杂任务拆分为可管理的子任务
- **进度跟踪**：实时监控任务执行状态和完成进度
- **动态调整**：根据新出现的信息自适应调整执行计划
- **可视化规划**：通过结构化的待办事项列表清晰展示执行路径

### 2. 上下文管理

文件系统工具集为代理提供了强大的上下文管理能力，有效解决了大语言模型上下文窗口限制的问题：

- **内存卸载**：将大量上下文信息卸载到文件系统中，避免上下文窗口溢出
- **变量长度结果处理**：支持处理返回可变长度结果的工具（如网络搜索、RAG等）
- **结构化存储**：通过文件系统实现信息的结构化组织和存储
- **快速检索**：支持高效的文件浏览和内容检索操作

### 3. 子代理生成

内置的 `task` 工具使代理能够生成专门的子代理，实现上下文隔离和专业化处理：

- **上下文隔离**：保持主代理上下文清洁的同时深入处理特定子任务
- **专业化分工**：为不同领域任务创建专门的子代理
- **并行处理**：支持多个子代理同时处理不同的任务片段
- **结果汇总**：子代理完成任务后向主代理返回简洁的处理结果

## 文件系统工具详解

DeepAgents 提供了完整的文件系统操作工具集，使代理能够像操作真实文件系统一样管理信息：

### 核心文件操作工具

#### `ls` - 文件列表

```python
# 列出文件系统中所有文件
ls()

# 列出特定目录下的文件
ls("/documents/")
```

#### `read_file` - 文件读取

```python
# 读取完整文件内容
read_file("/research/data.txt")

# 读取文件的指定行数范围
read_file("/logs/system.log", offset=100, limit=50)
```

#### `write_file` - 文件写入

```python
# 创建新文件并写入内容
write_file("/analysis/report.md", "# 分析报告\n\n## 概述\n...")

# 写入结构化数据
write_file("/data/config.json", json.dumps(config_data, indent=2))
```

#### `edit_file` - 文件编辑

```python
# 替换文件中的特定文本
edit_file("/config/settings.py", "old_value = 100", "new_value = 200")

# 替换所有匹配的文本
edit_file("/code/main.py", "print(", "logger.info(", replace_all=True)
```

### 文件系统后端架构

DeepAgents 采用可插拔的后端架构，支持多种存储方式：

#### StateBackend（默认）

- 将文件存储在图状态中
- 适用于短期会话和临时数据
- 生命周期与代理会话绑定

#### StoreBackend（长期存储）

- 通过 LangGraph 的 Store 实现跨会话持久化
- 支持跨线程共享记忆
- 适用于长期项目和持续学习场景

#### CompositeBackend（组合后端）

- 支持将不同路径路由到不同后端
- 实现混合存储策略
- 示例：将 `/memories/` 路径映射到长期存储

```python
from deepagents.middleware import FilesystemMiddleware
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend

# 配置组合后端
filesystem_middleware = FilesystemMiddleware(
    backend=lambda rt: CompositeBackend(
        default=StateBackend(rt),
        routes={"/memories/": StoreBackend(rt)}
    )
)
```

## 子代理（Subagents）

### 核心价值

子代理是 DeepAgents 架构中的关键组件，通过上下文隔离机制解决复杂任务处理中的核心挑战：

1. **上下文窗口管理**：防止主代理上下文被中间步骤和临时结果污染
2. **专业化处理**：为特定任务创建具有专门知识和工具的代理
3. **错误隔离**：子代理的错误不会影响主代理的执行状态
4. **结果抽象**：子代理返回简洁的结果，隐藏复杂的执行细节

#### 1. 通用子代理（General-purpose Subagent）

通用子代理是系统内置的临时子代理，具有以下特性：

**核心特点：**

- **按需动态创建**：当主代理调用 `task` 工具时自动创建
- **配置继承**：自动继承主代理的系统提示、工具集和模型
- **生命周期短暂**：任务完成后立即销毁，不保留状态
- **上下文隔离**：提供干净的执行环境，避免主代理上下文污染

**工作机制：**

```python
# 主代理调用通用子代理
result = agent.invoke({
    "messages": [{
        "role": "user", 
        "content": "请使用 task 工具处理这个复杂的数据分析任务"
    }]
})

# 系统内部流程：
# 1. 检测到 task 工具调用
# 2. 创建临时子代理实例（继承主代理配置）
# 3. 子代理独立执行任务
# 4. 返回简洁结果给主代理
# 5. 子代理实例销毁
```

**适用场景：**

- 复杂中间步骤处理
- 临时数据探索
- 需要上下文隔离的探索性任务

#### 2. 用户自定义子代理（User-defined Subagents）

用户自定义子代理需要显式配置，提供完全定制的能力：

**核心特点：**

- **完全独立配置**：必须显式定义系统提示、工具集和模型
- **持久化存在**：配置期间持续可用，不会自动销毁
- **专业化设计**：针对特定任务领域进行优化
- **显式调用**：通过名称直接调用，而非通过 task 工具

**配置示例：**

```python
# 定义天气查询子代理
weather_subagent = {
    "name": "weather",
    "description": "专门处理天气查询的子代理",
    "systemPrompt": "你是一个天气专家，使用工具获取准确的天气信息",
    "tools": [get_weather_tool, get_forecast_tool],
    "model": "gpt-4o",  # 可独立选择模型
    "middleware": []
}

# 高级 LangGraph 子代理
from deepagents import CompiledSubAgent
from langgraph.graph import StateGraph

def create_weather_graph():
    workflow = StateGraph(...)
    workflow.add_node("search", search_weather)
    workflow.add_node("analyze", analyze_data)
    workflow.add_node("format", format_result)
    workflow.add_edge("search", "analyze")
    workflow.add_edge("analyze", "format")
    workflow.set_entry_point("search")
    return workflow.compile()

weather_subagent = CompiledSubAgent(
    name="weather_advanced",
    description="高级天气分析子代理",
    runnable=create_weather_graph()
)
```

**关键原则：用户自定义子代理不会继承主代理配置**

用户自定义子代理必须显式定义所有属性：

1. **系统提示独立性**：必须定义自己的 `systemPrompt`
2. **工具集独立性**：必须显式指定 `tools` 数组
3. **模型可定制性**：可选择与主代理不同的模型

```python
# ✅ 正确：显式定义所有配置
research_subagent = {
    "name": "researcher",
    "description": "专业研究分析子代理",
    "systemPrompt": "你是研究专家，擅长深度分析和信息收集",
    "tools": [web_search_tool, data_analysis_tool],
    "model": "gpt-4o"
}

# ❌ 错误：期望继承主代理配置（不会生效）
```

### 子代理配置指南

#### 配置步骤

1. **定义子代理配置**

```python
# 基础配置模板
subagent_config = {
    "name": "子代理名称",
    "description": "子代理功能描述",
    "systemPrompt": "明确的系统提示",
    "tools": [tool1, tool2],  # 必需的工具数组
    "model": "gpt-4o",       # 可选，默认使用主代理模型
    "middleware": []         # 可选的中间件配置
}
```

2. **集成到主代理**

```python
from deepagents.middleware import SubAgentMiddleware

subagent_middleware = SubAgentMiddleware(
    default_model="claude-sonnet-4-5-20250929",
    default_tools=[],
    subagents=[subagent_config]
)
```

3. **调用子代理**

```python
# 通用子代理调用
agent.invoke({
    "messages": [{"role": "user", "content": "使用 task 工具处理任务"}]
})

# 自定义子代理调用
agent.invoke({
    "messages": [{"role": "user", "content": "使用 weather 子代理查询天气"}]
})
```

### 子代理最佳实践

#### 1. 子代理设计原则

**专业化分工**

```python
# ✅ 推荐：为不同领域创建专门子代理
researcher = {
    "name": "researcher",
    "systemPrompt": "你是研究专家，擅长数据收集和分析",
    "tools": [web_search, academic_search, data_analysis]
}

writer = {
    "name": "writer", 
    "systemPrompt": "你是写作专家，擅长撰写清晰的技术文档",
    "tools": [grammar_check, style_improve]
}
```

**职责单一**

```python
# ✅ 推荐：每个子代理专注一个核心功能
weather_subagent = {
    "name": "weather",
    "description": "专门处理天气查询",
    "systemPrompt": "你是天气专家，提供准确的天气信息"
}

# ❌ 避免：功能过于复杂的子代理
complex_subagent = {
    "name": "everything",
    "description": "处理所有任务",
    "systemPrompt": "你是万能专家，什么都会做"
}
```

#### 2. 性能优化建议

**合理使用通用子代理**

```python
# ✅ 推荐：用于临时性、探索性任务
agent.invoke({
    "messages": [{"role": "user", "content": "使用 task 工具分析这个数据文件"}]
})

# ✅ 推荐：用于需要上下文隔离的中间步骤
agent.invoke({
    "messages": [{"role": "user", "content": "使用 task 工具处理复杂的中间计算"}]
})
```

**有效使用自定义子代理**

```python
# ✅ 推荐：为重复性专业任务创建专用子代理
# 适用于：研究分析、文档撰写、数据处理等

# ❌ 避免：为一次性简单任务创建子代理
# 通用子代理更适合这种情况
```

#### 3. 配置管理策略

**模型选择**

```python
# 研究分析类：选择推理能力强的模型
researcher = {
    "model": "claude-sonnet-4-5-20250929",
    "systemPrompt": "你是研究专家，注重逻辑和分析"
}

# 创意写作类：选择创造性强的模型  
writer = {
    "model": "gpt-4o",
    "systemPrompt": "你是创意写作专家，注重表达和创意"
}
```

**工具组合**

```python
# ✅ 推荐：工具集围绕核心功能组织
weather_tools = [get_weather, get_forecast, weather_analysis]
research_tools = [web_search, academic_search, citation_manager]

# ❌ 避免：工具集过于分散或重复
```

#### 4. 错误处理与调试

**子代理内部错误隔离**

```python
# 子代理内部应该有完善的错误处理
weather_subagent = {
    "name": "weather",
    "systemPrompt": "你是天气专家。如果查询失败，返回清晰的错误信息",
    "tools": [robust_weather_tool]  # 包含错误处理的工具
}
```

**主代理错误恢复**

```python
# 主代理可以捕获子代理错误并调整策略
try:
    result = agent.invoke({"messages": [{"role": "user", "content": "使用 weather 查询"}]})
except SubAgentError:
    # 回退到通用子代理或其他策略
    result = agent.invoke({"messages": [{"role": "user", "content": "使用 task 工具查询天气"}]})
```

总结：**通用子代理是按需动态创建的临时实例，而非程序启动时自动创建的持久实体**。用户自定义子代理是完全独立的实体，不会继承主代理的任何配置。这种设计确保了每个子代理都能被精确地定制和优化，以适应其特定的任务需求。

## 人机交互（Human-in-the-Loop）

### 安全控制机制

人机交互中间件为代理操作提供了重要的安全层，特别适用于以下场景：

- **金融交易和转账**：需要人工确认的高风险操作
- **生产数据操作**：删除或修改重要数据前的确认
- **外部通信**：发送邮件或消息前的内容审核
- **系统配置更改**：可能影响系统运行的配置修改

### 中断配置策略

```python
from langchain.agents.middleware import HumanInTheLoopMiddleware

# 配置人机交互策略
hitl_middleware = HumanInTheLoopMiddleware(
    interrupt_on={
        # 完全控制：允许批准、编辑、拒绝
        "write_file": True,
        
        # 限制控制：只允许批准或拒绝，不允许编辑
        "execute_sql": {
            "allowed_decisions": ["approve", "reject"],
            "description": "🚨 SQL执行需要DBA审批"
        },
        
        # 安全操作：无需审批，自动执行
        "read_data": False,
        
        # 自定义消息前缀
        "send_email": {
            "allowed_decisions": ["approve", "edit", "reject"],
            "description": "📧 邮件发送需要内容确认"
        }
    },
    description_prefix="工具执行等待审批"
)
```

### 决策流程

1. **中断触发**：当代理调用需要审批的工具时，执行被中断
2. **状态保存**：使用 LangGraph 的持久化层保存图状态
3. **人工决策**：操作员可以选择批准、编辑或拒绝
4. **执行恢复**：根据决策结果恢复执行或终止操作

### 实际应用场景

```python
# 创建需要审批的代理
agent = create_agent(
    model="gpt-4o",
    tools=[send_email_tool, delete_database_tool, search_tool],
    middleware=[hitl_middleware],
    checkpointer=InMemorySaver()  # 支持状态持久化
)

# 执行需要审批的操作
config = {"configurable": {"thread_id": "secure_session_001"}}

# 代理将在发送邮件前暂停等待审批
result = agent.invoke({
    "messages": [{"role": "user", "content": "向团队发送项目进度邮件"}]
}, config)

# 人工审批后继续执行
from langgraph.types import Command
result = agent.invoke(
    Command({"resume": {"decisions": [{"type": "approve"}]}}),
    config
)
```

## 长期记忆（Long-term Memory）

### 记忆类型与作用域

DeepAgents 支持两种类型的记忆，基于不同的召回范围：

#### 短期记忆（线程作用域）

- **会话跟踪**：在当前会话中维护消息历史
- **状态管理**：作为代理状态的一部分由 LangGraph 管理
- **临时存储**：使用检查点（checkpointer）持久化到数据库
- **生命周期**：与特定会话线程绑定

#### 长期记忆（跨会话共享）

- **跨会话存储**：在不同会话间共享用户特定或应用级数据
- **任意召回**：可在任何时间和线程中召回记忆
- **自定义命名空间**：支持灵活的记忆组织和检索
- **持久化存储**：通过 Store 接口实现长期保存

### 记忆存储配置

```python
from langgraph.store.memory import InMemoryStore
from deepagents.middleware import FilesystemMiddleware
from deepagents.backends import StoreBackend

# 创建内存存储（生产环境使用数据库存储）
store = InMemoryStore()

# 配置长期记忆支持
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    store=store,  # 启用存储功能
    middleware=[
        FilesystemMiddleware(
            backend=lambda rt: CompositeBackend(
                default=StateBackend(rt),
                routes={"/memories/": StoreBackend(rt)}  # 记忆路径使用长期存储
            )
        )
    ]
)
```

### 记忆使用模式

#### 项目约定记忆

```python
# 存储项目约定
write_file("/memories/project-conventions.md", """
# 项目开发约定

## API 设计原则
- RESTful 设计风格
- 统一的响应格式
- 版本控制策略

## 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 单元测试覆盖率 > 80%
""")
```

#### 学习记忆更新

```python
# 记录新学习的模式
edit_file("/memories/lessons-learned.md", 
          "", 
          "\n## 2024-01-15\n学会了使用 CompositeBackend 实现混合存储策略")
```

#### 上下文检索

```python
# 在开始新任务前检索相关记忆
related_memories = grep_raw("数据库设计", "/memories/")
if related_memories:
    print("找到相关记忆，将基于以往经验进行处理")
```

## Deep Agents Middleware 架构

### 模块化设计哲学

DeepAgents 采用模块化的中间件架构，每个功能都作为独立的中间件实现。这种设计提供了以下优势：

- **可组合性**：可以根据需要添加或移除中间件
- **独立性**：每个中间件可以独立使用和测试
- **可扩展性**：易于开发自定义中间件
- **灵活性**：支持复杂的中间件组合和配置

### 核心中间件组件

#### TodoListMiddleware（任务列表中间件）

提供任务规划和跟踪功能：

- 内置 `write_todos` 工具
- 支持任务分解和进度管理
- 动态调整和更新任务计划

#### FilesystemMiddleware（文件系统中间件）

提供完整的文件系统操作能力：

- 文件读写编辑工具集
- 支持多种后端存储
- 短期和长期记忆管理

#### SubAgentMiddleware（子代理中间件）

支持子代理的创建和管理：

- 子代理定义和配置
- 上下文隔离机制
- 任务委托和结果汇总

### 自定义中间件开发

```python
from langchain.agents.middleware import BaseMiddleware

class CustomMiddleware(BaseMiddleware):
    def __init__(self, config=None):
        self.config = config or {}
        
    def before_tool_call(self, tool_call, state):
        # 工具调用前的处理
        print(f"准备调用工具: {tool_call['name']}")
        return tool_call
        
    def after_tool_call(self, tool_call, result, state):
        # 工具调用后的处理
        print(f"工具调用完成: {tool_call['name']}")
        return result
        
    def on_error(self, tool_call, error, state):
        # 错误处理
        print(f"工具调用错误: {error}")
        return {"error": str(error)}

# 使用自定义中间件
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    middleware=[
        TodoListMiddleware(),
        FilesystemMiddleware(),
        SubAgentMiddleware(subagents=[...]),
        CustomMiddleware({"debug": True})
    ]
)
```

### 中间件执行流程

1. **初始化阶段**：所有中间件按顺序初始化
2. **工具调用前**：执行 `before_tool_call` 钩子
3. **工具执行**：实际执行工具调用
4. **工具调用后**：执行 `after_tool_call` 钩子
5. **错误处理**：如发生错误，执行 `on_error` 钩子
6. **状态更新**：更新代理状态并准备下一步

## 代码示例与最佳实践

### 完整代理配置示例

```python
from langchain.agents import create_agent
from deepagents.middleware import (
    TodoListMiddleware,
    FilesystemMiddleware,
    SubAgentMiddleware,
    HumanInTheLoopMiddleware
)
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langgraph.store.memory import InMemoryStore
from langgraph.checkpoint.memory import InMemorySaver

# 创建存储和检查点
store = InMemoryStore()
checkpointer = InMemorySaver()

# 定义专业子代理
research_subagent = {
    "name": "researcher",
    "description": "专业研究分析子代理",
    "systemPrompt": "你是研究专家，擅长数据收集和分析",
    "tools": [web_search_tool, data_analysis_tool],
    "model": "gpt-4o"
}

writer_subagent = {
    "name": "writer", 
    "description": "专业写作子代理",
    "systemPrompt": "你是写作专家，擅长撰写清晰的技术文档",
    "tools": [grammar_check_tool, style_improve_tool],
    "model": "claude-sonnet-4-5-20250929"
}

# 配置人机交互
hitl_config = {
    "write_file": True,
    "send_email": {"allowed_decisions": ["approve", "reject"]},
    "delete_data": {"allowed_decisions": ["approve", "reject"]},
    "search_web": False
}

# 创建完整的 DeepAgent
agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[web_search_tool, send_email_tool, file_operation_tool],
    store=store,
    checkpointer=checkpointer,
    middleware=[
        # 任务规划
        TodoListMiddleware(),
        
        # 文件系统（支持长期记忆）
        FilesystemMiddleware(
            backend=lambda rt: CompositeBackend(
                default=StateBackend(rt),
                routes={
                    "/memories/": StoreBackend(rt),
                    "/projects/": StoreBackend(rt)
                }
            )
        ),
        
        # 子代理管理
        SubAgentMiddleware(
            default_model="claude-sonnet-4-5-20250929",
            subagents=[research_subagent, writer_subagent]
        ),
        
        # 人机交互控制
        HumanInTheLoopMiddleware(
            interrupt_on=hitl_config,
            description_prefix="操作需要审批"
        )
    ]
)

# 使用代理处理复杂任务
config = {"configurable": {"thread_id": "research_project_001"}}

result = agent.invoke({
    "messages": [{
        "role": "user", 
        "content": "研究最新的 LangChain 发展，写一份技术分析报告"
    }]
}, config)
```

### 最佳实践建议

#### 1. 任务规划策略

- **明确目标**：在开始任务前明确最终目标和交付物
- **合理分解**：将复杂任务分解为 3-7 个可管理的子任务
- **优先级排序**：按照逻辑依赖和重要性安排任务顺序
- **灵活调整**：根据执行过程中的发现动态调整计划

#### 2. 文件系统使用

- **结构化组织**：使用清晰的目录结构组织信息
- **命名规范**：采用有意义的文件名和路径命名
- **版本控制**：重要文档保留历史版本
- **定期清理**：清理不再需要的临时文件

#### 3. 子代理设计

- **专业化分工**：为不同领域创建专门的子代理
- **清晰接口**：定义明确的输入输出接口
- **错误处理**：子代理内部要有完善的错误处理
- **结果抽象**：返回简洁有用的结果，避免信息过载

#### 4. 记忆管理

- **分层存储**：短期记忆和长期记忆分别处理
- **主题组织**：按主题和项目组织记忆内容
- **定期整理**：定期回顾和整理记忆内容
- **隐私保护**：敏感信息要进行适当的脱敏处理

#### 5. 安全控制

- **最小权限**：代理只拥有完成任务所需的最小权限
- **审批机制**：重要操作必须经过人工审批
- **审计日志**：记录所有重要操作的审计日志
- **异常监控**：监控和报警异常行为

### 性能优化技巧

1. **上下文窗口管理**：合理使用文件系统避免上下文溢出
2. **子代理复用**：缓存和复用常用的子代理实例
3. **异步处理**：支持并发执行独立的子任务
4. **结果缓存**：缓存常用的查询和分析结果
5. **资源监控**：监控资源使用情况并及时优化

通过合理运用 DeepAgents 的这些功能，开发者可以构建出既强大又可靠的智能代理系统，有效处理复杂的业务场景和任务需求。
