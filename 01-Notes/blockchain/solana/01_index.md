# Solana 架构手册

## 目录

1. 引言  
2. 核心设计理念  
   2.1 并行执行与高吞吐  
   2.2 状态与程序分离  
   2.3 无共享状态模型  
3. 关键组件与协议  
   3.1 Proof of History (PoH)  
   3.2 共识机制：Tower BFT + PoS  
   3.3 交易传播：Gulf Stream  
   3.4 区块传播：Turbine  
   3.5 Block 构建 / 流水线 / TPU  
   3.6 并行执行：Sealevel / SVM  
   3.7 账户模型 / 程序模型 / PDA / 可升级合约机制  
   3.8 网络拓扑 / 节点角色  
   3.9 可升级机制 / Loader 体系  
   3.10 资源限制（Compute Units、账户空间、租金机制）  
4. 交易执行流程  
   4.1 客户端构造交易  
   4.2 签名 / 验证 / 支付费用  
   4.3 账户加载 / 权限验证  
   4.4 程序 dispatch（函数路由机制）  
   4.5 Cross-Program Invocation (CPI)  
   4.6 写回状态 / 费用结算  
5. 扩展性设计与挑战  
   5.1 多账户拆分策略  
   5.2 reallocate / 扩容限制  
   5.3 链下存储 + 证明机制  
   5.4 并行冲突与锁控制  
6. 安全 / 容错 / 边界情况  
   6.1 分叉 / 重组 / 数据一致性  
   6.2 并发交易冲突处理  
   6.3 程序升级安全模式  
   6.4 资源滥用 / DoS 风险  
7. 架构演进方向 / 未来展望  
   7.1 SVM / 模块化 Solana  
   7.2 Layer2 / Rollup 架构整合  
   7.3 更灵活的状态模型  
8. 资源与参考资料  

---

## 各章节概要

### 1. 引言  

本章说明编写本手册的目的、Solana 架构学习意义、目标读者范围。

### 2. 核心设计理念  

#### 2.1 并行执行与高吞吐  

Solana 的设计目标之一就是高 TPS。为此，它引入了并行执行模型：只要多个交易访问的账户集合不冲突，就可以并行执行。

#### 2.2 状态与程序分离  

Solana 中，程序账户只存放可执行代码；所有持久化状态都保存在独立账户（Account）中。程序在执行期间通过传入账户访问状态。

#### 2.3 无共享状态模型  

Solana 避免跨账户共享数据，简化冲突检测与并行执行逻辑。

---

### 3. 关键组件与协议  

#### 3.1 Proof of History (PoH)  

PoH 是一种可验证延迟函数 (VDF)，用于在链上生成不可篡改的时间序列，帮助节点快速达成交易顺序。参见 Solana 白皮书中关于 PoH 的章节  [oai_citation:0‡solana.com](https://solana.com/solana-whitepaper.pdf?utm_source=chatgpt.com)。

#### 3.2 共识机制：Tower BFT + PoS  

在 PoH 时钟基础上，Solana 使用优化的 BFT 算法 (称为 Tower BFT)，结合 PoS 模型来达成共识。

#### 3.3 交易传播：Gulf Stream  

Gulf Stream 机制允许交易提前发给将成为 block leader 的节点，以减少 mempool 延迟。

#### 3.4 区块传播：Turbine  

Turbine 将区块拆分成多个小包，通过分层传播机制高效分发给验证节点。  

#### 3.5 Block 构建 / 流水线 / TPU  

Leader 节点负责交易聚合、执行、状态更新、打包。TPU (Transaction Processing Unit) 负责加速广播与执行。

#### 3.6 并行执行：Sealevel / SVM  

Solana 的运行时称 Sealevel（或未来的 SVM），支持多交易并行执行，只要它们没有账户冲突。SVM 是对并行虚拟机的抽象。  [oai_citation:1‡squads.so](https://squads.so/blog/solana-svm-sealevel-virtual-machine?utm_source=chatgpt.com)  

#### 3.7 账户模型 / 程序模型 / PDA / 可升级机制  

- 所有状态以 `key → Account` 存储  
- 程序账户用于存可执行代码  
- PDA（Program Derived Address）是无私钥控制但可由程序操作的地址  
- 可升级合约机制涉及 Program Account、ProgramData Account、Buffer Account  
- Loader 版本（如 BPFLoader、BPFLoaderV4）  

#### 3.8 网络拓扑 / 节点角色  

区块链网络节点角色包括：验证节点、RPC 节点、Leader 节点等。传播采用 Gossip 协议。Solana 的网络架构见 Anatoly Yakovenko 的设计文档  [oai_citation:2‡Medium](https://medium.com/solana-labs/solanas-network-architecture-8e913e1d5a40?utm_source=chatgpt.com)。

#### 3.9 可升级机制 / Loader 体系  

讨论新版 loader（如 v4）、程序升级流程、权限管理机制。

#### 3.10 资源限制  

包括 Compute Units (CU)、账户空间（`space` 固定）、租金（rent）机制等。

---

### 4. 交易执行流程  

1. 客户端构造交易（指定 programId、keys、data）  
2. 签名 / RPC 发送 / 广播  
3. 节点接收后验证签名、费用、账户权限  
4. 加载账户为 `AccountInfo`  
5. 调用程序的 dispatch entrypoint → 匹配 discriminator → 执行相应方法  
6. 程序内部可能触发 CPI（Cross-Program Invocation）  
7. 写回修改后的账户状态  
8. 收费结算 / 租金抽取  

---

### 5. 扩展性设计与挑战  

- 多账户拆分：按功能拆分状态账户，避免单账户过大  
- `reallocate` 扩容：Anchor 支持 realloc 但有上限  
- 链下存储 + 证明：用 Merkle / 提交根哈希减状态  
- 并行冲突：多个交易访问同一账户时冲突处理策略  

---

### 6. 安全 / 容错 / 边界情况  

- 分叉 / 重组处理机制  
- 并发冲突事务失败回滚  
- 程序升级时的保护机制  
- DoS 攻击 / 资源滥用防护  

---

### 7. 架构演进方向 / 未来展望  

- SVM / 模块化 Solana：将执行层与验证层分离  
- Layer2 / Rollup 整合：Solana 上的 rollup 方案  
- 更灵活状态模型 / 可变空间存储  

---

### 8. 资源与参考资料  

- Solana 白皮书 “A new architecture for a high performance blockchain”  [oai_citation:3‡solana.com](https://solana.com/solana-whitepaper.pdf?utm_source=chatgpt.com)  
- Solana 的网络架构文章 by Anatoly Yakovenko  [oai_citation:4‡Medium](https://medium.com/solana-labs/solanas-network-architecture-8e913e1d5a40?utm_source=chatgpt.com)  
- Solana Executive Overview 报告  [oai_citation:5‡Helius](https://www.helius.dev/blog/solana-executive-overview?utm_source=chatgpt.com)  
- SVM / 并行执行相关文章  [oai_citation:6‡squads.so](https://squads.so/blog/solana-svm-sealevel-virtual-machine?utm_source=chatgpt.com)  
- Solana 文档官网  [oai_citation:7‡solana.com](https://solana.com/docs?utm_source=chatgpt.com)  
- 其他社区深度技术文章  [oai_citation:8‡Medium](https://medium.com/%40tobs.x/a-dive-into-solanas-technical-architecture-190938484b68?utm_source=chatgpt.com)  

---
