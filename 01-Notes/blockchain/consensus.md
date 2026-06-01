# 分布式共识算法全景

> 本文档涵盖崩溃故障容错（CFT）与拜占庭故障容错（BFT）的核心原理，及其代表性算法的工程实现细节与横向对比。

---

## 目录

1. [故障模型概述](#一故障模型概述)
2. [CFT：崩溃故障容错](#二cft崩溃故障容错)
   - [Paxos](#21-paxos)
   - [Raft](#22-raft)
3. [BFT：拜占庭故障容错](#三bft拜占庭故障容错)
   - [PBFT](#31-pbft)
   - [Tendermint / CometBFT](#32-tendermint--cometbft)
   - [HotStuff / HotStuff-2](#33-hotstuff--hotstuff-2)
   - [ChonkyBFT](#34-chonkybft)
4. [横向对比](#四横向对比)

---

## 一、故障模型概述

分布式系统中，节点的故障行为决定了所需共识协议的强度。

```
故障模型层级（由弱到强）

  ┌─────────────────────────────────────┐
  │         拜占庭故障 (Byzantine)        │  节点可任意撒谎、发送矛盾消息
  │  ┌───────────────────────────────┐  │
  │  │      遗漏故障 (Omission)       │  │  节点丢失消息但不撒谎
  │  │  ┌─────────────────────────┐  │  │
  │  │  │   崩溃故障 (Crash)       │  │  │  节点停止响应，不发送任何消息
  │  │  └─────────────────────────┘  │  │
  │  └───────────────────────────────┘  │
  └─────────────────────────────────────┘
```

| 故障类型 | 描述 | 容忍条件 | 典型协议 |
|---------|------|---------|---------|
| **崩溃故障（CFT）** | 节点停机，不再发送任何消息 | `n ≥ 2f + 1` | Paxos、Raft |
| **拜占庭故障（BFT）** | 节点可任意行为：撒谎、发送矛盾消息、与其他恶意节点勾结 | `n ≥ 3f + 1`（传统BFT）/ `n ≥ 5f + 1`（ChonkyBFT） | PBFT、Tendermint、HotStuff、ChonkyBFT |

其中 `n` 为总节点数，`f` 为最大容忍故障节点数。

### FLP 不可能定理

> 在完全异步网络中，即使只有一个节点可能崩溃，也不存在确定性的共识算法能同时保证**安全性（Safety）**、**活性（Liveness）**和**终止性（Termination）**。

所有实用协议都通过引入**部分同步假设**（超时、领导者选举等）来绕过此定理。

---

## 二、CFT：崩溃故障容错

CFT 协议假设节点要么正常工作，要么完全停机（宕机）。节点不会发送错误或矛盾的消息。

---

### 2.1 Paxos

**提出者：** Leslie Lamport，1989（正式发表于 1998 年）
**论文：** *The Part-Time Parliament*

#### 核心思想

Paxos 通过两阶段协议，在多数节点存活的前提下就单个值达成一致。它是众多分布式系统（Chubby、ZooKeeper 等）的理论基础。

#### 角色定义

| 角色 | 职责 |
|------|------|
| **Proposer（提议者）** | 发起提案，驱动共识进程 |
| **Acceptor（接受者）** | 投票接受提案，持久化承诺 |
| **Learner（学习者）** | 得知最终决定的值 |

实际部署中，一个节点通常同时扮演多个角色。

#### 协议流程（Basic Paxos）

```
Phase 1: Prepare / Promise

  Proposer                    Acceptors (Quorum)
     │                              │
     │── PREPARE(n) ──────────────► │   n: 提案编号
     │                              │
     │◄─ PROMISE(n, v_old) ──────── │   承诺不再接受编号 < n 的提案
     │   (如有已接受提案，返回其值)     │

Phase 2: Accept / Accepted

  Proposer                    Acceptors (Quorum)
     │                              │
     │── ACCEPT(n, v) ────────────► │   v: 若 PROMISE 中有值则用最大编号的值，否则自由选择
     │                              │
     │◄─ ACCEPTED(n) ────────────── │   写入并确认

─────────────────────────────────
  Learner 从多数 Acceptor 处得知 ACCEPTED 后，该值被最终确定
```

#### 关键不变量

- **提案编号单调递增**：更高编号的 PREPARE 会覆盖低编号的承诺
- **多数原则（Quorum）**：任意两个多数集合必然有交集，保证已接受的值不会被遗忘
- **值的继承**：若某个值已被接受，后续提议者必须沿用该值（保证 Safety）

#### Multi-Paxos

Basic Paxos 每次仅能决定一个值，且 Phase 1 开销大。Multi-Paxos 优化：

- 稳定 Leader 期间跳过 Phase 1，直接执行 Phase 2
- 引入**日志槽位（log slot）**概念，支持连续命令提交
- 成为 Raft、Viewstamped Replication 等协议的前身

#### 工程挑战

- 原始论文未描述领导者选举、成员变更等工程细节
- 活锁问题：两个 Proposer 互相覆盖对方的 PREPARE
- "Paxos 很难理解，更难正确实现" —— Raft 论文

---

### 2.2 Raft

**提出者：** Diego Ongaro & John Ousterhout，2014
**论文：** *In Search of an Understandable Consensus Algorithm*

#### 设计目标

Raft 以**可理解性**为核心设计目标，将共识问题分解为相对独立的子问题：

1. **领导者选举（Leader Election）**
2. **日志复制（Log Replication）**
3. **安全性（Safety）**
4. **成员变更（Membership Changes）**

#### 核心概念

**Term（任期）**：逻辑时钟单位，单调递增。每个 Term 至多有一个 Leader。

```
时间轴:
  Term 1      Term 2   Term 3       Term 4
  ┌────────┐  ┌─────┐  ┌─────────┐  ┌──────────────
  │Election│  │Elec │  │ Leader  │  │   Leader A
  │ Leader │  │fail │  │ (split  │  │   (normal)
  │  A win │  │     │  │  vote)  │  │
  └────────┘  └─────┘  └─────────┘  └──────────────
```

#### 领导者选举

```
初始状态: 所有节点为 Follower

超时触发:
  Follower ──(election timeout)──► Candidate
  Candidate:
    1. 自增 currentTerm
    2. 为自己投票
    3. 并行发送 RequestVote RPC 给所有节点

投票规则（接收方）:
  - 每个 Term 只投一票（先到先得）
  - 候选人日志必须至少和自己一样新（Log Up-to-date 检查）

选举结果:
  ┌─ 获得多数票 ──► 成为 Leader，发送心跳
  ├─ 发现更高 Term ──► 退回 Follower
  └─ 超时无结果 ──► 随机延迟后重新选举（避免活锁）
```

#### 日志复制

```
Client              Leader              Followers
  │                   │                    │
  │── Command ───────►│                    │
  │                   │── AppendEntries ──►│  (包含新日志条目)
  │                   │◄─ Success ─────────│
  │                   │  (多数确认后提交)   │
  │◄─ Response ───────│── AppendEntries ──►│  (commitIndex 更新)
  │                   │                    │── Apply to state machine
```

**日志匹配属性（Log Matching Property）**：
- 若两个日志在相同 index 有相同 (term, index)，则该 index 之前的所有条目完全相同
- AppendEntries 包含前一条目的 (term, index) 用于一致性检查

#### 安全性保证

**选举限制**：节点只投票给日志至少和自己一样新的候选人，确保：
- Leader 一定包含所有已提交的日志条目
- 只有含有最新日志的节点才能当选

**提交规则**：Leader 只提交**当前 Term**的日志（防止旧 Leader 遗留条目被误提交）。

#### 成员变更（Joint Consensus）

```
旧配置 C_old            过渡期 C_old,new          新配置 C_new
─────────────────────►──────────────────────────►──────────────
  {A, B, C}                {A,B,C} ∪ {A,B,D,E}       {A,B,D,E}
                        (需要两组各自的多数同意)
```

#### Raft vs Paxos

| 维度 | Paxos | Raft |
|------|-------|------|
| 可理解性 | 低 | 高 |
| 强 Leader | 弱（任意节点可提议） | 强（所有写必须经过 Leader） |
| 成员变更 | 未规范 | Joint Consensus / Single Server |
| 工程完整性 | 需大量补充 | 完整协议规范 |
| 代表实现 | Chubby、ZooKeeper | etcd、TiKV、CockroachDB |

---

## 三、BFT：拜占庭故障容错

BFT 协议能够容忍节点的**任意恶意行为**，包括发送矛盾消息、选择性忽略请求、与其他恶意节点勾结等。这使得 BFT 协议更适用于去信任环境（区块链、跨机构系统等）。

**基本下界**：容忍 `f` 个拜占庭节点，至少需要 `n ≥ 3f + 1` 个节点。

**直觉证明**：
```
假设 n = 3f，f 个节点故障不响应，剩余 2f 个节点中有 f 个是拜占庭节点。
此时诚实节点（f个）无法区分"f个故障节点"和"f个拜占庭节点"的行为，
导致安全性无法保证。故需 n ≥ 3f + 1。
```

---

### 3.1 PBFT

**提出者：** Miguel Castro & Barbara Liskov，1999
**论文：** *Practical Byzantine Fault Tolerance*
**里程碑意义：** 第一个实用的 BFT 协议，将 BFT 从理论带入工程

#### 系统假设

- 网络部分同步（消息最终可达，但延迟有上界）
- 使用数字签名或 MAC 认证消息
- `n ≥ 3f + 1`，通常部署为 `n = 3f + 1`（最小配置）

#### 角色

- **Primary（主节点）**：当前视图的 Leader，负责排序请求
- **Replica（副本）**：执行协议、维护状态的其他节点

#### 三阶段协议

```
Client          Primary (p)         Replicas (r₁, r₂, ... rₙ)
  │                 │                          │
  │── Request ─────►│                          │
  │                 │                          │
  │            ─ Phase 1: PRE-PREPARE ─        │
  │                 │── <PRE-PREPARE, v, n, d>─►│
  │                 │   v: view number          │
  │                 │   n: sequence number      │
  │                 │   d: digest(request)      │
  │                 │                          │
  │            ─ Phase 2: PREPARE ─────────    │
  │                 │◄─ <PREPARE, v, n, d, i> ─│
  │                 │──────────────────────────►│ (每个 replica 广播给所有人)
  │                 │   收到 2f 个 PREPARE 后   │
  │                 │   → 进入 prepared 状态    │
  │                 │                          │
  │            ─ Phase 3: COMMIT ──────────    │
  │                 │◄─ <COMMIT, v, n, d, i> ──│
  │                 │──────────────────────────►│ (每个节点广播给所有人)
  │                 │   收到 2f+1 个 COMMIT 后  │
  │                 │   → committed-local       │
  │                 │                          │
  │◄─ Reply ────────│──────────────────────────│ (执行请求并回复 Client)
  │   (收到 f+1 个相同回复后接受结果)            │
```

#### View Change（视图切换）

当 Primary 疑似故障时，触发 View Change 切换到新 Primary：

```
1. Replica 发送 VIEW-CHANGE(v+1, n, C, P) 给所有节点
   - C: 检查点证明
   - P: prepared 状态集合

2. 新 Primary 收到 2f 个 VIEW-CHANGE 消息后
   发送 NEW-VIEW(v+1, V, O)
   - V: VIEW-CHANGE 消息集合
   - O: 需要重新执行的 pre-prepare 集合

3. Replicas 验证 NEW-VIEW 后进入新视图
```

#### 检查点机制（Checkpoint）

定期对系统状态做快照，用于：
- 垃圾回收日志，防止无限增长
- 加速新节点同步

```
每 K 条请求（如 K=100）执行一次检查点：
  节点广播 CHECKPOINT(n, d_state)
  收到 2f+1 个相同 CHECKPOINT → stable checkpoint
  可安全丢弃 n 之前的日志
```

#### 性能瓶颈

```
消息复杂度: O(n²)

PREPARE 阶段: 每个节点向其余 n-1 个节点广播
  → n × (n-1) = O(n²) 条消息

实践中：
  n=4  (f=1): 12 条消息/轮
  n=7  (f=2): 42 条消息/轮
  n=100(f=33): ~10,000 条消息/轮  ← 严重瓶颈

工程建议: PBFT 适合 n ≤ 20 的小型集群
```

---

### 3.2 Tendermint / CometBFT

**提出者：** Jae Kwon，2014；后经 Ethan Buchman 完善
**工程实现：** CometBFT（原 Tendermint Core）
**应用：** Cosmos 生态系列链（Cosmos Hub、BNB Chain 等）

#### 设计改进

Tendermint 的核心贡献：**将 BFT 共识与区块链出块深度融合**，设计了面向区块链场景的 round-based 协议。

#### 协议轮次结构

每个高度（Height，即区块号）由若干轮次（Round）组成：

```
Height H, Round R:

  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │   PROPOSE    │───►│  PREVOTE     │───►│  PRECOMMIT   │
  │  (Proposer)  │    │  (all nodes) │    │  (all nodes) │
  └──────────────┘    └──────────────┘    └──────────────┘
         │                   │                    │
    Proposer 广播         广播 PREVOTE          广播 PRECOMMIT
    Block Proposal       (Block or nil)        (Block or nil)
                              │                    │
                    收到 2/3+ PREVOTE          收到 2/3+ PRECOMMIT
                    for Block → PolkaBlock     for Block → Commit
```

**Polka（波尔卡）**：某区块收到超过 2/3 的 PREVOTE，即形成 PolkaBlock。

#### 锁定机制（Locking）

Tendermint 的关键安全机制：

```
规则 1 (Lock):
  若节点在 Round R 的 PRECOMMIT 阶段投票了 Block B,
  则该节点被"锁定"在 B 上，直到解锁。

规则 2 (Unlock / PoLC):
  只有当节点收到更高轮次 R' > R 中 Block B' 的 PolkaBlock,
  才能解锁并改投 B'。

效果: 防止节点在不同轮次投票给不同区块（保证 Safety）
```

#### Proposer 轮换

```
Proposer = validators[(height + round) % len(validators)]

（实际为加权轮询，权重 = 验证人 stake）

主要特性:
  - 无需复杂的 Leader 选举
  - Round 超时自动触发轮换
  - 确保所有验证人按比例获得出块机会
```

#### 与 PBFT 的关键区别

| 维度 | PBFT | Tendermint |
|------|------|-----------|
| 阶段数 | 3（PRE-PREPARE、PREPARE、COMMIT） | 2（PREVOTE、PRECOMMIT） |
| 消息复杂度 | O(n²) | O(n²) |
| View Change | 复杂，状态传输大 | 简洁，超时即换轮 |
| 区块链集成 | 通用状态机 | 原生区块链设计 |
| Finality | 立即最终确定 | 立即最终确定 |

#### CometBFT 工程特性

- **ABCI（Application BlockChain Interface）**：共识引擎与应用逻辑解耦，支持任意状态机
- **P2P 层**：基于 Gossip 的消息传播，实际消息复杂度可低于理论值
- **轻客户端支持**：基于 Quorum Certificate 快速验证

---

### 3.3 HotStuff / HotStuff-2

**提出者：** Maofan Yin, Dahlia Malkhi 等，2018/2023
**论文：** *HotStuff: BFT Consensus with Linearity and Responsiveness*
**应用：** LibraBFT（Diem/Meta）、DiemBFT、Jolteon、Bullshark（Aptos/Sui 生态）

#### 核心贡献：线性消息复杂度

HotStuff 是 BFT 领域的重大突破，首次实现了：
- **线性通信复杂度 O(n)**（正常路径）
- **乐观响应性（Optimistic Responsiveness）**：不依赖超时，以网络实际速度推进
- **简洁的 View Change**：O(n) 消息完成 Leader 切换

#### 关键机制：QC（Quorum Certificate）

```
QC = 对某个消息的 2f+1 个节点签名的聚合证明
   = threshold signature 或 multisignature

传统 PBFT:
  每个节点广播自己的签名给所有人 → O(n²) 条消息

HotStuff:
  每个节点将签名发给 Leader
  Leader 聚合成 QC（1个消息）再广播
  → O(n) 条消息
```

#### 三阶段 Basic HotStuff

```
Phase 1: PREPARE
  Leader ────── [PREPARE, node, QC_high] ──────► Replicas
  Replicas ──── [VOTE, PREPARE, partial_sig] ──► Leader
  Leader 收集 n-f 票，生成 prepareQC

Phase 2: PRE-COMMIT
  Leader ────── [PRE-COMMIT, prepareQC] ────────► Replicas
  Replicas ──── [VOTE, PRE-COMMIT, partial_sig] ► Leader
  Leader 收集 n-f 票，生成 precommitQC

Phase 3: COMMIT
  Leader ────── [COMMIT, precommitQC] ──────────► Replicas
  Replicas ──── [VOTE, COMMIT, partial_sig] ─────► Leader
  Leader 收集 n-f 票，生成 commitQC

Phase 4: DECIDE
  Leader ────── [DECIDE, commitQC] ─────────────► Replicas
  Replicas 执行区块并提交
```

#### 流水线优化（Chained HotStuff）

三阶段协议可以流水线化：每个新轮次的 PREPARE 阶段同时服务上一轮次的 PRE-COMMIT 和上上轮次的 COMMIT。

```
Round:    k         k+1         k+2         k+3         k+4
          │         │           │           │           │
          PREPARE   PREPARE     PREPARE     PREPARE     PREPARE
          for Bₖ    for Bₖ₊₁   for Bₖ₊₂   for Bₖ₊₃   for Bₖ₊₄
          │         │           │           │           │
          QC        QC(=PRE-    QC(=COMMIT  QC(=DECIDE  QC(=PRE-
                    COMMIT Bₖ)  Bₖ)         Bₖ)         COMMIT Bₖ₊₁)

效果: 每轮网络往返提交一个区块
```

#### View Change（SafetyCore）

```
当 Replica 怀疑 Leader 故障:
  1. 广播 NEW-VIEW(view+1, QC_high)
  2. 新 Leader 等待 n-f 个 NEW-VIEW 消息
  3. 选取其中最高的 QC_high 作为新轮次的起点
  4. 发送 PREPARE，携带 QC_high

消息数: O(n)   ← PBFT 为 O(n²)
```

#### HotStuff-2（2023）

HotStuff-2 在原版基础上进一步简化，将三阶段减少为两阶段：

```
HotStuff:    [PREPARE → PRE-COMMIT → COMMIT → DECIDE]  4轮
HotStuff-2:  [PREPARE → COMMIT]                        2轮（正常路径）

通过"Two-Chain Rule"替代"Three-Chain Rule"，
牺牲少量安全性余量换取更低延迟。
```

#### 安全性 vs 活性

```
Safety（安全性）: 由 QC 链的单调性和 SafetyCore 规则保证
  → 诚实节点永远不会提交两个冲突的区块

Liveness（活性）: 由 Pacemaker 机制保证
  → 当 f 个节点故障时，Pacemaker 最终使所有诚实节点
    进入同一个视图，让诚实 Leader 能够推进

安全性与活性解耦是 HotStuff 的重要设计原则
```

---

### 3.4 ChonkyBFT

**背景：** ZKsync Era（以太坊 ZK-Rollup 二层网络）内部研发
**定位：** 面向 ZK-Rollup 区块生产的定制 BFT 协议
**关系：** 混合协议，融合 FAB Paxos、Fast-HotStuff、HotStuff-2 的设计思想
**论文：** [arXiv:2503.15380](https://arxiv.org/abs/2503.15380)（2025年3月）
**实现：** [matter-labs/era-consensus](https://github.com/matter-labs/era-consensus)

#### 核心特性

```
容错要求: n ≥ 5f + 1  ← 相比传统 BFT 的 n ≥ 3f + 1 更保守

设计目标:
  1. 简洁性（Simplicity）
  2. 低交易延迟（Low Transaction Latency）
  3. 降低系统复杂度（Reduced System Complexity）

协议特征:
  - 基于委员会（Committee-based）
  - 仅一轮投票（One Round of Voting）
  - 单槽位最终确定（Single Slot Finality）
  - 二次方通信复杂度（Quadratic Communication）
  - 经过形式化方法分析、验证和测试
```

#### 设计背景与约束

ZKsync Era 的区块生产面临独特挑战：

```
传统区块链:
  共识 → 执行 → 提交

ZKsync Era:
  共识 → 执行 → ZK 证明生成 → L1 发布
             (数分钟~数小时)

特殊需求:
  1. 出块与 ZK 证明解耦（证明是异步的）
  2. 批次（Batch）边界由共识管理
  3. 需要配合 StateKeeper 的状态管理
  4. 支持 L1 → L2 消息的确定性处理
```

#### 核心架构

ChonkyBFT 采用**轮次驱动（Round-based）**设计：

```
┌─────────────────────────────────────────────┐
│                  Replica                     │
│                                              │
│  ┌────────────┐    ┌──────────────────────┐ │
│  │  Consensus │    │    State Keeper      │ │
│  │   Engine   │◄──►│  (block production)  │ │
│  └────────────┘    └──────────────────────┘ │
│        │                    │               │
│        ▼                    ▼               │
│  ┌────────────┐    ┌──────────────────────┐ │
│  │  Network   │    │   Storage Layer      │ │
│  │   (P2P)    │    │  (RocksDB/Postgres)  │ │
│  └────────────┘    └──────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### 消息类型与协议阶段

```
每个轮次（View）包含：

Phase 1: LeaderProposal
  Leader ──── LeaderProposal(view, block, high_qc) ────► Replicas

Phase 2: ReplicaCommit
  Replicas ─── ReplicaCommit(view, block_hash, sig) ──► Leader
  Leader 收集 n-f 个签名，聚合成 CommitQC

Phase 3: LeaderCommit
  Leader ──── LeaderCommit(view, CommitQC) ───────────► Replicas
  Replicas 验证 CommitQC，本地提交区块

Phase 4 (超时): ReplicaTimeout
  当 Replica 超时，发送 ReplicaTimeout(view, high_qc, sig)
  Leader 收集 n-f 个，聚合成 TimeoutQC，触发 View Change
```

#### 安全性规则（Safety Rules）

```
Replica 仅在满足以下条件之一时才 COMMIT：

1. high_qc.view == proposal.view - 1
   （连续轮次的 QC，标准三链规则）

2. proposal.block extends high_qc.block
   （提案建立在已知最高 QC 的区块之上）

这保证了：诚实节点永远不会在同一高度提交两个不同区块
```

#### 与 StateKeeper 的集成

ChonkyBFT 的独特点在于其与 ZKsync Era StateKeeper 的紧密集成：

```
传统 BFT:
  共识决定 → 应用执行 → 写入状态

ChonkyBFT + StateKeeper:
  共识层:   管理 View、QC、区块哈希
  执行层:   StateKeeper 管理 L2 状态、交易执行、批次边界
  存储层:   Postgres 多存储（InMemStore / MultiStore 模式）
            → 支持原子提交与零操作回滚

关键设计: 共识提交 ≠ 状态最终确定
         状态最终确定需等待 ZK 证明上链
```

#### 验证人委员会（Validator Committee）

```
Committee = { v₁, v₂, ..., vₙ }   n = 固定集合（ZKsync Era 早期阶段）

每个验证人:
  - 持有 BLS12-381 密钥对（用于聚合签名）
  - 运行完整 StateKeeper（执行所有交易）
  - 参与出块投票

聚合签名:
  CommitQC = AggregateSign(sigs₁...sigs_{n-f})
           = 固定大小，O(1) 验证
           ← 相比 PBFT 的 n 个独立签名，验证效率大幅提升
```

---

## 四、横向对比

### 4.1 CFT vs BFT 基本对比

| 维度 | CFT（Paxos / Raft） | BFT（PBFT / HotStuff / ChonkyBFT） |
|------|--------------------|------------------------------------|
| **故障模型** | 节点崩溃（不发消息） | 节点任意恶意行为 |
| **容忍条件** | `n ≥ 2f + 1` | `n ≥ 3f + 1` |
| **最小节点数**（容忍1个故障） | 3 | 4 |
| **信任假设** | 节点诚实但可能崩溃 | 节点可能主动攻击 |
| **适用场景** | 内部数据库、分布式存储 | 区块链、去信任多方系统 |
| **性能开销** | 低 | 高（额外轮次和签名） |
| **代表系统** | etcd、ZooKeeper、CockroachDB | 区块链网络、跨机构系统 |

### 4.2 各 BFT 协议核心对比

| 维度 | PBFT | Tendermint/CometBFT | HotStuff | HotStuff-2 | ChonkyBFT |
|------|------|---------------------|----------|------------|-----------|
| **提出年份** | 1999 | 2014 | 2018 | 2023 | ~2023 |
| **消息复杂度（正常路径）** | O(n²) | O(n²) | **O(n)** | **O(n)** | **O(n)** |
| **View Change 复杂度** | O(n²) | O(n²) | **O(n)** | **O(n)** | **O(n)** |
| **协议阶段数** | 3 | 2 | 3（或4含DECIDE） | **2** | 2 |
| **流水线** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **聚合签名** | ❌ | ❌（独立签名） | ✅（门限签名） | ✅ | ✅（BLS聚合） |
| **乐观响应性** | ❌ | ❌（依赖超时） | ✅ | ✅ | ✅ |
| **立即最终确定** | 收到 2f+1 COMMIT 消息即确认（同轮次内） | 收到 2f+1 PRECOMMIT 即确认（同轮次内） | 需要 3 个后续轮次才确认（延迟确认） | Two-Chain Rule，需要 2 个后续轮次（延迟更少） | 类似 HotStuff，依具体实现的链规则 |
| **适用规模** | ≤ 20节点 | ≤ 200节点 | 100+ 节点 | 100+ 节点 | 验证人委员会 |
| **主要应用** | 早期 BFT 系统 | Cosmos 生态 | Diem/Aptos | 下一代L1 | ZKsync Era |

### 4.3 CFT 协议（Paxos vs Raft）对比

| 维度 | Paxos (Multi-Paxos) | Raft |
|------|---------------------|------|
| **可理解性** | 低（"The most difficult"） | 高（设计目标即可理解性） |
| **Leader 模型** | 弱 Leader（Multi-Paxos 有 Leader，但不强制） | 强 Leader（所有写必须经过 Leader） |
| **日志空洞** | 允许（乱序提交） | 不允许（严格连续） |
| **成员变更** | 未标准化 | Joint Consensus 或 Single-server 变更 |
| **Leader 选举** | 未标准化 | 明确的随机超时机制 |
| **工程完整性** | 需大量自行设计 | 提供完整协议规范 |
| **读优化** | 需额外机制（Lease Read 等） | ReadIndex / Lease Read |
| **代表实现** | Chubby, ZooKeeper | etcd, TiKV, CockroachDB, Consul |

### 4.4 协议演进脉络

```
1989  Paxos（理论基础）
  │
  │  ← 工程化困难
  │
1998  Multi-Paxos（工程化尝试）
  │
  │  ← 可理解性差
  │
2014  Raft（CFT 最终形态，易理解易实现）
  │
  │  ← 区块链兴起，需要 BFT
  │
1999  PBFT（第一个实用 BFT）
  │
  │  ← O(n²) 瓶颈
  │
2014  Tendermint（区块链原生 BFT，仍 O(n²)）
  │
  │  ← 可扩展性需求
  │
2018  HotStuff（线性复杂度突破，O(n)）
  │
  │  ← 减少轮次
  │
2023  HotStuff-2（两阶段优化）
  │
  │  ← ZK-Rollup 特殊需求
  │
2023+ ChonkyBFT（ZK-Rollup 定制 BFT）
```

### 4.5 安全性与活性保证对比

| 协议 | Safety 条件 | Liveness 条件 | 网络假设 |
|------|------------|--------------|---------|
| Paxos | ≥ f+1 诚实节点 | ≥ f+1 诚实节点 + 弱同步 | 部分同步 |
| Raft | 多数存活 | 多数存活 + 网络稳定 | 部分同步 |
| PBFT | ≥ 2f+1 诚实节点 | ≥ 2f+1 诚实节点 + 最终同步 | 部分同步 |
| Tendermint | ≥ 2/3 权重诚实 | ≥ 2/3 权重诚实 + 超时收敛 | 部分同步 |
| HotStuff | ≥ 2f+1 诚实节点 | ≥ 2f+1 诚实节点 + Pacemaker | 部分同步 |
| ChonkyBFT | ≥ 4f+1 诚实节点（n ≥ 5f+1） | ≥ 4f+1 诚实节点 + 超时机制 | 部分同步 |

> **注**：Safety 在异步网络中可以保证；Liveness 需要部分同步假设（即 GST 后网络延迟有界）。

---

## 附录：关键术语速查

| 术语 | 含义 |
|------|------|
| **Safety** | 安全性：所有诚实节点不会对不同值达成共识 |
| **Liveness** | 活性：系统最终能够对某个值达成共识，不会永远阻塞 |
| **Quorum** | 法定人数：达成共识所需的最小节点集合 |
| **QC（Quorum Certificate）** | 仲裁证书：对某消息的多数签名聚合 |
| **View / Term / Round** | 逻辑时钟单位，每个 Leader 对应一个视图/任期/轮次 |
| **Pacemaker** | 活性保证模块：处理超时、触发 View Change |
| **Finality** | 最终确定性：区块一旦提交则不可回滚 |
| **GST（Global Stabilization Time）** | 全局稳定时间：部分同步模型中网络进入同步状态的时间点 |
| **BLS 签名** | Boneh–Lynn–Shacham 签名，支持高效聚合 |
| **Threshold Signature** | 门限签名：n 个节点中 t 个即可生成有效签名 |