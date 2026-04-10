# Superpowers

技术社区对 AI 编程工具的普遍反馈是：AI 响应过快，往往在需求尚未明确时就开始输出代码；代码运行后缺乏测试覆盖；bug 修复后未追溯根因，导致同类问题反复出现。

![Superpowers 信息图封面](https://raw.githubusercontent.com/dreamer-zq/PicGo/main/640-20260410112720019)

Superpowers 是针对上述问题设计的 AI 编程 Agent 工作流系统。GitHub 36.6K Star，MIT 协议。核心理念：**不是更强，而是更稳**。

本文基于 Superpowers 官方文档和源码，系统介绍其 **14 个 Skills、7 步工作流、3 条铁律**，并结合三个典型开发场景（新项目、加功能、修 bug）说明如何将其应用于实际开发。

## **1. Superpowers 是什么**

Superpowers 是一套面向 AI 编程 Agent 的标准化开发流程。

由 Jesse Vincent（GitHub: obra）创建，当前版本 v5.0.7（2026-03-31），支持 Claude Code、Cursor、Codex、OpenCode、Gemini CLI、GitHub Copilot CLI 六个平台。

其定位并非提升 AI 的智能水平，而是规范 AI 的开发行为。针对传统 AI 辅助开发的常见问题（急于写代码、缺乏系统流程、忽略测试和文档），Superpowers 通过 14 个可组合的 Skills 和强制触发机制，将软件工程标准流程固化到 AI Agent 中。

工作流程：

1. Agent 识别引导指令后，**不直接写代码**
2. 先询问用户真实需求
3. 通过对话提炼需求规格，分段展示供审阅
4. 用户审批设计后，生成实施计划
5. 启动子代理逐任务开发，自动代码审查

该流程比直接让 AI 写代码耗时更长，但前期投入的设计时间能够从后期的返工中节省回来。

## **2. 核心工作流全景图**

Superpowers 的基础工作流包含 7 个步骤：

```
brainstorming → using-git-worktrees → writing-plans → subagent-driven-development → test-driven-development → requesting-code-review → finishing-a-development-branch
```

步骤说明：

1. **brainstorming** - 需求澄清与方案设计
2. **using-git-worktrees** - 创建独立工作空间
3. **writing-plans** - 拆分为 2-5 分钟的小任务
4. **subagent-driven-development** - 每个任务派独立子代理
5. **test-driven-development** - 先写失败测试，再写生产代码
6. **requesting-code-review** - 自动代码审查
7. **finishing-a-development-branch** - 验证通过后收尾

![工作流全景结构图](https://raw.githubusercontent.com/dreamer-zq/PicGo/main/640-20260410112836266)

*图 1：7 步工作流与 14 个 Skills 的映射关系*

### **14 个 Skills 四大分类**

**协作类（9 个）**：brainstorming、writing-plans、executing-plans、subagent-driven-development、dispatching-parallel-agents、requesting-code-review、receiving-code-review、using-git-worktrees、finishing-a-development-branch

**测试类（1 个）**：test-driven-development

**调试类（2 个）**：systematic-debugging、verification-before-completion

**元类（2 个）**：writing-skills、using-superpowers

### **强制触发机制**

流程执行的关键在于**强制触发**：如果存在适用的技能，Agent 必须使用。

官方文档说明，该机制基于 Robert Cialdini 的说服学原理——权威性（提示词中声明技能为强制性）、承诺（让 Agent 主动宣布使用技能）、社会证明（描述始终会发生什么）。

### **三个场景，三套流程**

| 场景           | 工作流                                 | 步骤数 |
| :------------- | :------------------------------------- | :----- |
| 从零开始新项目 | 完整 7 步流程                          | 7 步   |
| 老项目加新功能 | 完整流程（brainstorming 侧重已有代码） | 7 步   |
| 修复 bug       | 精简流程                               | 3 步   |

## **3. 场景 1：从零开始新项目**

新项目的风险不在于**写不出来**，而在于**写偏了**。架构错误、技术栈选择失误、需求理解偏差等问题，返工成本远高于前期设计成本。

Superpowers 的 brainstorming 技能规定：**不展示设计并获得用户批准前，绝不启动任何实现**。

![新项目 7 步工作流示意图](https://raw.githubusercontent.com/dreamer-zq/PicGo/main/640-20260410112851230)

*图 2：新项目从零开始的完整 7 步工作流*

### **7 步流程详解**

**第 1 步：brainstorming（头脑风暴）**

Agent 执行：探索项目上下文、逐个提问澄清需求、提出 2-3 个方案、分段展示设计文档。

逐个提问是刻意设计，避免一次性抛出过多问题导致用户应付式回答。

用户角色：审阅设计文档，批准后进入下一步。该过程可能需多轮迭代，但比写完代码后改架构成本更低。

**第 2 步：using-git-worktrees（创建隔离空间）**

使用 Git Worktree 创建独立工作目录，与主分支隔离。流程：选择目录 → 验证 .gitignore → 创建 worktree → 运行项目配置 → 验证测试基线。

隔离的价值在于：新项目探索性强，方向错误时可删除 worktree 重来，主分支保持干净。

**第 3 步：writing-plans（拆任务）**

将设计文档拆分为 2-5 分钟的小任务。每个任务包含：精确的文件路径、完整的代码（禁止 TBD、TODO 占位符）、验证步骤。

任务粒度是关键：过大导致子代理跑偏，过小增加上下文切换成本。2-5 分钟为官方推荐值。

**第 4 步：subagent-driven-development（子代理开发）**

为每个任务派发独立子代理。核心思想是上下文隔离——每个子代理仅看到当前任务所需信息。

子代理完成后需通过两道审查：规范合规审查（是否违反设计文档）和代码质量审查（代码风格、性能、安全）。

**第 5 步：test-driven-development（TDD）**

RED → GREEN → REFACTOR 循环：

- **RED** - 先写失败测试
- **GREEN** - 写能通过测试的代码，尽可能简单
- **REFACTOR** - 清理代码，保持测试通过

TDD 对 AI 编程的价值在于约束过度设计——防止 AI 添加"以后可能用到"的功能。

**第 6 步：requesting-code-review（代码审查）**

自动获取 git SHA，派发审查子代理，根据反馈修复问题。审查维度：代码质量、规范合规、潜在风险。

**第 7 步：finishing-a-development-branch（收尾）**

验证所有测试通过后，提供四个选项：合并到基础分支、创建 PR、保留分支、丢弃分支。最后清理 worktree。

### **注意事项**

- brainstorming 阶段多花时间澄清需求，后期节省时间更多
- writing-plans 阶段检查任务粒度，过大或过小都影响效率
- worktree 创建后先跑测试基线，确认环境正常再开发

## **4. 场景 2：老项目加新功能**

与场景 1 步骤相同，但每步重点不同。

### **关键差异**

老项目存在历史包袱：现有代码模式、架构风格、依赖版本都是约束条件。Superpowers 在 brainstorming 技能中有专门指导：**Working in existing codebases**。

核心原则：

- 遵循现有代码模式和架构
- 不提议无关的重构
- 新代码与项目风格一致

### **示例**

假设 Node.js 后端项目需添加 PDF 导出功能。

**brainstorming 阶段**：Agent 先摸底项目结构——框架、模板引擎、现有导出功能实现方式，再针对 PDF 导出提方案。

**writing-plans 阶段**：拆任务时关注与现有代码的集成点：路由文件位置、权限校验中间件复用、导出格式与现有 Excel 导出的一致性。

**subagent-driven-development 阶段**：除常规代码审查，还需确认未破坏已有功能。依赖 TDD 的测试保护网——先写测试确保现有行为不变，再写新功能测试。

**requesting-code-review 阶段**：审查重点为"新代码是否与项目风格一致"和"是否引入不必要的依赖"。

### **重要提示**

在老项目中使用 Superpowers，不应跳过 using-git-worktrees。

worktree 的价值不仅是代码隔离，更提供**可随时丢弃的沙箱**——改坏后直接删除 worktree，主分支不受影响。在老项目中，这种安全网比新项目更重要。

## **5. 场景 3：发现并修复 BUG**

该场景与前两个有本质区别——**不需要完整工作流，只需精准打击**。

推荐工作流精简为 3 步：

```
systematic-debugging → test-driven-development → verification-before-completion
```

精简原因：修 bug 目标明确、范围可控，不需要 brainstorming 梳理需求，也无需 worktree 隔离（通常在现有分支直接修）。

### **系统化调试四阶段**

systematic-debugging 是该场景的核心技能，分四个阶段：

![BUG 修复工作流示意图](https://raw.githubusercontent.com/dreamer-zq/PicGo/main/640-20260410112912261)

*图 3：BUG 修复 3 步工作流，核心在于系统化调试四阶段*

**阶段一：根因调查**

不做任何修改，仅收集信息。检查日志、复现 bug、查看相关代码。目标是找到 bug 的真正原因，而非表象。

示例：用户反馈"点击导出按钮没反应"。表象是按钮失效，根因可能是 API 返回 500 错误而前端未处理。仅修前端按钮样式无法解决问题。

**阶段二：模式分析**

分析 bug 模式：偶发还是必现？与特定输入相关还是环境相关？特定用户还是所有用户？

分析结果影响修复策略。必现 bug 易修，偶发 bug 需更多环境信息；与输入相关需加边界检查，与环境相关需改配置。

**阶段三：假设与测试**

基于前两阶段发现形成修复假设，用测试验证。此处的"测试"是写能复现 bug 的自动化测试，而非简单手动验证。

**阶段四：实施修复**

确认假设正确后改代码。改完需跑完整测试套件，确保未引入新问题。

### **先写失败测试的原因**

Superpowers 的铁律：**没有失败测试就不写生产代码**。

好处：

1. 确认找到 bug 根因，而非碰巧改对
2. 测试留在测试套件中，防止同一 bug 再次出现

失败测试是**诊断证明**——证明 bug 存在，也证明修复有效。

### **修复后的验证**

verification-before-completion 技能要求声明完成前必须提供**新鲜的验证证据**：

- 所有测试通过（包括新写和原有）
- 手动验证 bug 已修复
- 相关功能无回归

"新鲜"指刚刚验证过，非昨天或之前的结果。该约束防止改了 A 功能后 B 功能损坏但未检测的情况。

## **6. 三条铁律**

Superpowers 将以下规则定义为 **Iron Laws（铁律）**，非建议而是硬性约束。

### **铁律一：没有失败测试就不写生产代码**

test-driven-development 技能的硬性约束。

逻辑：写不出失败测试说明未想清楚要实现什么。行为都定义不了，代码大概率是猜测。

TDD 的具体价值：

- 迫使写代码前思考接口设计
- 提供即时反馈，写完马上验证
- 形成安全网，后续改动不怕回归

### **铁律二：不做根因调查就不修 bug**

systematic-debugging 技能的核心约束。

无根因分析的修复本质上是碰运气。改一行代码 bug 消失，但不确定原因。若根因在别处，"修复"只是掩盖症状，后续可能爆出更大问题。

根因调查前期耗时，但修一次就彻底解决。不查根因看似快，同一 bug 反复出现，总时间反而更多。

### **铁律三：没有新鲜验证证据就不做完成声明**

verification-before-completion 技能的要求。

该铁律对抗的心理倾向：改完代码后急于宣布"完成"。尤其是 AI 说"修复已完成"时，可能只是"代码改完了"，不代表"验证过了"。

Superpowers 要求的验证证据：测试全部通过、手动验证确认、相关功能无回归。三条都满足才算完成。

三条铁律的本质是阻止软件开发中三种典型的偷懒行为：不写测试、不查根因、不验证就收工。

## **7. 实战建议**

### **工作流选择**

| 场景 | 推荐流程 |
|------|----------|
| 做新东西（新项目或新功能） | 完整 7 步 |
| 修 bug | 3 步精简版（调试 → TDD → 验证） |
| 多个不相关的独立任务 | dispatching-parallel-agents 并行处理 |

### **安装方式**

Claude Code：
```
/plugin install superpowers@claude-plugins-official
```

Cursor：
```
/add-plugin superpowers
```

其他平台（Codex、OpenCode、Gemini CLI、GitHub Copilot CLI）的安装方式见项目 README。

### **适用场景**

Superpowers 适合有一定复杂度的开发任务。改配置文件、写简单脚本等场景使用反而过重。

涉及多文件改动、需要测试保护、需要代码审查的场景，Superpowers 价值显著。尤其是子代理驱动开发机制——让每个任务独立执行、独立审查，对复杂项目帮助很大。

### **常见问题**

**Q: Superpowers 会拖慢开发速度吗？**

A: 前期确实会慢。brainstorming 的反复确认、TDD 的测试先行，都比直接让 AI 输出代码多花时间。但该时间花在设计阶段，能减少后期返工。官方文档：流程优于猜测（Systematic over ad-hoc）。

**Q: 可以只用部分 Skills 吗？**

A: Skills 可组合，不需要每次走完整流程。修 bug 就是例子——只用 3 个 Skills。但注意强制触发机制：如果存在适用的技能，Agent 会自动使用。想精细控制可在配置中调整。

**Q: 对什么编程语言有效？**

A: Superpowers 约束的是开发流程，非代码实现，理论上不限语言。但 TDD 在不同语言中体验有差异：Python、JavaScript 等动态语言写测试较轻快，C++、Java 等编译型语言测试周期较长。

## **总结**

Superpowers 解决的不是"AI 不会写代码"，而是"AI 写代码不够靠谱"。

14 个 Skills 覆盖从需求梳理到代码审查的完整流程。3 条铁律阻止开发中三种典型的偷懒行为。子代理驱动开发解决多任务场景下的上下文污染问题。

该流程上手需要适应期——大多数人用 AI 编程图的是快。但若用 AI 做正经的项目开发，建议参考 Superpowers 的三条铁律规避常见陷阱。
