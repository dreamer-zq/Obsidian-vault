---
study_status: "学习中"
---

# AggKit

> 简述：AggKit 是连接各条链至统一 Agglayer 生态的同步工具集，提供模块化组件以实现跨链通信、证明提交与会计同步，同时在 v0.3.5 引入“多方委员会系统”增强生产级安全性。
> 术语索引：参见 [Glossary](Glossary.md)。

## 1. 概览

- 通用兼容：以模块化方式适配不同的链架构，无需大改现有基础设施。
- 按需部署：仅部署链端所需组件，降低集成成本。
- 强化安全：v0.3.5 引入多方委员会系统，消除单地址风险，适配高价值与企业级部署。
- 标准化接入：提供规范化的“连接流程”，便于重复实施与维护。

## 2. 架构与通信模式

- 双向通信：
  - 链 → Agglayer：提交状态证明、退出树更新与桥操作相关信息。
  - Agglayer → 链：在 L1 结算后下发目的链处理指令（资产铸造/消息调用）。
- 组件协同：
  - 证明提交：与 Prover/Agglayer Node 协同推进全局根与最终性。
  - 桥接路由：与 Unified Bridge 协同执行跨链资产与消息的标准流程。

```mermaid
flowchart TD
    subgraph "Chain"
        C1[Sequencer]
        C2[AggKit Components]
        C3[Adapter/Connector]
    end

    subgraph "AggLayer (L1)"
        A1[Agglayer Node]
        A2[Unified Bridge]
        A3[Global Exit Root]
    end

    %% Bidirectional sync (English comments)
    C2 --> A1
    C3 --> A2
    A2 --> C3
    A1 --> A2
    A2 --> A3
```

## 3. 组件（示意）

- 同步组件：负责将本地事件（退出树更新、消息）规范化并提交至 Agglayer。
- 证明组件：对接 Prover，出具或转发状态转换证明，参与全局根推进。
- 桥接组件：与统一桥交互，实现资产与消息跨链的标准接口与安全约束。
- 运营工具：提供 API 与服务封装，便于应用或上层服务集成。

## 4. v0.3.5 安全改进：多方委员会系统

- 背景：之前的单地址模型存在单点风险，不适合生产环境。
- 改进：
  - 多方委员会：关键操作需多方共识签名或证书背书，避免单一主体操控。
  - 分布式信任：降低单点失效风险，提升桥接与状态同步的鲁棒性。
- 适用：高价值部署、企业场景与合规要求更高的系统。

```mermaid
sequenceDiagram
    participant CM as Committee Members
    participant AK as AggKit@Chain
    participant AN as AgglayerNode@L1
    participant UB as UnifiedBridge@L1

    AK->>CM: Request committee approval for critical ops
    CM-->>AK: Provide aggregated signatures/certificates
    AK->>AN: Submit proofs + committee certificate
    AN->>UB: Verify and advance Global Exit Root
```

## 5. 集成流程（示例）

1. 部署 AggKit 组件，配置与链端适配器的接口。
2. 启用多方委员会（可选，建议生产），配置门槛与成员列表。
3. 与 Prover 协作生成链内/批次证明，接入 Agglayer Node 验证与推进全局根。
4. 统一桥在 L1 结算后路由指令至目的链；链端组件处理资产铸造/消息调用。

## 6. 能力与边界

- 保持主权：各链保持经济与架构主权，AggKit 仅作为互操作的同步与接入工具。
- 统一流动性：通过统一桥访问全网资产与消息互操作能力。
- 安全与性能平衡：可根据场景选择更强的委员会约束或更轻量的部署模式。

## 7. 参考资料

- AggKit — Agglayer Docs: <https://docs.agglayer.dev/agglayer/core-concepts/aggkit/>
- Architecture / Components / Security Improvements：见官方文档分栏页。
