# HVN（HSK Validation Network）

# 概括

在原有 Optimism 的架构中增加 VN（Validation Network）组件，该组件是在原有 op-node 和 op-geth 之外组成的共识网络。VN 节点可以：

1. 接收 op-node 提议的payload attribute，执行区块的创建；

2. 向 Sequencer 的 op-geth 交付要执行的区块。

接收到 op-node 提议的payload attribute后，会将该数据转发到共识组件，以确认参数的合法性，在此之前， Sequencer 的 op-geth 不会收到创建区块的请求，在经过验证网络共识之后，会重新将payload attribute转发到op-geth。通过将区块构建验证过程与 Sequencer 的执行引擎分离，可以无需修改标准的 Optimism 架构和协议，并可实现验证 Sequencer 的区块和交易。

# 实现方向

在 Optimism 系统中`op-node`和`op-geth`组件之间增加的 `VN` 和 `VN节点`作为中介，其中 VN节点又由多个组件构成。

这样设计的主要作用：验证者网络的存在对`op-node`和`op-geth`都是隐藏的，从他们的角度来看和之前一样的相互通信。

## 架构

整体架构：

![image-20250123155441900](https://raw.githubusercontent.com/dreamer-zq/PicGo/main/img/image-20250123155441900.png)

VN节点：

![image-20250123155534751](https://raw.githubusercontent.com/dreamer-zq/PicGo/main/img/image-20250123155534751.png)

**关键组件及其作用：**

1. 验证者网络：
   
   在 Sequencer 的`op-node`和`op-geth`组件之间增加的 `VN` ，其中`op-node`由之前访问`op-geth`改成访问验证人节点。
   
   - `op-node`：通过 engine API 调用创建区块接口。
   - `Validation Network`：根据接收`op-node`的区块在网络中进行共识，并执行后验证交易合法性。
   - `op-geth`：L2 ETH 执行引擎，接收验证者网络执行区块的请求。
   
2. 验证人节点：

   - `engine-proxy`：实现标准的 engine API，接收来自 Sequencer 的`op-node`构造区块的请求。
   - `local-geth`：基于`op-geth`改造，主要用于共识节点本地执行区块，然后保存本地状态。
   - `consensus`：接收`local-geth`的区块提议，并在共识网络的验证人节点之间通信，保持状态一致性。

3. 整体流程：

   - Sequencer 的`op-node`向验证人节点的`engine-proxy`发送构造区块数据（ ForkchoiceUpdated）。
   - `engine-proxy`将区块发送本地`op-geth`执行区块，并保存状态。
   - `local-geth`提交区块提议，并在共识网络中投票。
   - `consensus`层共识完成后，`engine-proxy`向 Sequencer 的`op-geth`发送执行区块（NewPayload）。

## 软件维护

采用插件化方式开发和维护该软件，不仅契合现有的以太坊 L1 架构，还便于对当前系统进行升级，并灵活适配未来 Optimism 架构的调整。该方案在实现区块构造和执行功能的同时，兼顾了维持现有系统架构的完整性与简洁性。

## 权衡

### 好处

1. 扩展性：将来允许适配各种出块逻辑和交易排序，无需修改核心 Optimism 协议。
2. 最少的修改：不需要更改现有的`op-node`或`op-geth`组件，简化集成和维护，迭代设计出完美的集成方案。
3. 有效的解决因sequencer作恶导致的非法区块以及L2重组的问题。

### 可能的影响

1. 在node和geth之间添加一层逻辑后，执行效率会增加一定延迟。
3. 可能需要增加适当的说明，否则缺乏充分的解释可能导致协议的某些部分对用户来说不够透明。

# 风险与不确定性

1. **性能影响**：在 `op-node` 和 `op-geth` 之间引入共识网络可能会在区块生产和执行引入额外的延迟，从而影响整体系统性能。
2. **安全漏洞**：新引入的共识网络可能是一个新的攻击点，需要加以保护，特别是在验证人节点和`op-ndoe`之间的身份验证和授权方面。
3. **维护**： `op-node` 或 `op-geth` 依赖于特定的接口或行为，则未来的更新可能会影响其功能，从而产生兼容性问题。

