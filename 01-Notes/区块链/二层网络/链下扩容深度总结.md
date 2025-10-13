## 1. 扩容的必要性

区块链的未来是一个宏大的愿景：去中心化、安全性和可扩展性；但通常区块链只能实现其中两个，同时满足这三个要求被称为区块链的不可能三角问题（如下图所示）。多年来，人们一直在探索如何解决这一难题，如何在保证去中心化和安全性的前提下，提高区块链的吞吐量和交易速度，即解决扩容问题，是当前区块链发展过程中讨论的热点话题之一。

让我们先笼统地定义区块链的去中心化、安全性和可扩展性：

- 去中心化：任何人都可以成为节点参与区块链系统的生产和验证，节点数量越多，则去中心化程度越高，从而确保网络不受一小群大型中心化参与者的控制。
- 安全性：为了获取区块链系统控制权所付出的成本越高，则安全性越高，那么链就可以抵抗较大比例的参与者对其的攻击。
- 可扩展性：区块链处理大量交易的能力。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701168133-a4db8d56-698f-4040-9b3b-ec4c977b7aff.png)

比特币网络的第一次重大硬分叉就是源于扩容问题。随着比特币的用户数量和交易量的增多，每个区块上限为 1MB 的比特币网络开始面临拥堵问题；2015 年开始，比特币社区就扩容问题存在分歧，一方是以 Bitcoin ABC 为代表的支持扩大区块的扩容派，另一方是以 Bitcoin Core 为代表的小区块派，认为应当使用隔离见证 Segwit 方案去优化主链结构。2017 年 8 月 1 日，Bitcoin ABC 自行开发至 8MB 的客户端系统开始运行，导致了比特币历史上第一次重大硬分叉的出现，同时也由此诞生了新币种 BCH。

同样，以太坊网络也是选择牺牲了一部分可扩展性，用来保障网络的安全性和去中心化；虽然以太坊网络并未像比特币网络一样通过限制区块大小来限定交易量，而是变相转变为对单一区块可容纳的燃料费设置上限，但是目的都是为了实现 Trustless Consensus 并确保节点的广泛分布（无论取消还是提高限额都会淘汰很多带宽、存储和计算量不足的较小节点）。

从 2017 年的 CryptoKitties，DeFi summer、再到后来 GameFi 和 NFT 等链上应用的兴起，市场对吞吐量需求不断增加，但即使是图灵完备的以太坊每秒也只能处理 15~45 笔的交易（TPS），这导致的结果是交易成本不断增加，结算时间变长，大部分 Dapps 难以承受运行成本，整个网络对于用户而言也变的又慢又贵，区块链扩容问题亟待被解决。理想状态下的扩容方案是：在不牺牲去中心化和安全性的前提下，还能尽可能提高区块链网络的交易速度（更短的 finality time）和交易吞吐量（更高的 TPS）。

## 2. 扩容方案的类别

我们按照「**是否改变一层主网」**作为标准，把扩容方案分为链上扩容和链下扩容两大类。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701168129-324d6f11-aebf-4fe3-bdab-f96e1d15097b.png)

### 2.1 链上扩容

核心概念：通过改变一层主网协议达到扩容效果的解决方案，目前的主要方案是分片。

链上扩容有多种方案，此篇文章不进行展开，以下简要列举两种方案：

- 方案一是扩大区块空间，即增加每个区块打包的交易数量，但这会提高对高性能节点设备的要求，提高节点的加入门槛，降低了「去中心化」程度。
- 方案二是分片，将区块链账本分成若干部分，不再是每个节点参与所有记账，而是由不同分片即不同节点负责不同记账，并行计算可以同时处理多个交易；这样可降低节点计算压力和加入门槛，提高交易处理速度和去中心化程度；但这意味着全网算力被分散，会降低整个网络的「安全性」。

改变一层主网协议的代码可能会产生难以预料的负面影响，因为底层任何细微的安全漏洞都会严重威胁整个网络的安全性，网络可能会被迫进行分叉或中断修复升级。例如，2018 年的 Zcash 的通胀漏洞事件：Zcash 的代码是基于比特币 0.11.2 版本代码修改的，2018 年一位工程师发现其底层代码存在高危漏洞，即代币可无限增发，随即团队花了 8 个月的时间进行秘密修补，漏洞修复后才公开这一事件。

### 2.2 链下扩容

核心概念：不改变现有一层主网协议的扩容解决方案。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701168343-722b2e7a-63b9-46c4-a9ff-8b9e5f4171f3.png)

链下扩容方案又可以细分为 Layer2 和其他方案：

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701168123-29680bd1-6178-4402-b480-c1611bbce10a.png)

_注：表格内的术语定义来自以太坊官网，内容由 Cobo Ventures 总结梳理。_

下面我们将从发展时间线、技术原理、优缺点和应用对比等方面展开介绍目前主流的链下扩容方案。

## 3. 链下扩容的方案

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701168199-d24010f5-86e3-4ce0-b72a-264d50f106d2.png)

### 3.1 State Channels

**3.1.1 概要**

状态通道规定只有在通道打开、关闭或解决纠纷时，用户才需要与主网进行交互，并把用户与用户的交互放在链下进行，以此来降低用户交易的时间和金钱成本，并且实现交易次数不受限制。

状态通道是简单的 P2P 协议，适合「基于回合的应用程序」，例如，两人国际象棋游戏。每个通道都由主网上运行的多签智能合约管理，该合约控制存入通道的资产，验证状态更新，并仲裁参与者之间的争议（根据带有签名和时间戳的欺诈证明）。参与者在区块链网络部署合约后，存入一笔资金并锁定，双方签名确认后，通道正式开通。通道允许参与者之间进行不限次数的链下免费交易（只要他们的转账净值不超过存入的代币总额）。参与者轮流发送状态更新给对方，等待对方的签名确认。一旦对方签名确认，这笔状态更新就算完成。正常情况下，双方同意的状态更新不会上传主网，只有在出现争议或关闭通道时，才会依赖主网确认。需要关闭通道时，任一参与者可在主网提出交易请求，如果退出请求获得全员一致签名批准，则链上立即执行，即智能合约根据通道最终状态下每个参与者的余额，分发剩余的锁定资金；如果其他参与者没有签名批准，则所有人需等待「挑战期」的结束才能收到剩余资金。

综上，状态通道方案可以大大减少主网计算量，提升交易速度，降低交易成本。

**3.1.2 时间线**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701169797-932ac91e-fdc8-44fe-9935-46f6e426a556.png)

上图时间线展示了 State Channels 的发展和演变的主要里程碑。

- 2015/02，Joseph Poon 和 Thaddeus Dryja 发布了闪电网络白皮书草案。
- 2015/11，Jeff Coleman 首次系统性总结了 State Channel 的概念，提出比特币的 Payment Channel 是 State Channel 概念中的一个子案例。
- 2016/01，Joseph Poon 和 Thaddeus Dryja 正式发表白皮书《The Bitcoin Lightning Network: Scalable Off-Chain Instant Payments》提出比特币闪电网络的扩容方案 Payment Channel（支付通道），该方案仅用于处理比特币网络上的转账支付。
- 2017/11，第一个基于 Payment Channel 框架下的有关 State Channel 的设计规范 Sprites 被提出。
- 2018/06，Counterfactual 提出了一个非常详细的 Generalized State Channels 设计， 这是第一个完全与状态通道相关的设计。
- 2018/10，文章 Generalised State Channel Networks 提出 State Channel Networks 和 Virtual Channels 的概念。
- 2019/02，状态通道的概念扩展到 N-Party Channels，Nitro 是首个基于该想法建立的协议。
- 2019/10，Pisa 为了解决所有参与者需要持续在线的问题，拓展了 Watchtowers 的概念。
- 2020/03，Hydra 提出 Fast Isomorphic Channels。

**3.1.3 技术原理**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701169955-768f911e-4141-4c7b-804f-2fff0996b3cf.png)

_Source: L. D. Negka and G. P. Spathoulas， "Blockchain State Channels: A State of the Art" in IEEE Access， vol. 9， pp. 160277-160298， 2021， doi: 10.1109/ACCESS.2021.3131419._

图 1 展示的是传统链上的工作流程：Alice 和 Bob 与部署在主网上的智能合约进行交互，用户通过向链上发送交易来改变智能合约的状态。缺点是会带来上面讨论的时间和成本问题。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701170615-46dfd00f-7edf-4b5a-9850-788d4184365f.png)

_Source: L. D. Negka and G. P. Spathoulas， "Blockchain State Channels: A State of the Art" in IEEE Access， vol. 9， pp. 160277-160298， 2021， doi: 10.1109/ACCESS.2021.3131419._

图 2 展示的是大多数状态通道协议遵循的一般工作流程：乐观情况下，Alice 和 Bob 需要执行与之前相同的操作，但这次他们使用状态通道，而不是与链上合约进行交互。

- 第一步，Alice 和 Bob 通过从其个人 EOA 存入资金到链上合约地址（交互 1，2），这些资金被锁定在合约中，直到通道关闭时才将余额返回给用户；二人签名确认后，二人之间的状态通道正式开通。
- 第二步，Alice 和 Bob 通过该通道理论上可在链下开展不限次数的交易（蓝色虚线），参与者通过加密的签名消息相互通信（而不是与区块链网络通信）。双方用户都需要对每笔交易进行签名，以防止双花作恶。通过这些消息，他们提出自己账户的状态更新，并接受对方提出的状态更新。
- 第三步，如果 Alice 想关闭通道结束和 Bob 之间的交易，Alice 需要向合约提交自己账户的最终状态（交互 3），如果 Bob 签名批准，合约则会根据最终状态将锁定的资金释放返回对应用户（交互 4，5）。如果 Bob 未响应签名，合约则会在挑战期结束后将锁定的资金释放返回对应用户。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701170207-ef433b5d-7a5f-41ff-85ad-143f63972fbb.png)

_Source: L. D. Negka and G. P. Spathoulas， "Blockchain State Channels: A State of the Art" in IEEE Access， vol. 9， pp. 160277-160298， 2021， doi: 10.1109/ACCESS.2021.3131419._

图 3 显示的是悲观情况下状态通道的工作流程：起初，两个参与者存入资金（交互 1，2），然后开始交换状态更新（蓝色虚线）。假设在某个时间点，Bob 在他的轮次中不响应 Alice 发送来的状态更新签名（交互 3），此时，Alice 可以通过向合约提交自己最后一次的有效状态来发起挑战（交互 4），这个有效状态也包含了 Bob 之前的签名，从而证明最后一笔交易已经收到 Bob 的批准，最后状态已经收到 Bob 的确认。然后，合约允许 Bob 在一段时间内通过将下一个状态提交给合约进行响应；如果 Bob 响应，则二人可以继续在状态通道内进行交易；如果 Bob 在该时间段内没有响应，则合约自动关闭状态通道并将资金返回给 Alice（交互 5）。

**3.1.4 优缺点**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701170346-c69e72ee-6aaa-4122-8359-1cf698582233.png)

**3.1.5 应用**

**比特币闪电网络**

概述：

闪电网络是比特币网络的小额支付通道，其整体技术演变经历：2/2 多签构建单向支付通道，增加 RSMC（Revocable Sequence Maturity Contract）后可构建双向支付通道，再增加 HTLC（Hash Time Lock Contract) 后可连接支付通道拓展到多人支付，最终构建支付网络即闪电网络。通过链下小额支付通道，然后借助中间人构成交易网络，可以解决比特币网络扩容问题。闪电网络的整体使用遵循着「存款（建立通道）→ 闪电网络交易（更新通道状态）→ 退款 / 结算（结束通道）」的流程；理论上闪电网络每秒可以处理一百万笔交易。

时间线：

- 2015 年 2 月，Joseph Poon 和 Thaddeus Dryja 发布了闪电网络白皮书的草稿；
- 2016 年 1 月发布正式版白皮书并成立了 Lightning Labs；
- 2018 年 3 月 15 日，Lightning Labs 发布第一个闪电网络主网版本 Lightning Network Daemon (LND) 0.4 版本。
- 2021 年初，闪电网络的公共容量（TVL）只有约 4000 万美元，约不到 10 万用户使用闪电网络。
- 2021 年 6 月，萨尔瓦多宣布采用比特币作为法定货币，9 月发布基于闪电网络的钱包 Chivo。
- 2022 年，Cash App 和包括 OKX、Kraken、Bitfinex 在内的 26 个加密货币交易平台宣布支持闪电网络，实现即时且便宜的的 BTC 存取款和转账功能。
- 2022 年 10 月，Lightning Labs 发布了基于 Taproot 的新协议——Taro protocol(alpha 版本 )，目前正在测试网上进行测试，未来将可用于在比特币网络上铸造、发送和接收资产，并通过闪电网络执行即时、大容量和低费用的交易。
- 2022 年 11 月 23 日，根据 1ml.com，闪电网络共有 76,236 个支付通道，通道资金 5049 $BTC（$81.8M）。

生态发展：

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701170877-ccb1f93d-9067-4bd7-9dfc-a650489a7144.png)

_Source:https://blog.coinbase.com/is-the-bitcoin-lightning-network-for-real-26e47029687f_

如上图所示，BTC 闪电网络生态从下到上依次为：底层的 BTC 网络—核心基础设施—各种 Dapps。

核心基础设施包括

- 闪电网络解决方案：个人和企业可以运行、连接到闪电网络的软件程序，其中所占市场份额最大的是闪电实验室 Lightning Labs。
- 节点和流动性服务：因为用户独立运行自己的节点较为复杂，需要提供对用户较为友好的界面，帮助管理闪电支付渠道。

核心基础设施之上是各种支付和金融服务以及应用程序，例如，Strike 建立在 LND 解决方案之上允许用户买卖 BTC，在 Twitter 上使用 BTC 打赏创作者和允许 Shopify 商家接受 BTC 等。

截止 2022 年 11 月，基于比特币闪电网络的 Dapps 已增涨至超 20 个类别和 100 多个应用，应用类别主要包括比特币闪电网络支付、钱包、节点管理、浏览器扩展程序、播客和流媒体等。当前与节点基础设施相关的技术基础层已经基本成熟，钱包支持增加，金融服务和支付集成继续增长，更多的娱乐应用在闪电网络上构建，闪电网络生态系统正在蓬勃发展。

**以太坊雷电网络**

概述：

雷电网络是基于以太坊的小额支付通道，与闪电网络非常相似，都是通过建立状态通道的方式来对链上交易进行拓展，目的是在以太坊上实现近乎即时、低费用和可扩展的 ERC20 代币支付。

时间线：

- 2017 年成立，创始人 Heiko Hees 曾是以太坊的核心开发者以及顾问。
- 2017 年 10 月 17 日以荷兰拍卖形式为其代币 $RDN 发起了 ICO，筹集了超过 3000 万美元。
- 2020 年 5 月第一个 Raiden Light Client - Alderaan 在以太坊主网上线，是基于 Typescript 的雷电网络的实现；
- 2021 年底，由于长时间缺乏开发进展、信息披露和用户使用情况，多个交易所将 $RDN 摘牌，包括 Bitkub，NiceHash 和 Binance。

目前这项技术未获得广泛采用，原因包含：

1）使用门槛过高：以太坊上的 Gas 费用过高时，开启通道的成本过高，这成为采用 Raiden 网络的一大障碍。

2）更先进的扩容技术出现：Raiden Network 于 2015 年开始研发，当时是以太坊唯一的扩容方案。但目前出现了 Rollup 等更好的扩容方案，导致 Raiden Network 本身的用例受限。

生态发展：

目前雷电网络的生态发展缓慢，团队正在改造 Raiden Network，使其运行在以太坊 Layer2 Rollup 网络上，从而进一步降低创建 State Channel 的 Gas 费用；2022 年 5 月团队宣布 Raiden Network 在 Arbitrum 上线，成为一个 rollup native protocol，L2 之上运行的 L2；该方案把初始创建通道的费用降低了 35%，使其更适用于高频小额支付场景；雷电网络未来将以 Rollups 为中心进行转变，作为与 Rollups 共存的补充方案。

**Celer Network**

概述：

Celer Network 本质上是一个增加了激励层（代币 $CELR）的闪电网络，可通过链外扩展技术和激励性经济模型构建快速、易于使用、低成本和安全的高频交互类型的区块链 Dapps，如电子竞技平台等。因为其用户入场费和奖金的发放有极高的交互频率，非常适合状态通道技术的应用。

假设 Alice 和 Carl 之间通过状态通道进行下棋游戏，二人需要首先在主网存款创建通道，链下有一个管理游戏规则的合约，并且该合约的地址会在有条件的支付中被引用，举例，「如果合约判定 Carl 赢得游戏，Alice 将支付 Carl1 美元」；每个链下合约都有一个唯一可识别的链下地址，只有在需要时合约才在区块链上进行部署，并且由内置的链下地址转换器分配对应的链上地址，其他合约或对象可以明确的引用它。二人之间所有的游戏状态转换（账户余额）经双方签名确认，也都发生在链下，这些状态在需要时（出现争议时）可在链上验证。通过 Celer Network 提供的链下地址转换器OAT（Off-chain Address Translator），每一个链下地址可以唯一映射一个链上的智能合约；因此，Alice 和 Carl 之间的游戏，只要双方持续合作，没有争议产生，整个游戏（合约 + 状态）都无需上链操作。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701171258-777679e8-5164-4d38-90c1-9c57069e0888.png)

_Source: https://www.celer.network/doc/CelerNetwork-Whitepaper.pdf_

如上图所示，Celer Network 基于以太坊实现的链下扩容框架由三层组成，从下到上为：

- cChannel：广义状态通道和侧链套件
- cRoute：链下支付路由，使用的创新路由算法 DBR（Distributed Balanced Routing）提高了性能
- cOS：链下应用程序的开发框架和运行环境

时间线：

- 2018 年创立，团队成员来自 MIT、Princeton、UCBerkeley 和 UIUC 的计算机博士。
- 2019 年 3 月，代币 $CELR 在币安 Launchpad 发布。
- 2019 年 7 月，Celer Network 在以太坊主网上线，发布世界上第一个 Generalized State Channel Network；同时上线电子竞技游戏平台 CelerX，CelerX 是 iOS 和 Android 上第一个 L2 Dapp，其用户可以通过 Celer Pay 进行即时零手续费支付，畅玩各种技能类游戏。

生态发展：

随着区块链生态系统朝着多链发展，状态通道被赋予桥接 Layer1 和 Layer2 的新使命。Celer Network 扩展了其广义状态信道网络的核心技术，转变为支持跨链的 L2 扩容聚合平台，目前已推出的产品包含 DeFi 协议 Layer2.finance，信息跨链协议 Celer IM 和资产跨链桥 cBridge。cBridge 已支持多达 139 种 token 和 38 条链。

2022 年 11 月 11 日，MetaMask Bridges Beta 集成 cBridge，11 月 17 日 cBridge 的总交易数达到 1M，当日同时宣布 cBridge 和 Celer IM 集成 zkSync 2.0 测试网。

**3.1.6 应用比较**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701171360-cd96092b-9862-45c7-a55d-0c38c270c476.png)

### 3.2 Sidechains

**3.2.1 概要**

侧链的概念首次于 2012 年比特币开发人员在聊天室中被提出，而第一篇关于比特币的侧链文章是由一位 Blockstream 的研究员撰写并于 2014 年出版。

2014 年的论文当中提出，侧链是为了加快比特币交易而出现的一种区块链形态，可以使用更复杂的合约，或是通过改善共识机制（如 PoS），或是区块参数让侧链符合特定作用。侧链的交易结果最终在传送回主链时，会记录在验证者端。这种区块链模式并非新的区块链形态，而是附着于主链上并协助主链解决问题的基础建设。

**3.2.2 时间线**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701171727-a9660549-930a-4b11-8fb4-8b2e50cf2509.png)

- 2012/01，比特币侧链的概念在聊天室中被提出
- 2014/10，比特币侧链的论文初次发表：Symmetric Pegged and Asymmetric Pegged
- 2017/04，POA Network 基于以太坊 Proof of Authentication 共识的一条侧链上线测试网
- 2017/10，Matic Network 启动
- 2017/12，POA Network 主网上线
- 2018/01，Skales 测试网上线
- 2018/10，xDai Chain 测试网上线
- 2020/06，Skale 主网上线
- 2020/06，以太坊侧链 Matic PoS Chain 主网上线
- 2021/02，Matic Network 品牌更名为 Polygon Network
- 2021/02，Axie Infinity 游戏侧链 Ronin 主网开始运行
- 2021/12，xDai Chain 与 Gnosis Dao 合并成 Gnosis Chain
- 2022/03，POA Network 合并入 Gnosis Chain

**3.2.3 技术原理**

在侧链的技术原理当中，2014 年的论文提到双向锚定（Symmetric Pegged）与不协调锚定（Asymmetric Pegged）两种方式让侧链可以与主链进行沟通。双向锚定或不协调锚定的讯息传递只会在主链跟侧链的代币进行跨链时发生。由于侧链用到了跨链技术，因此，下文会先行讨论两种最根本的跨链技术原理，然后讨论侧链技术在应用层面的优缺点。

**Symmetric Pegged**

双向锚定（Symmetric Pegged）是指主链上（Parent Chains）跟侧链上的验证者，彼此都实时记录对方当前的状态（区块头信息）。在信息传递时，双向锚定会运用双向 SPV（Simplified Payment Verification）的技术。当主链的 token 要发送到侧链上时，会产出一个 special output（SPV-Locked Output），而只有侧链上的验证者可以用 SPV 证明解锁。SPV 技术是指只保留区块头信息，而从全节点获取 merkle proof 来验证交易的技术。

主要流程：

- 用户将原生资产发送给 SPV-Locked Output（一个特殊地址）。
- 等待 confirmation peirod，结束后即可向侧链提交 SPV 证明，侧链可以依据此准备发出链上资产。

SPV 证明用于验证交易是否已经发生。它包括一个展示工作证明的区块头列表以及一个加密证明（Merkle proof），证明一个输出（SPV-Locked Output）是在列表中的一个区块中创建的。

- 用户继续等待 contest period，以避免双花攻击。如果有人在此期间提交重组证明（reorganisation proof），其中包含了一个有更多总工作的链，而不包括创建 SPV-Locked Output 的区块，则之前的 SPV 证明无效。
- 所有确认程序完成后，用户即可在侧链上使用新铸的封装资产。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701171757-b81b21f5-3e49-48bd-8868-589433f484e6.png)

_Source:https://blockstream.com/sidechains.pdf_

**Asymmetric Pegged**

Asymmetric Pegged 是 2014 年最早提出侧链的论文当中提及的第二个方式，主要分成 forward 端与 backward 端的交易。在 Asymmetric Pegged 中，侧链的 validators 必需实时监控主链的活动，因此当主链需要将代币打给侧链时，侧链可以主动记录（forward transaction）。然而，当侧链需要将代币打回主链时，则会发生主链因为没有记录侧链信息，而无法确认侧链区块状态的问题。

因此，在这个状况下 Asymmetric Pegged 就必须引入 Certifiers 的机制，将

1. Smart ContractID，EpochID 与验证者 ID
2. Backward 转移的名单
3. 验证者取款名单
4. 错误报告名单
5. 聚合所有签名

![](https://cdn.nlark.com/yuque/0/2022/jpeg/1034768/1669701172109-85e7d64b-4929-435d-a146-2e64de6ebb3b.jpeg)

记录在 Certifiers 当中，通常 Certifiers 都需要 stake 固定资产以确保 Certifiers 不会破坏系统，这些 Certifiers 就会负责验证侧链传回的 backward transaction，并经由 aggregated signature 签名后送回主链。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701172283-f3fb2cac-ad8f-4bbf-a003-b74f30d8a8ed.png)

然而随着目前的技术演进，越来越多的侧链会选择使用第三方公证人（Proof of Authority, PoA）的机制，让多个具名节点针对合约锁定与释放的通讯（主网的区块头信息）验证，以确代币锁定与铸造价值相等；或是使用 Relayers 建立中间层让侧链可以通过中间层确认主链的区块状态。

简单来说侧链的机制可以总结为：

- 资产从主链 -> 侧链：主链锁定资产，侧链生成 wrapped asset( 由共识机制保证所有节点同意生成）；
- 资产从侧链 -> 主链：侧链销毁 wrapped asset，主链解锁资产。

可见，侧链上资产的安全性，并非取决于主链，而是取决于侧链的安全性，再进一步说是侧链的共识机制。如果有人设法「凭空」在侧链上创造了与锁定在主链上的资产不符的资产，继而在侧链销毁这些资产，再向主链提出解锁并不属于他们的资产，会有窃取资金的风险。

**3.2.4 优缺点**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701172596-42bc2a25-a746-443a-8f2a-a84753f6ba89.png)

**3.2.5 应用**

**xDai ( 现今更名为 Gnosis Chain)**

概述：

代币 $xDai 的产生来自于以太坊上的 $Dai 被锁定在代币桥上，因为 $xDai = 1USD，这使得 xDai 上的交易手续费容易被计算。xDai 的验证模式采用 PoSDAO 的模式，是通过质押的方式成为节点，质押者可以获得固定的 APR 15%，即 $xDai 的年通膨率为 15%。

时间线：

- 2018 年 9 月，xDai 正式主网上线
- 2021 年 11 月，Gnosis DAO 上的 GIP16 投票通过并购 xDai 的提案
- 2022 年 4 月，xDai 与 Gnosis 正式合并且更名为 Gnosis Chain（xDai 与 Gnosis 合并的主要原因在于 Gnosis 这间公司希望可以基于 xDai 給自己生态系具备更多开发场景。）

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701173040-59f58a49-925b-4c6d-9c61-ff0e10c7e170.png)

_Source: https://forum.gnosis.io/t/gip-16-gnosis-chain-xdai-gnosis-merge/1904_

Gnosis Chain 目前的跨链的方式是部署节点在主链与侧链上，而主链上的验证者是通过 committee 选举出来的 certifiers，换言之 Gnosis Chain 目前是采用 asymmetric pegged 的模式并使用 PoA 的选举完成。

生态发展：

目前 Gnosis Chain 的 TVL 在 Defi Llama 的排名为第二十，拥有~$53mil 的 TVL，让人最熟悉的项目是 Dark Forest。在 Defi Llama 的收录中，目前 Gnosis Chain 共有 35 个进行中的项目，其中头部项目分布在 Defi 与跨链桥领域。

**Polygon**

概述：

2017 年，Matic Network 成立。2020 年 6 月同时主网发布以太坊侧链——Matic PoS Chain 和 Matic Plasma Chain（在 3.3.5 有详述），2021 年品牌升级为 Polygon。其实 Polygon 被定义为是 L2 还是侧链一直以来都存在较大的争议，原因是虽然 Polygon 创始人认为他们是一种 L2 扩容方案，但因为 Polygon 拥有自己的验证模型，其安全性与以太坊主网不同，另外技术上以太坊如果停摆，Polygon 仍然可以运行，所以在此定义 Polygon 是一个侧链。

但以 Polygon 的未来路线图来说，创始团队希望把 Polygon 逐渐往 L2 靠拢。2022 年，Polygon 在 BD 层面迅速与许多 web2 巨头公司开展合作（如 Reddit，Disney 和 Instagram) 并且开启 Hermez zkEVM 以及 Polygon Zero 的计划，逐渐朝着路线图上的目标迈进。

Polygon 有四层：以太层、安全层、Polygon 层、执行层。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701173243-dd9fb30a-6e35-47bc-92f8-5d885e665ef9.png)

_Source:https://research.thetie.io/polygon-matic-research_

1. 以太层：该层是以太坊与 Polygon 沟通层，是信息交换的中间站，让 Polygon 可以有质押、解决纠纷与传递消息。（relayer 的官方性）
2. 安全层：使用 PoS 的节点对 Polygon 保证安全，并收取费用
3. Polygon 层：Polygon 运行的最基础必要层，用来运行区块并进行交易整理与共识演算。
4. 执行层：读取与执行 Polygon 链中的移转和交易，由执行环境进行。

时间线：

- 2017 年 Matic Network 成立。
- 2020 年 6 月 Matic Pos Chain 主网发布。
- 2021 年 2 月品牌更名为 Polygon。
- 2022 年 Polygon 宣布与 Reddit，Instagram, Disney 和 Starbucks 开展商业合作。

生态发展：

由于 Polygon 的低成本、EVM 兼容与速度快的特性，Polygon 在 2021 年发展迅速，开始在上面出现各种应用，目前的 TVL 从四月的 $110million 到现今已经 $1.07billion。生态系已经有超过 200 个项目部署，但没有太多的明星项目的诞生。

**Ronin**

概述：

Ronin 是一条因为 Axie Infinity 游戏爆红而产生的侧链，在 2021 年 3 月时主网上线。Axie Infinity 一开始部署在以太坊主网上，但因为以太坊高成本的交易手续费与时常拥堵的问题让 Axie Infinity 的进一步发展受到限制，因此 Axie Infinity 就开发出专门的侧链解决方案 Ronin。

Ronin 的主要特性为：快速与无缝交易，大幅度减少 Gas Fee，会把得到的 Gas Fee 用来作为锦标赛奖金，资产可以退回以太坊主网与钱包订制化的解决方案。在跨链桥被黑客攻击前，Ronin 有 $1.4billion 的锁仓量，同时内建的 NFT Marketplace 也紧追在 Looksrare 后面，可以说是承袭了 Axie Infinity 能量的一条侧链。目前上面的应用只有 Katana DEX 一个，作为 Ronin 上的代币交换平台。

Ronin 的验证机制是 PoA（Proof of Authority），有别于 PoS 可以容纳 128 个验证节点，PoA 至多只能包含 25 个节点，相较起来量体更小。节点大部分为战略性伙伴或是知名 VC：如 Binance，AnimocaBrands，SparqVenture，Ubisoft 等。有别于 PoS，PoA 是以自身名誉为担保进行的验证模块，更像是联盟链通过权威型机构来进行认证，因此验证速度与 Gas Fee 的 re-allocate 上可以有比较好的分配与调整。

时间线：

- 2021 年 3 月 Ronin 主网上线。
- 2022 年 3 月 Ronin 被黑客攻击，黑客通过控制 9 个节点当中的其中 5 个节点（为 Axie Infinity 母公司）来不断盗取资金，最终让 Ronin 陷入整条链资产被掏空的困境。
- 2022 年 4 月币安领投并注入资产让 Ronin 能够重启。
- 2022 年 8 月 Ronin 增加 3 个 PoA 节点以提高安全性。

生态发展：

目前仅有 Axie Infinity 相关生态系会需要使用，被黑客攻击前的 DEX 和 Bridge 基本都是为了 Axie Infinity 的游戏内需而部署。

**3.2.6 应用比较**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701173511-67ce9d94-04ef-48ec-b08a-cb59eefb3aa5.png)

### 3.3 Plasma

**3.3.1 概要**

Plasma

Plasma 本身指的是一个构建可扩展 Dapp 的框架，开发者可以使用其提供的工具进行开发。Plasma 是作为侧链的演化方案出现的，旨在将用户对侧链 Operator 的信任降至最低，即使 Operator 作恶，Plasma 也可以防止用户资金被盗。Plasma 的基本原则是，如果 Plasma 链上出现安全故障，所有用户的资产仍可以撤出 Plasma 链并退回到主网。

Plasma 链

Plasma 链，也被称为「子链」，是依赖于另一个区块链（称为「根链」/「主链」/「主网」）构建的独立运行的区块链，具有独立共识机制；每个「子链」具有一个部署在根链上可以自定义的智能合约；不同的子链在根链对应不同的合约，因此，我们可以将不同的子链用于不同的任务。在 POS 共识机制下，任何人在主网 Plasma 合约里质押代币可成为该 Plasma 链的 Operator；通常 Plasma 链处理交易的节点很少，往往是项目方自己运营 1 个节点（Operator），这会带来新的中心化问题。

Plasma 链上再部署合约，可构建子子链，这些不同的子链可形成一层一层树状的 Plasma 网络（如下图）；Plasma 利用 MapReduce 算法，可将大的计算任务拆分成小任务，再分配给各个子链计算，最后一层层汇总后向上提交结果，从而可以快速、低成本处理大量复杂的计算。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701173580-c3ec9fcf-f034-4980-8983-7eac3c548df3.png)

Plasma 合约

Plasma 合约是指在根链如以太坊上运行的智能合约，用于处理用户资金进出 Plasma 链，负责跟踪 Plasma 链的状态承诺（State Commitments），并通过提交欺诈证明惩罚作恶行为。

Plasma 合约内的数据结构包含：

1) 合约所有者（在初始化时设置）

2）Plasma 链区块列表：每个区块的 Merkle root 和 Merkle root 提交的时间

3）用户提交的退出 Plasma 链的交易请求列表：包含了提交者地址、UTXO 位置（Plasma 区块编号，txindex，outindex）

关系

Plasma 合约起着桥梁的作用，允许用户在以太坊主网和 Plasma 链之间移动资产。用户可以将资金从根链转移到子链，再由子链处理复杂的计算，从而节省 Gas 费用。在子链部署的 DApp 不必与根链直接交互，子链的状态更新只需提交块哈希 Merkle Root 给根链，这样根链只接收最小数量的数据，且只有在遇到争议时才需要计算，可大大减少根链的计算量。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701174278-1887f204-f99d-48cd-be3a-56baed92ffe3.png)

**3.3.2 时间线**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701174699-b641a651-fbf2-4c59-8d8e-8e49fcd70e1b.png)

- 2017/08，Plasma 首次在 Vitalik 和闪电网络作者之一 Joseph Poon 写的白皮书 Plasma: Scalable Autonomous Smart Contracts 中被提出。
- 2018/01，Vitalik 提出第一个正式的 Plasma 应用 Plasma MVP，采用 UTXO 模型和 Proof-of-Authority 共识机制。
- 2018/03，Vitalik 提出 Plasma Cash，旨在解决 Plasma MVP 中的大规模退出问题。为了使得用户证明自己拥有代币的所有权更加容易，所有代币都用 NFT 表示。
- 2018/06，Dan Robinson 提出 Plasma Debit，与 Plasma Cash 类似，不同点在于每个 Token 是用户和 Operator 之间的一个支付通道，通道可以像 Token 一样被转移，整个设计类似一个大的 Lightning hub。
- 2018/11，BANKEX Foundation 提出 Plasma Prime，希望利用 RSA accumulators 解决 Plasma Cash 中存在的大量历史证明的问题。但目前还没有正式全面的文档来解释 Plasma Prime，仍处于构思阶段。
- 2018 年底，ETH 的价格触底，在加密领域的乐观情绪消失的背景下，Plasma Cash 虽然比 Plasma MVP 有所改进，但仍并不是以太坊承诺的 Visa 级解决方案，其 MapReduce 算法构想的「区块链树」看起来也难以实现，因此大部分为 Plasma Cash 开发客户端的公司都停止了工作，目前开发进展都处于半成品状态，看起来 Plasma 已死。
- 2019 年起，以太坊社区开始探索一种新的二层扩容方案「Rollups」，具体内容我们在下文 Rollups 部分展开。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701174987-9ad75846-31dc-46a6-ad66-0fd38ba8fc8d.png)

**3.3.3 技术原理**

三个核心思想：

- 链外执行：Plasma 的假设是主网不需要验证所有交易，任何不需要从智能合约移入或移出资产的操作都可以在链外处理，所以 Plasma 应用的大部分工作都在主网之外处理。Plasma 链经常使用单个 Operator 来执行交易，无需等待其他节点的同意，这样可以降低成本并提高速度，在牺牲一部分去中心化的前提下提高可扩展性。
- 状态承诺：状态承诺是一种存储 Plasma 链状态压缩版本的加密方式。在 Plasma 中，状态承诺是指一个 Plasma 链区块内所有交易组成的默克尔树（Merkle Tree）的根哈希值（Merkle Root）。Merkle Root 能够快速地验证一笔交易是否包含在一个区块中（通过 Merkle Proof），因此 Operator 可以通过上传 Merkle Root 来承诺当前区块状态。虽然 Plasma 在链外执行交易，但是在主网上执行结算的，所以 Operator 需要定期在以太坊上发布 Plasma 区块的 Merkle Root 作为「状态承诺」，以确认链外计算的最终状态，实现链外执行链上清算。这种依赖于主网验证的机制确保了 Plasma 继承了主网的部分安全性。
- 退出机制：如果用户想从 Plasma 链撤出资金时，需要向主网的 Plasma 合约证明有可提取且数额正确的资金，用户可以提交 Merkle Proof 作为证明，Merkle Proof 可以由 Operator 提供，不过 Operator 有作恶风险。

使用流程如下图所示：

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701175145-ab078099-06c8-48fe-8605-8c48819f99c7.png)

**1.存款**：要使用 Plasma 链，用户首先需要在以太坊的 Plasma 合约中存入 ETH 或任何 ERC-20 代币。当用户存入资金时，将在 Plasma 链上创建一个区块，该区块仅包括一笔交易，同时负责监控 Plasma 合约的 Plasma Operator 会在 Plasma 链创建相同金额的资产发送到用户在 Plasma 链上的地址，用户在 Plasma 链上收到资金后可以在 Plasma 链上交易。

**2.交易**：用户在 Plasma 链上通过签署加密消息来确认每笔交易，然后该交易以及对应的签名会发送给 Plasma 链的 Operator 进行打包。

**3.Operator:** Operator 将接收的交易打包进 Plasma 链区块，一旦 Operator 收到足够多的交易来填充一个区块，这些交易将组成一个 Merkle 树，Operator 提交 Merkle 根作为对该区块的状态承诺到以太坊主网，因为只提交数据量小且数据大小恒定的 Merkle 根，可以大大减少提交到主网产生的 Gas 费用。此外，Operator 提交主链的 Plasma 链区块哈希值，如果被任一用户挑战成功，则 Plasma 链上的错误区块会被回滚，而错误区块的创建者会被惩罚。

**4.退出**

**4.1 发起提款请求：**

为了把资产从 Plasma 链提出，用户需要向主网的 Plasma 合约发起退出交易，并和 Merkle Proof 一起提交（Merkle Proof 可通过 Operator 获取），Plasma 合约会验证 Merkle Proof 的有效性，以确保金额正确且没有被双花。

用户同时还需要在提款请求中添加保证金，如果有挑战者证明该用户的退出请求无效，则笔保证金的一部分将被没收作为奖励给挑战者。

**4.2 挑战提款请求：**

虽然以太坊主网有 Plasma 链的状态信息，但它无法验证该信息是否正确。恶意用户可能提出恶意提款请求，例如用户在主网实际上没有 1000ETH，但声称在主网锁定了 1000ETH，并请求从 Plasma 提出 1000ETH，或者尝试提取他们已经花费的资产，并通过提供虚假证明来支撑这些虚假请求。

为了防止以上两种作恶行为，Plasma 引入了「挑战期」（通常为一周）。在此期间内，任何人都可以向主链提交欺诈证明挑战提款请求的有效性。例如，因为一笔历史交易已被签名，所以可证明作恶用户的该笔资金在过去已经被花费，已无效。如果挑战成功，则 Plasma 合约会拒绝作恶的提款请求，挑战者将获得奖励。

然而，如果挑战期内没有任何人提供欺诈证明，用户的提款请求将被视为有效，可以从以太坊的 Plasma 合约中提取资产，会造成 Plasma 链其他诚实用户的损失，这是 Plasma 在安全性上的一大缺陷。

**5.监控 Plasma Chain（缺点）**

用户为了确保 Plasma 链上的资金安全，需要不时地监控 Plasma 链，通过运行一个软件，定期自动同步下载 Plasma 链的数据，确保一切正确运行；数据同步频率取决于 Plasma 智能合约里设置的参数。

如果 Plasma 链上发生恶意行为，比如恶意 Operator 试图窃取资金，那么用户的钱包将自动开始从 Plasma 链中提取资金来保障用户的资金安全；由于用户无法保障全程在线，类似闪电网络的 watchower 委托人角色的设计就变得很有必要，但目前完整机制和激励模型暂未出现。

**3.3.4 优缺点**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701175445-2dffec5f-febf-4e33-bb83-f6f49267e01c.png)

出于上述缺点，很多应用最初使用 Plasma 方案进行扩展，但后来又放弃而转向 Rollups 方案。

**3.3.5 应用**

**Plasma Group → Optimism（Optimistic Rollup）**

2017 年，Plasma 被正式提出后，三个以太坊核心开发者和研究者成立了一个非营利研究小组 Plasma Group，致力于 Plasma 框架的研究。

2019 年 1 月，Plasma Group 发布了一份 Plasma Cash 的说明书，一个月后又发布了一种通用型 Plasma 架构尝试将 Plapps(plasma apps) 在通用型 Plasma 链上部署。但随着研究的深入，Plasma 的缺点变得越发明显，尽管技术团队做了很多尝试，通用型智能合约始终无法运行在 Plasma 上，使得 Plasma 的开发在 2019 年时陷入停滞。

2019 年 6 月，John Adler 提出了一种称为「最小可行的合并共识」的设计，该设计实现了在以太坊上完全可验证的链外共识系统，而无需零知识加密。之后，Plasma Group 发布了一个扩展版的合并共识设计，即现在被大家所熟知的：Optimistic Rollup。

2020 年 1 月，在 Paradigm 和 IDEO CoLab Ventures350 万美元的支持下，Plasma Group 从一个非盈利的研究组织转变为一家营利性初创公司，Optimism 正式诞生，这也意味着团队正式放弃研究 Plasma，转向专注于 Optimistic Rollup 的研究（具体内容见下文 Optimistic Rollup 部分）。

**OMG Network → Boba Network（Optimistic Rollup）**

OMG Network 是最早提出「链下扩容」概念的以太坊扩容项目之一，也一度是该领域的龙头项目。2013 年，泰国金融支付企业 SYNQA 旗下的子公司 Omise 成立，主要业务是 APP 端在线支付。2017 年，Omise 成立了区块链部门 OmiseGO，同年发行 $2500 万的 $OMG 代币，发行总量 1.4 亿枚。

2020 年 6 月，OmiseGO 更名为 OMG Network 后主网上线，使用 More Viable Plasma 技术来扩充以太坊网络的容量；More Viable Plasma 设计，是 Minimal Viable Plasma 的扩展，针对用户和交易所之间的支付结算和价值交换进行了优化。随后，Bitfinex 宣布支持 OMG 网络进行 USDT 存款和取款。

2021 年 6 月，Plasma 路线式微后，OMG Network 宣布更名为 OMG Foundation，与 Enya 公司合作一起推出 Boba Network，并发布新代币 $BOBA。Boba 是基于 Optimistic Rollup 的以太坊 L2 解决方案，从此 OMG 网络不复存在，BobaNetwork 继承了 OMG 网络的社区。（Boba Network 的具体内容见下文 Optimistic Rollup 部分）

**Polygon (previously Matic Network) → 全栈 L2 解决方案**

2017 年，Matic Network 成立。2020 年 6 月主网同时发布以太坊侧链 Matic PoS Chain 和以太坊 Plasma 方案 Matic Plasma Chain，后者采用 Plasma 的链下扩容方案，并在 Plasma 的基础上做了一系列的改进。该扩容方案与以太坊主网通过 Plasma 桥进行跨链交互，允许用户将资产从主链转移到 Plasma 链，从而实现快速和低成本的交易。Plasma 方案虽然比 Matic PoS 侧链更安全，但缺点是用户从 Plasma 网络中提取资金需要更长的等待时间（7 天），而 Matic PoS 侧链仅需要约 3 小时；此外，Plasma 链也不能运行通用的智能合约。

虽然 Matic 方案改进了 Plasma More VP，但是仍然无法解决 Plasma 最根本的问题，包括无法确保链下数据可用性、大规模退出问题和用户需要经历挑战期等，并且原 Plasma 研究团队也都逐步转向开发 Rollup，这使 Plasma 方案的突破难上加难。

2021 年 2 月，Matic 品牌升级为 Polygon，向以太坊链下扩容方案的聚合器转变。同年 5 月，发布核心组件 Polygon SDK，一个用 Golang 语言编写的模块化和可拓展的框架，能够与以太坊实现完全的兼容，开发者可以使用 Solidity、Vyper 等语言以及以太坊工具和库等直接进行开发。这是一个模块化、灵活的框架，支持开发者自定义构建自己的链下扩容方案如 Plasma、Optimistic Rollups、zkRollups、Validium 以及侧链如 Polygon PoS 链，并且让它们轻松跨链互通并可以直接共享以太坊的安全性和网络效应。当前 Polygon Plasma 的扩容方案已逐渐被社区抛弃，Polygon 将重心移至 Rollup 技术的开发。2021 年 Polygon 通过收购 Hermez 和 Mir Protocol 一步到位集成 ZK Rollups，朝着「全栈」链下扩容解决方案又近一步。（具体内容见下文 ZK Rollups 部分 )

目前 Polygon 已逐步搭建起从 DeFi、Gamefi 到 NFT 等细分领域的多样化生态体系，拥有 37k+ 的 Dapp，1.8B 的总交易数和 135M+ 的用户。

总结：

Plasma 是一种技术上的过度方案：受制于 Plasma 技术本身存在的问题，Plasma Group 没有等到上线基于 Plasma 的项目就转入了 Optimistic Rollup 的研究；OMG Network 和 Polygon 都在主网上线 Plasma 方案后的一年内，也分别快速转入了基于 Optimistic Rollups 和 ZK Rollups 方案的开发；综上，基于 Plasma 的应用乏善可陈。

### 3.4 Rollups

**3.4.1 概要**

早在 2014 年，Vitalik 就提出了「将交易数据和状态放在链上，而计算放在链下」的 shadow chain 的概念。这是 Rollups 的雏形，但在当时似乎没有受到重视。由于 Plasma 受限的智能合约执行能力和大规模退出（mass exit）问题，以太坊研究者们开始寻找一种新的扩容解决方案 – Rollups。

2018 年 9 月，V 神提出用零知识证明来解决以太坊扩容问题。2019 年 6 月，Consensys 研究员兼 Celestia 联合创始人 John Adler 在 Ethereum Research 上发文「Minimal Viable Merged Consensus」，提出了带终止时间的欺诈证明的 Optimistic Rollups 扩容方案。随着 2019 年 12 月以太坊 Istanbul 硬分叉，calldata 存储成本下降 4 倍，Rollups 吞吐量大大提升，Rollups 上生态和各种应用迅速发展了起来，而 Rollups 也成为了目前主流的二层网络（Layer2）扩容解决方案之一。

**3.4.2 技术原理**

Rollups 的核心思想是将计算过程和状态存储放在链下，而在打包上链的是状态承诺和被压缩的交易数据。

Layer1 上会有一份智能合约，负责更新 Rollup 交易的状态根（状态承诺）和记录压缩后的交易内容。任何人都可以收集在二层网络上的交易，聚合压缩形成交易批次（batch）后，以 calldata 的形式发送给主链的合约。这个 batch 包括了压缩后的交易集，前一个区块状态的默克尔根（Merkle root）和新状态根（处理交易之后的状态根）。主链合约收到 batch 后，会检查前状态根和合约上的状态根是否匹配，如果匹配，就能证明 Rollup 状态是前后连接的，合约就会更新自己的状态根。

由于交易数据是压缩后存储在主网的智能合约的 calldata 里的，任何人都可以从合约里拿到交易数据，从而在链下重建二层网络的状态。用户能随时提供 Merkle proof 从而取走二层网络的资产。因此，Rollups 的安全性仍然是由一层的安全性保证的。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701175999-1c460420-7b50-4e90-a7de-ca8070584a97.png)

_Source: https://vitalik.ca/general/2021/01/05/rollup.html_

但 Rollups 是怎么保证上传的交易批次（batch）的正确性呢？换句话说，如何得知交易批次里的后状态根 (post-state root) 是正确的呢？如果某人能够提交一个具备任意后状态根的 batch，而无需承担任何后果，他们完全可以将 Rollups 中的所有代币都转移给自己。而这个问题，带来了两种解决方案以及其对应的两种类型的 Rollups：

1. 欺诈证明（fraud proofs）→ Optimistic Rollups
2. 有效证明（validity proofs）→ ZK Rollups

**链下虚拟机**

Rollups 的计算和状态存储是在链下的虚拟机上完成的。这个虚拟机完成交易的计算和状态的改变，同时也是 Layer2 应用的执行环境。

以太坊 Layer2 存在的主要目的是扩容 Layer1，因此，Layer2 需要尽可能地去提供和 Layer1 相似的执行环境。而这个相似程度就是由 Layer2 的虚拟机来决定的，也叫做 EVM 兼容性。EVM 兼容意味着创建一个类似 EVM 的代码执行环境，使以太坊开发者可以很容易地将智能合约迁移到 EVM 兼容的链上，而不必重写代码。

实现 EVM 兼容，最简单的方案就是 fork GETH，比如 BNB 链。但对于 Rollups 来说，他们还需要兼容证明的验证（欺诈证明和有效证明）。Optimistic Rollups 能做到比较好的 EVM 兼容性，比如 Arbitrum 的 Nitro 和 Optimism 的 OVM。而对于 ZK Rollups 的协议来说，有效证明（零知识证明）很难做到 EVM 兼容，因为我们需要把智能合约的逻辑转变成电路逻辑，而电路逻辑本身非常复杂且需要零知识证明相关知识。因此，目前所有生产级的 ZK Rollups 协议都是特定于应用的，如 Loopring，ImmutableX，dYdX，zkSync1.0，zkSwap。

**谁能打包区块？**

理论上来说，任何人都可以打包区块并上传给主链的合约，但为防止作恶，这个人需要在合约里质押一笔钱。如果很多人同步打包交易，而只有一个区块生成，这样会消耗额外的计算和区块资源。因此，为了提高交易速度，目前大部分 Rollups 项目都是用中心化的排序器（Centralized Sequencer）进行打包交易的；中心化排序器是最有效率的，但会出现单点故障问题。

此外，我们可以进行排序器拍卖，POS 验证节点随机抽人或者通过 DPoS 投票的方式决定打包区块的人。排序器拍卖能捕获 MEV 价值，但不能解决单点故障的问题。POS 和 DPoS 都需要锁定资金，这会降低资金使用效率。

**交易压缩**

压缩技巧是 Rollups 实现可扩展性的关键之一。压缩使得链上存储的数据量减少，从而降低成本。

一笔简单的 ETH 转账交易在以太坊需要~110 字节，而在 Rollups 中只需要~12 字节。其中一部分原因来自于编码，还有一部分原因来自于巧妙的压缩技巧。比如，我们可以在主链合约上存储一个地址和索引的映射表，而 20 字节的地址就可以用 3~4 个字节的索引来替代了。此外，BLS 集合算法可以将多个签名压缩成一个签名，从而减少签名大小（在 ZK Rollups 里，零知识证明替代了签名）。

下面这个图片显示了以太坊上一笔简单交易的具体压缩情况：

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701176228-957815c9-e568-4cf4-bc1d-a93c48c9c772.png)

_https://vitalik.ca/general/2021/01/05/rollup.html_

**交易成本**

我们知道了通过交易压缩可以减少 Rollup 交易在链上的存储成本，那 Rollup 交易成本到底由什么组成呢？

Rollups 交易成本 = L1 数据存储成本 + L2 计算处理成本

其中，L1 存储成本远远大于 L2 计算的成本，所以要节约成本，我们需要找到 L1 上性价比最高的存储空间。以太坊上有三种数据存储位置：memory，storage 和 calldata。calldata 是一个不可修改的、非持久性的区域。calldata 可以被用来保存函数的输入数据。它不会改变以太坊网络本身的状态，因此 calldata 的存储成本是最便宜的。为了减少成本，Rollups 把交易数据存在 L1 合约的 calldata 里。

Rollups 要解决的核心问题就是如何在不降低安全性和去中心化下，尽可能地增大以太坊的吞吐量，从而减少用户交易成本。从 EIP 的提案中，我们也可以看到以太坊在减少 Rollups 链上存储成本上做出的努力：

1. EIP2028：calldata gas 成本从 68gas 单位 /byte 减少到 16gas 单位 /byte
2. EIP4488：calldata gas 成本从 16gas 单位 /byte 减少到 3gas 单位 /byte
3. EIP4844：data blobs：这是一个用户定义的数据片断，其承诺可以被 EVM 访问。blobs 由所有信标节点下载，并在一个相对较短（一个月）的延迟后删除。Rollups 的交易数据会被放在 data blobs 上，这将极大程度上减少 L1 存储成本。

**交易吞吐量**

以太坊是有区块大小限制的。每个区块的目标大小为 1,500 万单位的 gas，如果网络需求增大，区块限制可以阶梯性上升至 3,000 万单位 gas（2 倍目标区块大小）。这里我们用常规的 1,500 万区块限制。目前以太坊的平均出块时间是 12~15 秒，简单的转账交易需要花费 21,000 单位 gas，在接下来的计算中，我们假设以太坊出块时间是 15 秒。

对以太坊主网而言，受限于区块空间，理论 TPS（每秒交易量）可以达到 15,000,000（Gas Limit）/21,000/15=47.6。

对于 Optimistic Rollups 而言，我们需要把压缩后的交易数据上传到主网合约。前面提到，目前一笔 Rollup 转账交易大概是 12 个字节。目前的 calldata gas 成本是 16 单位 / 字节。那么一个区块就可以有 15,0000,000/12/16=78,125 笔交易。延续上文假设，以太坊出块时间是 15 秒，那么 Optimistic Rollups 每秒能处理 78,125/15=5,208 笔转账交易。

对于 ZK Rollups 而言，我们还需要考虑零知识证明在链上的验证成本，大概是 500,000 gas 单位。同样的逻辑，ZK Rollups 每秒能处理 (15,000,000-500,000)/12/16/15=5,034 笔转账交易。

以上是一个相当乐观的估计（理论吞吐量），因为 Rollups 不可能占用以太坊的整个区块，且不可能所有交易都是转账交易。**但在同样尺度下，我们可以**看到，Rollups 对交易速度的提升为 100 多倍。

目前而言，Rollups 能实现的 TPS 极限是 2,000 笔交易左右。Rollups 的实际吞吐量取决于一批交易能被压缩成较小摘要的幅度。由于 ZK Rollups 不需要像 Optimistic Rollups 一样上传所有的交易内容，ZK Rollups 的 TPS 往往高于 Optimistic Rollups。

**3.4.3 优缺点**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701176379-6067b6eb-50c8-44f9-a28e-24ca5bd39361.png)

**3.4.5 Optimistic Rollups**

**3.4.5.1 概要**

Optimistic Rollups（OPRUs）是 Rollups 的一种，依靠欺诈证明（Fraud proofs）来保证链下执行交易的正确性。正如它的名字，Optimistic Rollups 上打包的交易被乐观地假设为正确的，因此不用做额外功；只有发生争议时，主链才会执行 Rollups 区块上的每笔交易，确认是否发生了欺诈。

**3.4.5.2 时间线**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701176774-93c11ec3-599c-4d7e-a2f5-d96117b2cffd.png)

- 2018 年 8 月，Offchain Labs（Arbitrum）在 Usenix 安全会议上发表论文，提出将交易由放在链下的 AVM（Arbitrum Virtual Machines）来执行，而链上只保留虚拟机状态的加密哈希值。这个方案的交易数据是在链下的，因此不算完全的 Optimistic Rollup。
- 2019 年 6 月，Celestia 联合创始人 John Adler 在 Ethereum Research 上发布了「最小可行的合并共识」的提议，揭开了 Optimistic Rollup 的序幕。不同于 14 年 Vitalik 提出的 Shadow Chain（L2 状态放在链上），这个方案中 L2 状态是完全链下的。
- 2020 年 12 月，Fuel Network 主网上线，成为第一个上线的 Optimistic Rollup，被用于支付应用。
- 2021 年 1 月，Optimisim alpha 主网软启动，采用了逐步开放主网的方式。同时，合成资产协议 Synthetic 宣布在 Optimism 上线。
- 2021 年 8 月，Arbitrum One 主网发布。这是一个完全的 Optimistic Rollup 解决方案，即交易数据会被放在链上的合约里，允许任何人发起挑战。
- 2021 年 9 月，Boba 主网发布，计划支持混合计算，使 Solidity 智能合约能够与任何外部 API 互动。
- 2021 年 11 月，Metis Andromeda 主网上线，提供一个 EVM 等效的 Optimistic Rollup，一个无代码的中间层 Polis 以及去中心化自治公司（Decentralized Autonomous Companies，DAC）。
- 2021 年 12 月，Optimism 开放主网，允许任何人部署 L2 合约。
- 2022 年 8 月，Arbitrum Nitro 主网上线，带来更低的手续费以及更好的 EVM 兼容性。

**3.4.5.3 技术原理**

Optimistic Rollups（OPRUs）采用欺诈证明，乐观地默认所有交易的计算是正确的，除非有人提出争议。在 Aggregator 上传交易批次后，Optimistic Rollups 会有一个 7 天左右的争议窗口期。在此期间，任何人都可以对状态转换提出异议。只要其中有一人诚实，对错误的状态变化发起挑战，Optimistic Rollups 协议的安全性就能得到保证。

Optimistic Rollups 主要有以下两个技术角色：

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701177020-a590984d-2be9-4a51-8189-beb62362811c.png)

**用户流程**

![](https://cdn.nlark.com/yuque/0/2022/jpeg/1034768/1669701177117-b4b4faa5-f449-4994-afaa-9d873290a453.jpeg)

1. 用户通过在主网合约上锁定资产的方式，将钱存入二层网络。
2. 用户向 Aggregator 发送 L2 交易。
3. Aggregator 收集并排序交易（先进先出），执行交易，更新内部状态，并将交易打包成 batch，压缩后提交给 L1 的合约。

- Batch 内容：压缩的交易数据，前状态根，后状态根

1. L1 合约检查 batch 中的前一个状态根是否与其当前的状态根相匹配（确保 L2 状态的连续性）；如果匹配，则将状态根切换到新的状态根。
2. Validator 可以从 L1 合约上下载交易数据，并在本地重建 L2 状态并计算新的状态根。
3. 如果 Validator 发现本地的状态根和 Aggregator 上传的不一致，Validator 可以发起挑战。此时，Validator 需要质押一笔钱，并且向主网 Rollups 合约提供有效的 Merkle Proof。
4. 如果主网 Rollup 合约验证确实存在错误，主网合约就会对错误 batch 及其之后的 batches 进行回滚。作恶的 Aggregator 会受到惩罚，其押金将会被没收，一部分押金会奖励给挑战者，一部分押金销毁掉。反之，如果 Aggregator 是正确的，Validator 挑战失败，质押的钱将会被销毁。
5. 如果一段时间（挑战期）内没有挑战，之前打包好的 batch 将会在 L1 上被确认。

**欺诈证明**

验证者从 L1 合约下载交易数据后，可以在本地重建（L2 状态的）merkle tree。验证者可以通过比较本地和合约的 merkle root（状态根）确认是否存在作假行为。如果发现作假，验证者需要向 L1 合约提供 merkle proof，也就是图中的绿色部分，从而发起挑战。

- 如果有多个不对的 batch，最好找最早的 batch 发起挑战。因为，最早交易批次的错误会导致后续不正确的批次全部回滚，从而使后续区块的挑战失效。
- 如果一个 batch 的构建是正确的，那么就永远不可能创建一个显示该 batch 无效的欺诈证明。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701178825-8ee1dccf-3ded-46c5-bf7b-7e4b545f0e20.png)

Source: https://vitalik.ca/general/2021/01/05/rollup.html

**争端解决（Dispute Resolution）**

目前处理纠纷的方法是重新执行交易（re-executing transactions）和互动证明（interactive proving）。

重新执行交易依赖于 L1 来执行整个 L2 区块的交易，实现即时验证。因为需要执行一个 L2 区块内所有交易，这种方式成本高。此外，重新执行交易需要单一区块能容下整个 L2 的交易，这导致了 L2 的交易存在上限。采用此方式的有 Optimism，Metis 等。

互动证明通过不断拆分存在争议，来回移动争议点以缩小争议点来解决争端。具体来说，Aggregator 首先把争议一分为二，Challenger（发起挑战的 Validator）选择其中一个有争议的。然后 Aggregator 再把这个争议一分为二，直到找到最后的争议点，后由链上的合约判断胜负。由于拆分争端这个过程是在链下进行的，L1 只需要执行争议点交易，而不是在链上重新处理全部交易，此方式通常手续费更低。但是，由于需要互动，此方式生成证明的时间更长，Challenger 和 Aggregator 需要同时在线去完成多轮的争议拆分。Arbitrum 和 Optimism Cannon（未上线）采用的都是互动证明。

值得注意的是，和重新执行交易相比，互动证明在 L1 上执行的数据更少，因此会有更高的吞吐量上限。

**为什么验证者的挑战期是 7 天**

理论上来说，挑战期越长，就更有可能检查到错误并发起挑战，因此系统也就越安全。

假设一个挑战期是 C 个区块长度，Rollup 链上的价值（攻击者在 L2 上能得到的最大值）是 V。通常情况下，区块越多（更多时间受到挑战），攻击者能够获得的利润也就越小。因此，我们可以假设攻击者利润随着区块数量（C）的增加而指数下降，即攻击者利润 = V exp(-AC)，其中 A 是一个常数，A 值越大，区块长度的增加带来的利润降低效果越明显。

攻击者往往是 Aggregator，因为只有他们能发布错误的状态根，因此 Optimistic Rollups 需要 Aggregator 质押一笔钱才能打包交易。为了减少从经济层面发起攻击的可能性，这笔钱需要远远大于攻击者能获得的收益，使得攻击者的损失远远大于收益。假设 Aggregator 质押金额是攻击者价值的 10 倍（足够大），那么 Aggregator 的质押金额 = 10V exp(-AC) ，远远大于攻击获利。

但对于诚实的 Aggregator 而言，这带来了质押的时间成本。我们把资本利率记作 I，那么 Aggregator 的时间成本 = 10V exp(-AC) I。挑战时间越长（C 值越大），Aggregator 的时间成本就会越高，使得 Aggregetor 的运营成本上升。

对于退出用户而言，过长的挑战期会导致用户提款周期变长，从而带来不好的用户体验。假设每个区块的平均取款比率为 W，那么每个区块的提款金额是 VM，每个时间点处于提款锁定状态的资金为 CWV，利息 CWVI。挑战时间越长（C 值越大），用户取款的时间成本也就越高。

因此，最优的挑战期应该是 Aggregator 质押的时间（运营）成本和取款用户的时间成本总和（10V exp(-AC)I + CWVI）的最小值。求最小值就等于对 C 求导=0，得到 C’=ln(10A/W)/A，其中 C’是最优挑战期。

**计算**

1. 假设 1：一个区块时间后攻击者能获得高达 99.99% 的最大利润，A=-ln( 攻击者利润 /V)/C，那么 A = -ln(0.9999) = 0.0001。
2. 假设 2：每天有 1% 的取款，每 15 秒一个 block，一天有 4*60*24=**5,760 个**区块，那么 w = 0.01/5760 ≈ 0.000002。也就是说每个区块的平均取款比率 为 0.000002。
3. 计算结果：C’ = ln(10*0.0001/0.000002) / 0.0001 = 62146 个区块 = 10.79 天。

由此可以得出，最佳的挑战时间是 10.79 天左右，和大多数协议的 7 天挑战时间差不多。核心思路就是聚合者（Aggregator）质押和取款用户时间成本总和的最小值。

_思路来源：https://medium.com/offchainlabs/optimizing-challenge-periods-in-rollup-b61378c87277_

**3.4.5.4 优缺点**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701178849-f42bfa9b-4f0d-4b1f-aa69-6424cab346ca.png)

**3.4.5.6 应用**

**Arbitrum**

概述：

Arbitrum 是 Offchain Labs 开发的 L2 可扩展性解决方案：采用多轮交互式挑战协议的 Optimistic Rollup。目前 Arbitrum 在以太坊主网上有两条链：Arbitrum One（Optimistic Rollup）以及 Arbitrum Nova（AnyTrust）。

时间线：

- 2018 年 8 月，Arbitrum 在 Usenix 安全会议上发表论文，提出将交易放在链下的 AVM（Arbitrum Virtual Machines）来执行，而链上只保留虚拟机的状态的加密哈希值。一个固定数量的验证者群体将会被选择来运行 AVM。只要有一个诚实的验证者，对不正确的链上状态发起挑战（互动证明），AVM 就能正常运行。
- 2021 年 8 月发布 Arbitrum One 主网。这是一个完全的 Optimistic Rollup 解决方案，即交易数据将会被放在链上的合约里，允许任何人发起挑战。
- 2021 年 9 月，Arbitrum Sequencer 下线，持续了 45 分钟。原因是 Sequencer 一次性收到太多交易而产生的 BUG。虽然排序器中断了，但是网络未中断，用户还是可以绕开排序器直接向 L1 合约发送交易。
- 2021 年 10 月，提出 Arbitrum Nitro，即 Arbitrum One 的升级版本。Nitro 会把 AVM 改成 WASM（Web Assembly），同时把自制的 EVM 仿真器（emulator）换成了 Geth，提高了 EVM 兼容性和处理速度。此外，他们用 Go 重写了 ArbOS，提供改进的 batch 处理和压缩系统，从而减少交易成本。
- 2022 年 3 月，提出 Any Trust Chain，将交易数据放在链下，由 DAC 委员会保管。只有一定数量的委员会成员签名或者交易数据在链上，主网合约才存 batch 哈希值。Any Trust 链主要应用在游戏赛道，可提供更低的手续费和更快的交易速度。
- 2022 年 8 月，基于 Anytrust 技术的 Arbitrum Nova 主网上线。
- 2022 年 8 月 31 日，Arbitrum Nitro 主网上线，带来更低的手续费以及更好的 EVM 兼容性。

技术特点：

1. 采用多轮交互式挑战协议，可减少 L1 链上解决争议的成本。
2. EVM 等效：基于 Geth 构建的虚拟机，可以执行任何以太坊字节码，Gas 费用的计算也是等效的。
3. Rollup 设计：验证者需要对新的状态质押，并提出区块。这是一个额外的确认。更具体的说，验证者需要去 sequencerInbox 合约中下载交易数据，在本地的虚拟机（WAVM）上执行交易，更新本地 L2 状态，并通过对新的状态质押，提出新的区块，然后等待 7 天的挑战期，最终确认区块。

生态发展：

截止 2022 年 11 月，Arbitrum 占 Layer2 的市场份额 52% 左右，TVL$2.3B，位居第一。目前生态内 TVL 排行前三的项目是 GMX，Stargate 和 Uniswap V3。其中比较有特色的项目有：

1. GMX 是一个去中心化的现货和永续合约交易所，通过发行指数基金的方式，使得基金持有者成为杠杆交易者的对手方。目前部署在 Arbitrum 与 Avalanche 网络。
2. Dopex 是一个去中心化期权平台，通过期权池为交易方提供流动性。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701178897-26642ef5-f0ef-479b-821d-7f33c5e90342.png)

_Source: https://news.cryptorank.io/arbitrum-ecosystem-overview/_

**Optimism**

概述：

Optimism，是 OP Labs（前身 Plasma Group） 开发的 Optimistic Rollup 项目，目前的主流 Optimistic Rollups 应用之一。

时间线：

- 2019 年 10 月，Plasma Group 和 Uniswap 联合发布 Unipig.exchange 测试版，一个基于 Optimistic Rollup 的 DEX。
- 2020 年 1 月，在 Paradigm 和 IDEO CoLab Ventures350 万美元的支持下，Plasma Group 从一个非盈利的研究组织转变为一家营利性初创公司，Optimism 正式诞生，意味着正式放弃研究 Plasma，转向专注于研究 Optimistic Rollup。
- 2021 年 1 月，Optimism alpha 主网软启动，采用了逐步开发主网的方式。同时，合成资产协议 Synthetic 宣布在 Optimism 上线。
- 2021 年 10 月， Optimism 发布 EVM 等效主网。
- 2021 年 12 月， Optimism 开放主网，允许任何人部署 L2 合约。
- 2022 年 3 月， Optimism 提出一个新版的欺诈证明 Cannon。这和 Abitrum 实现的方式十分类似，是一个多轮交互式的欺诈证明，解决单轮证明需要 L1 合约验证所有交易带来的成本高的问题。
- 2022 年 5 月，Optimism 提出 Bedrock，一个更便宜更快更先进的 Optimistic Rollup 架构。Bedrock 会将共识和执行客户端分离，使 Optimism 能够无缝整合成本最小化的 EIP-4844。
- 2022 年 6 月， Optimism 代币 OP 发行。Optimism 将治理权分给了 Token house 和 Citizens’ house 两个群体。Token house 持有代币，能够对作为治理基金一部分的项目奖励的分配、协议升级等进行投票。Citizens’ house 用不可转让的 NFT 代表公民身份，负责可追溯性的公共产品资金的分配。

技术特点：

1. Optimism 采用了重新执行交易的方式处理争端，后面会用多轮交互证明（Optimism Cannon）。
2. EVM 等效：为了更好的 EVM 兼容性，Optimism 首先 fork 了 geth，将区块生成和执行分开并定义了自己的 L2 区块生成函数；其次，Optimism 用一个具有更简单指令集的 VM 把 EVM 包装起来，并通过运行这个 VM 生成欺诈证明。

生态发展：

截止 2022 年 11 月，Optimism 占 Layer2 的市场份额 29% 左右，TVL$1.26B，位居第二。目前生态内 TVL 排行前三的项目是 AAVE，Synthetix 和 Velodrome。其中比较有特色的项目有：

1. Synthetix 是一个合成资产协议。通过去中心化预言机跟踪资产价格，Synthetix 可以在链上创造合成资产（数字货币和外汇）。
2. Perpetual Protocol 是一种 DEX 衍生品协议，它开创了 vAMM 架构，不需要订单薄，也能提供杠杆交易。目前，Perpetual Protocol 占据 Optimism 60% 以上的日交易量。
3. Lyra 是一种期权协议，旨在通过 Optimism 提供的快速交易确认时间和低 gas 费用来改善期权交易的体验。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701178985-8a11955a-70ec-45ce-8095-030cb1be539e.png)

_Source:https://twitter.com/Coin98Analytics/status/1569640055165325314/photo/1_

**Metis**

概述：

Metis 是由 Elena Sinelnikova、Kevin Liu 和 Yuan Su 于 2018 年共同创办的以太坊扩容解决方案。Metis 开始于对 Optimism 的硬分叉，将 Optimistic Rollup 和 DAO 基础设施结合起来，旨在为 WEB3 公司提供一个成本低、去中心化、可扩展性强的基础设施，以满足去中心化商业运营对隐私和存储等方面的需求。

时间线：

- 2018 年，Elena Sinelnikova、Kevin Liu 和 Yuan Su 创办 Metis。
- 2021 年 4 月，Metis Alpha 测试网发布，带来第一个测试产品 Prologue，以展示其 Rollup 设计的高速度和低成本。
- 2021 年 11 月，Metis Andromeda 主网上线，提供一个 EVM 等效的 Optimistic Rollup，一个无代码的中间层 Polis 以及去中心化自治公司（Decentralized Autonomous Companies，DAC）。

技术特点：

1. DAC，一个新的 DAO 结构，涵盖许多开源工具（企业软件， 薪资管理工具、信息传递平台，IPFS 去中心化存储等），作为基本单元支持去中心化应用、社区和业务的运营和管理。
2. 改进的 Rollup 设计：多虚拟机 +Ranger+ 排序器池。多虚拟机并行可以支持不同 DAC 同时运行。Ranger 是一个新引入的验证者角色。代币激励使 Rangers 快速验证新的区块交易，从而缩减欺诈证明周期。排序器池（Sequencer Pool）是为了引进社区参与者加入区块打包的过程，从而使协议更加去中心化。目前 Ranger 和 Sequencer Pool 还未上线。
3. Polis 中间层：提供智能合约模板，方便 WEB2 开发者使用。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701179142-9095b98f-3261-4437-a1b9-32aeef6f2cb8.png)

_source: https://drive.google.com/file/d/1LS7CmKFt-FkfVXxSNu06hNgoZXxMzTC-/view_

生态发展：

截止 2022 年 11 月，Metis 占 Layer2 的市场份额 2.6%，TVL$90M，位居第五。目前生态内 TVL 排行前三的项目是 Hummus Exchange，Hermes Protocol 和 NetSwap。其中比较有特色的项目有：

- Hummus Exchange 是一个单边自动做市商，为 Metis 提供稳定币交易。
- Netswap 是部署在 Metis 上的首个原生去中心化交易所（DEX）。

**Boba Network**

概述：

Boba Network（前 OMG Network）是一个专注于计算的 L2 项目。Boba Network 由 Enya 团队创建。Boba Network 开始于 Optimism 的分叉，其核心在于混合计算提供的 Web3 和 Web2 的互操作性。

时间线：

- 2021 年 5 月，Boba Network 发布了公共测试网。
- 2021 年 9 月，Boba Network 主网发布，为以太坊提供一个 Optimistic Rollup 解决方案。
- 2022 年 3 月，Boba Network 上线混合计算（Turing Hybrid Compute），使 Solidity 智能合约能够与任何外部 API 互动。

技术特点：

1. 自建的 L1<->L2 流动池，方便用户快速退出和进入 Boba Network。
2. 混合计算：允许 Solidity 智能合约能够与任何外部 API 互动。例如，获取 Twitter 关注信息，调用链外的机器学习模型，或使用在链下运行的高级数据分析，再将计算结果返回给智能合约。Turing 本身只是一个管道，而不是预言机。也就是说，Turing 不保证计算结果的真实性，但是 Turing 将会把输入和服务器回复记录在主网上，其他人就可以通过下载这些数据，去验证这些数据的真实性了。

生态发展：

截止 2022 年 11 月，Boba Network 占 Layer2 的市场份额 0.5%，TVL$20M，位居第十，从 21 年 11 月的高点 $600M 下滑了 96%。目前生态内 TVL 排行前三的项目是 OolongSwap，Synapase 和 Connext。OolongSwap 是 Boba Network 上首个原生 AMM 去中心化交易所。Synapase 和 Connext 都是跨链转账协议。

**3.4.5.7 应用比较**

在 Rollups 的设计上面，基于 Optimistic Rollups 的协议们大同小异。核心逻辑就是计算和状态存储放在链下，交易数据和状态根放在链上，并通过欺诈证明确保状态根的正确性。目前主流的 Optimistic Rollups 协议都是中心化的 Sequencer 在运行整个网络，且均计划在未来将这一角色去中心化。除了 Arbitrum（白名单验证者）外，上面提及的其他应用，欺诈证明的功能均在开发中。也就是说，目前中心化的 Sequencer 是可以发布错误的状态根，而无人能够提供欺诈证明，从而导致资金被盗。

在 EVM 兼容和等效的开发工作中，可以看到 Optimism、Arbitrum 和 Metis 采用的方式趋同，都通过 fork GETH 致力于降低 L1 和 L2 的执行环境差异，避免因此带来的风险，并且致力于使得 Layer1 的应用迁移到 Layer2 的体验更加顺滑。

Optimistic Rollups 应用的核心区别点在于针对不同场景进行的差异化定位。Arbitrum 和 Optimism 团队技术积累深厚，开发的是以太坊通用场景的扩容方案。Metis 和 Boba Network 均始于 Optimism 分叉，但对不同场景进行了对应的适配和调整。Metis 为去中心化自主公司（DAC）做了一系列的工具，方便了公司的链上运营。Boba Network 通过 API 提供 web2 和 web3 的互操作性，更适用于计算场景。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701179953-ba2fca01-d6f0-463d-8b38-8e7111b2a772.png)

**3.4.6 ZK Rollups**

**3.4.6.1 零知识证明**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701180385-a78201ea-082a-4253-9cf5-ee0d6722507f.png)

零知识证明是一种让验证者相信某些声明为真，但不透露任何其他信息的方法。

零知识证明通常由两个角色：证明者和验证者。证明者计算并生成证明，却不泄露任何知识；验证者在不知道知识的情况下，验证证明。

零知识证明的概念诞生于 1985 年 MIT 学者 Goldwasser、Micali 和 Rackoff 合作发表的论文 The Knowledge Complexity of Interactive Proof Systems（即 GMR85）。在这篇论文里，零知识证明被定义为只证明问题的正确性而不传达任何额外信息的证明，而交互性的证明方式可以减少为证明一个定理而必须交流的知识量。

交互式的零知识证明要求验证者和证明者进行多轮交互而验证证明的正确性。如何使验证者能够独立完成验证成了关键。1988 年，Manuel Blum、Paul Feldman 和 Silvio Micali 提出了第一个非交互式零知识证明。他们提出，如果证明者和验证者有一个共享的随机字符串，证明者可以不需要和验证者交互，仍能说服验证者他们对知识的了解。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701180685-558e0dda-5f45-4dae-bab4-5ddf6fd87040.png)

_Source: https://www.notboring.co/p/zero-knowledge_

此后的一段时间，零知识证明在学术界得到了进一步的研究，但在实际实施或使用方面却很少。最早的实际用例之一就是 2000 年出现的用零知识证明来登录网站而不向服务器泄露密码信息的方案。

2011 年，Groth 提出了 SNARK（Succinct Non-Interactive Arguments of Knowledge），把零知识证明带入了实用领域（数字货币）。

2013 年，Pinocchio（PGHR13）算法被提出，极大地减少了证明和验证时间。第一个运用零知识证明的加密货币是 14 年推出的 Zcash（最初叫 Zerocash 或 Zerocoin），而 Zcash 最初使用的就是 PGHR13 算法。

2016 年，Groth16 被提出，该算法拥有常数级证明大小和常数级验证时间，比 PGHR13 算法更快，是目前最为广泛使用的算法。

2017 年，Bulletproofs（BBBPWM17）被提出；该算法不需要可信设置，和 Groth16 相比，Bulletproofs 证明大小更大和验证时间更长，因此更适用于简单关系；Monero 就是使用的 Bulletproofs。

2018 年，ZK-STARKs 由 Starkware 提出；该算法不需要可信设置，且当证词（witness）的规模较大时，ZK-STARKs 在生成和验证证明方面比 ZK-SNARKs 更快；但缺点就是证明本身比较大，往往是 kb 级别。

2019 年 1 月，Sonic 问世；该算法需要可信设置，但是可以用于多个电路，且初始字符串可升级。证明大小恒定，验证证明贵。理论上来说，可以多个证明一起验证。

2019 年 5 月，微软研究中心发布 Spartan，一个无需可信设置的 ZK-SNARKs，具有极快的证明和验证时间（亚线性）。

2019 年 8 月，Aztec 提出 PlonK，并且开展了 176 人参与的初始可信设置。PlonK 是 Sonic 的改进版，证明时间缩短 5 倍。在 L2 项目中采用的最多是 PlonK，比如 Aztec，zkSync，zkSpace，Polygon Hermez。

2019 年 9 月，Zcash 团队提出 HALO 算法，支持递归证明，无需可信设置，线性验证时间（不简洁）。

2020 年 9 月，同样是 Zcash 团队提出的 HALO2 问世，HALO2 是 HALO 和 PlonK 的结合版，有着更灵活的电路设计且更高效。Scroll 目前采用的就是 HALO2。

2021 年 3 月，Nova（Spartan + Bulletproof）被提出，无需可信设置，支持更高效的递归证明，拥有目前最快的证明速度，但证明大小较大（线性）。

2022 年 1 月，Polygon Zero 提出 Plonky2，它结合了 PlonK 和 FRI，具有快速证明和无信任设置的特点，支持递归且验证成本低。

2022 年 10 月，Espresso Systems 团队发布 HyperPlonk。HyperPlonk 是对 PlonK 的改进，使用了多线性多项式承诺（multilinear polynomial commitments），去掉了 PlonK 里面的 FFT 部分，减少了证明时间（线性），但证明大小更大。

**ZK-SNARKs**

- S-Succinct（简洁）：证明大小和验证时间远远小于原始计算（语句）
- N-Non-interactive( 非交互 )：证明者和验证者不需要为每一轮验证来回通信，但证明者和验证者需要完成初始设置阶段。
- A-ARguments( 论据）：具有极大计算能力的证明者可以通过生成错误的证明来欺骗验证者。发生这种情况时，公钥 / 私钥加密也会被破坏。
- K-Knowledge（知识）：证明者需要知道一些秘密才能进行证明。

ZK-SNARKs 是在区块链领域广泛应用的零知识证明系统。第一个使用零知识证明的区块链应用是 Zcash，一个用于隐私支付的数字货币。2014 年成立，Zcash 早期用的是 Pinocchio 算法，在 2018 年 Sapling 升级后使用 Groth16。

传统 ZK-SNARKs（例如 Groth16）有以下三个问题：

1. 需要初始化可信设置。初始化可信设置会生成一个参考字符串（reference string）。如果这个字符串泄露，任何人都可以作假证明。
2. 参考字符串只能被用在一个电路（circuit）里面。因此单一初始设置不能被用于广泛的计算。
3. 参考字符串不能被升级。如果升级，需要重新生成参考字符串。

因此产生了两种解决方案：透明设置（Transparent Setup）和通用设置（Universal Setup）。

透明设置会生成一个公有的参考字符串。在这种设定下，字符串的泄露不会对证明造成影响，但证明大小会很大，如 Fractal 和 ZK-STARK 证明能达到 250KB，而 Halo 和 SuperSonic 的证明要小一些，不到 10KB。

通用设置会创建一个结构化参考字符串。这个参考字符串需要可信设置，但可以被用于多个电路，通常被用于通用的协议或应用。此外，构建生成的参考字符串可以升级而无需重新完成初始可信设置，以便提高安全性。使用通用设置的算法有 Sonic、PlonK 和 Marlin 等。

**3.4.6.2 概要**

ZK Rollups 是 Rollups 的其中一种。与 Optimistic Rollups 依靠欺诈证明不同，ZK Rollups 通过有效证明（零知识证明）来证明二层网络状态变化的正确性。换句话说，零知识证明以密码学的确定性证实了执行所有交易的结果等于 Rollups 的状态变化。由于有效证明可在链上得到及时确认，因此用户能更快的把钱从 Rollups 的合约中取出。和 Optimistic Rollups 相比，ZK Rollups 有更快的交易最终确认时间（Transaction Finality）。

现在的 ZK Rollups 解决方案一般分为两种：特定应用（Application-Specific）ZK Rollups 和通用（General-purposed）ZK Rollups。

特定于应用的 zk Rollups 协议（如 Loopring， StarkEx 等）会设计专门的证明电路，因此证明效率高且用户交易成本低。但是，特定电路使得不同 DApps 之间不能交互，而做不到应用之间的可组合性。此外，对于不同 DApps，开发者需要单独设计电路。这极大地增加了开发难度和周期。

另一个方案就是构建通用（General-purpose）ZK Rollups，例如 Scroll， Polygon Hermez， Starknet，zkSync v2.0 等。也就是说，做一个通用电路（zkEVM）去执行智能合约。这样的做法，把复杂的电路设计工作留给了 Rollup 项目方，而程序员就可以直接使用 Solidity 编程，无需担心设计电路的问题。但这样做会带来极高的额外损耗，例如只想验证一个加法，用户也需要运行整个电路。最近一些技术突破（比如多项式承诺，递归证明，硬件加速等）使得通用电路的证明成本大大降低，构建 EVM 通用电路的想法也就更加容易实现。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701180916-de449b6f-25b3-4a5f-9389-a21459c42fe0.png)

_Source:https://immutablex.medium.com/ground-up-guide-zkevm-evm-compatibility-rollups-787b6e88108e_

**3.4.6.3 时间线**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701181281-de0893ef-f11f-4ce3-9cf5-9f9992ccac4c.png)

- 2018 年 9 月，Vitalik 首次提出用 zk-SNARKs 去验证 L2 区块实现扩容。
- 2020 年 2 月，Loopring v3.0，第一个基于零知识证明的 L2 扩容协议上线。
- 2020 年 6 月，由 StarkEx 驱动的去中心化交易所 DeversiFi 在以太坊主网上线了。同月，用于支付的 zkSync v1.0 主网上线。
- 2021 年 2 月，ZKSwap 上线，一个基于 ZK-Rollups 技术的以太坊 L2 DEX。
- 2021 年 3 月，Hermez 上线，一个支持 ETH 和 ERC20 转账的 ZK Rollup。
- 2021 年 8 月，Polygon 宣布收购 Hermez，形成 Polygon Hermez，计划提供一个 EVM 字节码层面兼容的 ZK Rollup。
- 2021 年 11 月，StarkNet 在以太坊主网上线 Alpha 版本。StarkNet 是一个开放的 zkRollup，任何人都可以部署自己的智能合约，并且和其他智能合约进行交互。
- 2021 年 12 月，L2 Labs 推出 ZKSpace，具有 ZKSwap v3.0、NFTs 和支付功能。
- 2022 年 6 月，dYdX 宣布计划离开 Starkware 并在 Cosmos 上开发自己的区块链，其背后的原因之一是交易吞吐量限制（零知识证明生成的低效率）和 L2 短期内不够去中心化（角色单一）。
- 2022 年 7 月，Scroll 宣布开放 pre-alpha 测试网。
- 2022 年 10 月，zkSync2.0 主网 baby alpha 版本上线，但只用于安全和压力测试。zkSync 2.0 将会是一个通用的 ZK Rollup，通过 zkEVM 更好地兼容以太坊现有生态应用。

**3.4.6.4 技术原理**

ZK Rollups 通过链上验证的零知识证明确认状态变化的正确性。**ZK Rollups 能够扩容的关键是零知识证明的简洁性**。由于验证成本与被证明的交易数量成亚线性（sublinear）关系，验证证明远远小于计算所有交易的复杂程度，因此 ZK Rollups 能极大的减少交易成本。

ZK Rollups 有下述一个技术角色：

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701181897-309d8d53-34ff-434f-9787-449e3195388c.png)

Relayers 有时也叫 Aggregators 或 Sequencers。一些项目（计划）把打包交易和提供证明分两种角色（Sequencers & Provers）来完成。其中，Sequencers 负责汇总和打包交易；Provers 负责生成证明。

把零知识证明外包给证明者网络（Prover Network），可以允许更多设备参与零知识证明的生成（外加并行计算和聚合证明），零知识证明的生成速度能显著提高，从而提高交易速度。此外，协议方也无需承担证明设备的维护成本（但需要给证明者网络经济激励），且去中心化程度提高。这一做法目前仍在研究和开发过程中，尚未实现。

**用户流程**

![](https://cdn.nlark.com/yuque/0/2022/jpeg/1034768/1669701182515-89960ccc-6c20-4a97-80a3-195fb633b207.jpeg)

1. 用户通过在主网上合约锁定资产的方式，将钱存入二层网络。
2. 用户创建交易，并把交易内容发送给中继者。
3. 在接受交易之前，中继者会验证交易的合法性（用户是否有足够的钱等）。
4. 在收集到足够的交易后，中继者会对交易排序（先进先出），执行交易，更新 L2 状态，将数据打包（Batch），并生成一个零知识证明，以 calldata 的形式一起上传至主链上 Rollup 合约。
5. Batch 内容：前状态根， 后状态根，交易根，状态变化，零知识证明
6. 主链上合约
7. 确认 Batch 内容的格式，不符合格式的内容则拒绝；
8. 检查 Batch 中的前状态根是否与其合约当前状态根匹配（确保区块顺序）；
9. 验证上传的零知识证明，确保证明的正确性；
10. 验证通过，把当前状态根换成 Batch 里面的后状态根。

**数据可用性**

ZK Rollups 并不需要把所有的交易数据都放在链上。由于链上验证的零知识证明本身证明了状态变化的正确性，用户的状态是得到 L1 保护的。尽管如此，我们还是需要把一部分的交易数据上传至主网的 Rollup 合约。有了链上数据的可用性，任何跟踪了 ZK Rollups 状态的节点才能在链下重建二层网络的状态，进而打包交易，防止 L2 中继者作恶（如资产冻结和审查）。如果中继者（Relayers ）下线，其他节点也能接力成为中继者，使 Rollup 网络继续运行。

在 ZK Rollups 中，项目方是可以选择上链的数据类型，如原始交易数据，每笔交易的状态变化，一个交易批次的最终状态变化。这三种均可使用户（节点）重建二层网络的状态。选择一个交易批次的最终状态变化，能够有效地压缩链上存储的数据（一个批次内的多笔交易后，某些状态变化可能会相互抵消），从而减少 Rollups 链上存储成本。

**ZK-EVM**

如同前文所述，ZK Rollups 面临的一个很大的挑战就是 EVM 兼容性。由于以太坊本身良好的生态，为了实现更好的开发者体验和可组合性，很多 ZK Rollups 项目（如 zkSync v2.0，Polygon Hermez，Scroll 等）都在寻求更好的 EVM 兼容。通过一定程度上牺牲效率，增加灵活性，实现迁移现有以太坊生态的代码，支持现有以太坊生态的工具（开发者工具&代码库「Hardhat, Brownie」，钱包「Metamask」，分析工具「Nansen, Dune」等）。

我们一般把 zkEVM 分成三种层面的 EVM 兼容性：共识层，字节码层和语言层：

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701182977-c987c4fc-333e-47db-8ae6-97c4896a4648.png)

目前来说，StarkNet 和 zkSync 是语言层面兼容，而 Polygon 和 Scroll 是字节码层面的兼容。在以太坊的路线图里，以太坊将整合一个共识级别的 zkEVM。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701183008-0a6f82c6-067c-4fe2-806d-a2c6e75d5aaa.png)

_Source:https://immutablex.medium.com/ground-up-guide-zkevm-evm-compatibility-rollups-787b6e88108e_

**3.4.6.5 优缺点**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701183535-05517818-9463-48ae-b37e-e0d16e03bed5.png)

**3.4.6.6 应用**

**StarkWare**

概述：

StarkWare 成立于 2018 年， 总部位于以色列。公司两位联合创始人 Eli Ben-Sasson 和 Alessandro Chiesa 也是 ZCash 创始人。其主要目标是进一步推广以色列理工学院研发的 zk-STARKs 突破性区块链隐私解决方案。

目前公司有两个二层扩容产品分别是 StarkEx 和 StarkNet。

StarkEx 是为特定应用提供 Volition 的解决方案，比如 dYdX、ImmutableX、DeversiFi 和 Sorare。Volition 允许用户对每种资产选择对应的数据可用性模式：Rollup（链上数据）或 Validium（链下数据）。这是一个相对封闭的生态，支持 ERC20，ERC721 和 ERC1155。

StarkNet 是一个开放的 ZK Rollups。任何人都可以部署自己的智能合约，并且和其他智能合约交互。

此外，StarkWare 计划将 StarkEx 平台建立在 StarkNet 上，打造一个 Layer 3 的新概念，方便整个生态的相互操作。

时间线：

- 2018 年 5 月，StarkWare 成立。
- 2020 年 6 月，StarkEx 的第一个应用 DeversiFi 上线。DeversiFi 是一个零知识证明驱动的数据在链下的（Validium）DEX。
- 2021 年 11 月，StarkNet 在以太坊主网上线 Alpha 版本，团队计划在 2022 年下半年推出正式版。
- 2022 年 5 月，StarkWare 在 Greenoaks Capital 和 Coatue Management 领导的 D 轮融资中筹集了 1 亿美元，估值 80 亿美元。
- 2022 年 6 月，StarkEx 4.5 版本发布。其中，Volition 允许用户对每种资产选择对应的数据可用性模式：Rollup（链上数据）或 Validium（链下数据）。
- 2022 年 6 月，dYdX 宣布计划离开 Starkware 并在 Cosmos 上做自己的区块链，其背后主要原因是零知识证明的效率，可定制化和去中心化（Sequencer）程度。
- 2022 年 7 月，StarkNet 计划发行代币。StarkNet 代币被用于治理，并作为网络的支付和抵押资产。
- 2022 年 9 月，编程语言 Cairo 1.0 提出，可为 StarkNet 带来更好的可用性、安全性和便利性。

技术特点：

1. 就编程语言而言，StarkEx 和 StarkNet 使用的语言的都是 Cairo。Cairo 本身是和 EVM 不兼容的，但 Starkware 可以借助 Nethermind 开发的 warp 转译器，将 Solidity 语言转化成 CarioVM 的字节码，然后运行在定制的智能合约虚拟机 Cairo VM。这是语言层面的 EVM 兼容。Cairo 本身对零知识证明更友好，生成证明效率高，但是 EVM 兼容差。
2. 就零知识证明而言，Starkware 用的零知识证明算法是 STARK。STARK 不需要可信设置且证明速度快，但证明大小比较大，导致计算和链上验证成本较高。因此，**Starkware 引进了 SHARP 聚合证明的解决方案，该服务允许将来自多个应用的 Rollups 批量交易聚合为一笔交易证明，从而降低交易成本。**

生态发展：

StarkEx 上，目前有四个托管协议：dYdX、ImmutableX、DeversiFi 和 Sorare。

- dydx 是订单簿式期货 DEX，目前的期货 DEX 赛道龙头。但 dydx v4 计划在 cosmos 上部署，成为一条完全去中心化的 POS 链。
- Immutable X 推出了 Layer2 NFT 交易市场，服务于 GameFi（Gods Unchained 等）。
- rhino.fi（前 DeversiFi）是一个 L2 DEX，为用户提供便宜的 DeFi 服务。
- Sorare 是一款足球游戏，于 2021 年 7 月上线。

StarkNet 目前是以 DApp 白名单的方式上线主网 alpha。目前的应用不多，已上线的有 ArgentX 钱包，计划上线的有 JediSwap， Zigzag Exchange 等 DeFi 项目，Orbiter Finance 等跨链桥项目，以及 AAVE， zkLend 等借贷项目。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701183981-62270553-9ff3-482b-896c-dfec5758063a.png)

_Source:https://mobile.twitter.com/ZK_Daily/status/1527597292634914816_

**zkSync**

概述：

zkSync 是基于零知识证明技术的 Layer2 扩容方案，由 Matter Labs 公司于 2018 年开始开发。Matter Labs 首先实现了 STARK 证明，然后转了 RedShift，一个 SNARK 和 STARK 的结合，最后决定使用 PlonK 算法。zkSync 2.0 带来了 zkEVM 和 zkPorter，在更好地兼容 EVM 的同时，将状态数据放链下，极大地提升了交易速度。

时间线：

- 2018 年，Alex Gluchowski 成立 Matter Labs。
- 2019 年 12 月，Matter Labs 团队提出了 zkSync，一个建立在以太坊上的 ZK Rollup。
- 2020 年 6 月，zkSync 1.0 主网上线，使用 PlonK 算法（通用电路），是第一个支持通用计算的 zkRollup 协议。这一阶段，zkSync1.0 只能用于支付功能。
- 2020 年 8 月，zkSync 1.1 上线，通过递归证明，将 TPS 从 300 提升到 3000 左右。同时，zkPorter 被提出，是 Matter Labs 的 Validium 解决方案，将交易数据放在链下，从而极大地提高交易吞吐量（20,000 tps）。
- 2021 年 5 月，zkSync 2.0 测试网 alpha 上线，提出了自定义的 zkEVM，使开发者能将 Solidity 转换成 zkEVM 的字节码，进而在 zkEVM 上运行。
- 2022 年 2 月，zkSync2.0 公共测试网上线。zkSync 2.0 将会是一个通用的 ZK Rollup，通过 zkEVM 更好地兼容以太坊现有生态应用。
- 2022 年 10 月，zkSync2.0 主网 baby alpha 版本上线，但只用于安全和压力测试。

技术特点：

1. 语言层面 EVM 兼容。zkSync 创建了基于寄存器的虚拟机 zkEVM，将 Solidity 转换成 LLVM IR（编译器基础设施）后再转换成自制的 VM 指令。zkSync 这种方法和 Starkware 的方案类似，都是语言层面的 EVM 兼容，理论上来说更灵活。zkSync 最初创建了类似 Cairo 的 Zink 编程语言，但现在已经把工作重心放在 Solidity 编译上，致力于给开发者带来更好的 EVM 兼容体验。
2. ZK 算法使用 PlonK。PlonK 会产生一个通用的字符串，但是需要初始信任设置。此外，zkSync 采用递归证明，可提高交易速度。

生态发展：

Zksync 目前 2.0 主网已上线 baby alpha 版本。在 1.0 版本中，上线的项目有：1KXprotocol，这是一个将自动做市商（AMM）和去中心化交易平台（DEX）结合、低滑点的 DeFi 聚合平台。还有 Argent 钱包，Zigzag 去中心化交易所，跨链桥 Orbiter，Mystiko Network（该协议目前仍处于测试网阶段，可以被集成到跨链桥、L1 和 L2、钱包和 Dapp，以保证用户隐私）。随着即将到来的 zkSync2.0 主网，正式上线的项目会越来越来多。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701184267-4b1e47fa-81cc-4807-ae7d-9b05654c93e5.png)

_Source: https://twitter.com/ZK_Daily/status/1537461972920197120/photo/1_

**Polygon**

概述：

Polygon（前 Matic Network）是一个以太坊扩容解决方案聚合器。核心组件是 Polygon SDK，便于开发者快速构建或连接 L2。目前 Polygon 有 3 个 ZK Rollup 相关的产品：Miden，Hermez 和 Zero,都在开发和测试阶段，预计 2022 年底或者 2023 年上线。

时间线：

- 2021 年 3 月，Hermez 上线，是一个支持 ETH 和 ERC20 转账的 ZK Rollup。
- 2021 年 8 月，Polygon 宣布收购 Hermez，形成 Polygon Hermez，计划提供一个开源的 EVM 字节码层面兼容的 ZK Rollup。
- 2021 年 11 月，基于 zk-STARKs 的 ZK Rollup，Polygon Miden 发布。Miden 创建了与 EVM 兼容（语言层面）的基于 ZK-STARKs 的 Miden VM，支持通用智能合约。
- 2021 年 12 月，Polygon 宣布收购 Mir Protocol，构建 Polygon Zero。Polygon Zero 利用 Plonky2（递归零知识证明系统，PlonK+FRI）的速度来实现可扩展性更强的且更去中心化的 ZK Rollup。它提供了 Rollup 和 Validium 两种模式，使用户能够获得更高的吞吐量和更低的费用。
- 2022 年 10 月，Polygon Hermez 公众测试网上线。

技术特点：

**1.Polygon Hermez**

1. Polygon Hermez 实现了字节码层面的 EVM 兼容。在执行交易时，Aggregator 需要把 EVM 字节码翻译成另一套叫 zkASM（Zero-Knowledge Assembly）的字节码，而验证者需要对 zkASM 的字节码进行证明。此方法需要一个字节码的翻译器，在 EVM 升级时，Hermez 需要手动更新来保持同步。
2. Polygon Hermez 使用的是 ZK-STARKs 和 SNARK 结合的零知识证明系统。底层是 ZK-STARKs，被用来证明每个子电路执行的正确性；SNARK（PlonK 或 Groth16）的证明大小更小，且验证更便宜，因此被用来聚合生成的 ZK-STARKs 证明，最后上传至主网合约。
3. 此外，Polygon Hermez 高度重视去中心化实现。Sequencer 的共识机制从 v1.0 的 POD（Proof-of-Donation）过渡到 v2.0 的 POE（Proof of Efficiency），允许每个人都能参与 L2 的区块打包，但仍摆脱不了算力竞赛带来的证明者中心化问题。

**2.Polygon Miden**

1. Polygon Miden 创建了一个基于 ZK-STARKs 的虚拟机 Miden VM 来支持通用智能合约的执行。Miden VM 会将 Solidity 代码直接编译成 Miden Assembly（Miden VM 的原生编程语言），实现语言层面 EVM 兼容。此外，Polygon Miden 也在探索对其他语言进行编译，如 Move。
2. Miden VM 的底层证明系统是 Winterfell，一个高性能 STARK 验证器，可以为任何交易生成 STARK 证明。使用 ZK-STARKs 的好处在于它无需可信设置，抗量子计算且证明生成和验证速度快。

**3.Polygon Zero**

1. Polygon Zero 使用 Plonky2 作为其零知识证明系统，PlonK 和 FRI 的结合使零知识证明能在 170mm 内（商用电脑）完成。
2. Polygon Zero 中，每笔交易都是一个零知识证明。因此很多交易可以同时生成证明，再通过递归形成一个最终的证明。也就是说，Polygon Zero 能够通过增多节点来横向扩容。

生态发展：

目前 Polygon 旗下的三个 ZK Rollups 方案都在开发和测试阶段，生态尚未成型。

**Scroll**

概述：

Scroll 是由 Ye Zhang 在 2021 年 3 月提出的 zk-rollup 解决方案。Scroll 主要想做两件事，构建通用的 ZK-EVM 和去中心化的证明者网络。

时间线：

- 2021 年 3 月，Ye Zhang 在 Ethereum Research 论坛上提出 Scroll，通过结合两种不同的零知识证明系统，以提高链上和链下的效率，从而实现通用的 ZK Rollup。
- 2022 年 7 月，Scroll 宣布开放 pre-alpha 测试网，有一些智能合约的预部署，比如 Uniswap v2，但目前只对白名单用户开放。

技术特点：

1. 第一个版本的白皮书提出用两种不同的零知识证明系统结合起来，以提高链上和链下的效率，从而实现通用的 ZK Rollup。在和以太坊基金会交流后，Scroll 决定和以太坊基金会 Privacy Scaling Group 合作完成 zkEVM。**此 zkEVM 直接在电路中实现每个 EVM 操作码（进行过程中）。因此它的 EVM 兼容性是非常好的。**
2. Scroll 的 zkEVM 是字节码层面的 EVM 兼容，支持原生 EVM 字节码的执行。因此主网上的 DApps & 开发者工具可以直接在 Scroll 上继续使用，基本不需要改动。
3. Scroll 拥有等级化零知识证明系统。第一层，有效的证明（电路优化，硬件优化）。第二层，验证优化（简洁的证明，EVM 友好的验证算法）。通过递归证明和并行计算的方式，提高交易速度，减少手续费。
4. 此外，Scroll 计划分离打包者和证明生产者，构建外包的证明者网络。然后通过不断地迭代硬件设备（GPU->FPGA->ASIC），做到 ZKP 生产速度的提高；打包者的去中心化也在构想中。
5.   
6. Scroll 是目前 EVM 兼容性做的最好的 ZK Rollup 项目之一。通过它的设计（zkEVM 迭代，递归，并行计算，硬件加速），零知识证明的生成速度能够达到很快（目前 1m Gas 需要 6 分钟），从而更好地扩容以太坊 L1。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701184893-f401fcfa-e8f1-4cb3-abe7-683d4bc3aa7d.png)

_Source:https://scroll.mirror.xyz/nDAbJbSIJdQIWqp9kn8J0MVS4s6pYBwHmK7keidQs-k_

生态发展：

Scroll 目前还处于早期，生态尚未形成。

**3.4.6.7 应用比较**

对于 ZK Rollups 而言，扩容效果，EVM 兼容性，安全性和生态是我们所认为的重点。目前来说，我们很难对不同 ZK Rollups 协议评价好坏，更多的是协议方面对不同使用场景和自身意愿做出的不同解决方案。

目前，ZK Rollups 扩容的主要瓶颈在于零知识证明的生成速度。随着零知识证明算法的飞速发展（SNARK->STARK->PlonK->HALO2 等），零知识证明的生成和验证效率会不断提高。一些新的技术突破（多项式承诺，递归证明，硬件加速等），也使得零知识证明系统进一步优化。我们相信在不久的未来，零知识证明生成速度的瓶颈将会得到改善。

由于 EVM 本身并没有专门为生成零知识证明而设计，其中的一些操作的证明（如哈希函数 Keccak-256，存储证明等）会有很大的额外损耗。我们知道，为了尽可能做到 EVM 兼容而更好地使用和迁移现有应用和工具，我们就得接受 EVM 本身的 ZK 不友好性，但这会导致较低的证明生成效率。这就是 Scroll 在做的事情，为 EVM 每个操作码设计电路，容忍一些 ZK 不友好操作，尽可能做到 EVM 兼容。

StarkWare 和 zkSync 选择了另一条路，打造对零知识证明更友好的虚拟机，来加速证明生成从而扩大交易吞吐量。但随之而来的，是对 EVM 兼容性不高，项目迁移成本高，生态比较难起来。

所以说，这实际上是 ZK 友好和 EVM 兼容的权衡利弊。随着以太坊本身往 ZK 友好靠拢，上述两种方案也在往中间靠拢。

就 Rollups 本身的设计而言，Relayer 的去中心化也是一个问题。如果我们把打包和生成证明分开，那就是 Sequencer 和 Prover 两个角色，但都需要进行去中心化。

zkSync 和 StarkNet 目前还没有做到去中心化。他们的 Sequencer 和 Prover 都由官方团队运营，打包交易和生产证明都是团队负责，也没有搭建好去中心化的矿工节点，社区还无法参与。除了中心化本身来带的单点故障和信任问题，还有一个问题是，所有的算力都控制在团队自己手里，意味着团队要租用机器来持续承担这部分的成本。把 Sequencer 和 Prover 交给社区，并设置一定的经济激励，会是一个更好的做法。Polygon Hermez 和 Scroll 均有把 Sequencer 和 Prover 去中心化的想法，但目前仍处于概念证明（PoC，Proof of Concept）阶段。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701185087-0fa8f3e0-d919-4bac-ab1d-dd9d022eba45.png)

**3.4.7 OP Rollups vs. ZK Rollups**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701185230-4c9d1946-da97-4e66-a1c6-206aedab3692.png)

_Adapted from https://vitalik.ca/general/2021/01/05/rollup.html_

### 3.5 Validium

**3.5.1 概要**

Validium 的机制和 ZK Rollups 非常相似，唯一的区别就是数据可用性：在 ZK Rollups 里，数据是放在链上的合约中，而在 Validium 中，数据是交给链下的数据可用性委员会（Data Availability Committee，DAC）。

目前 StarkWare 的 StarkEx 和 zkSync 的 zkPorter 都会提供 Validium 的解决方案（但后面均转向了 Volition）。

**3.5.2 技术原理**

Validium 核心思路就是将链下状态的承诺（State root）放在主网上，通过主网验证的零知识证明确保状态的正确性，并通过链下的数据委员会，确保链下状态的可用性。

**数据可用性**

StarkEx 的 DAC 由 8 个有名望的组织组成，包含 ConsenSys、Infura、Nethermind、Iqlusion 和 Cephalopod 等。所有 DAC 成员需要对收到的链外数据（已加密）进行计算，并对新的状态签名，以确保他们收到了数据。而链上的合约只会接受带有 DAC 成员签名的交易批次。

StarkEx 的安全性和一个 POA（Proof of Authority）的网络非常类似。如果没有链上数据的可用性，Validium 的 Operator 有拒绝用户移动资产的能力。那么用户要是想移动资产，就需要给 Operator 一部分资金。如果遇到紧急情况（如 Sequencer 拒绝提交交易批次），DAC 成员可以将数据重新上传至链上，从而允许用户从链上合约内取钱。

zkPorter 账户的数据可用性将由 zkSync 代币持有者（称为守护者，Guardians）保障，他们将通过签署区块来跟踪 zkPorter 端的状态，以确认 zkPorter 帐户的数据可用性。监护人使用 zkSync 代币参与权益证明 (PoS)，因此任何数据可用性故障都将导致他们的资产被烧毁，这为数据可用性提供了加密经济保证。值得注意的是，守护者参与的 PoS 只是为了支持数据可用，也就是说，他们只能冻结用户资产，而不能改变用户资产。因此 zkPorter 的安全性，会高于侧链的 PoS。

**Validium vs. ZK Rollups**

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701185593-f1b25315-6835-452f-97c3-5f3613a4bfbb.png)

### 3.6 Volition

**3.6.1 概要**

Volition 是 Starkware 在 2020 年 6 月提出的一个链上与链下数据混合的扩容解决方案，允许用户动态地选择他们的数据存储位置。如果数据在链上，就是 ZK Rollup，可为用户提供更高的安全性，但交易成本会更高；如果数据在链下，就是 Validium，用户会有更便宜的费用但更低的安全性。Volition 将选择权交给用户，提供了更好的灵活性。

Volition 数据可用性的选择权可以是基于账户的，基于资产的，或基于单笔交易的。基于单笔交易可以带来更多的灵活性，但实现起来会更复杂。

目前 StarkEx，zkSync 和 Polygon Hermez 都计划或推出了各自的 Volition 解决方案。其中 StarkEx 的 Volition 解决方案是基于单个资产的选择，zkSync 的 zkPorter 是基于账户的选择，而 Polgon Hermez 暂未详细展开说明。

**3.6.2 技术原理**

Volition 可以理解为 ZK Rollup 和 Validium 的结合体，给用户提供不同安全性和交易费率的选择。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701185883-3af15b2a-5dce-4021-8624-de37df8d2e65.png)

_Source:https://medium.com/starkware/volition-and-the-emerging-data-availability-spectrum-87e8bfa09bb_

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669701186501-da32087b-0320-4a32-85bb-96279f56f3b0.png)

  
  

## 4.总结展望

  
  

如何解决区块链的不可能三角（可拓展性，安全性和去中心化）这一问题，一直是区块链领域一大难题。随着区块链使用量的攀升，区块链本身能承载的交易量和用户交易成本成为了一个迫在眉睫的问题。以太坊每秒能处理的交易在 12~15 笔左右，而 Visa 每秒能处理 2,000+ 交易。要想区块链能更好地承载经济和日常活动，区块链就必须在保证一定安全性的同时想办法扩容。

本文从发展时间线、技术原理、优缺点和应用四个方面详细介绍了当前主流的链下扩容方案，并有以下观察与想法：

1. 链上扩容和链下扩容不是竞争关系，而是共生关系，且 1+1>2。例如，结合分片技术和 Rollups，以太坊能达到很好的扩容效果（20,000+ tps）；以太坊路线图上的许多措施都将为建立在其上的链下扩容方案提供更多的效率，随着以太坊变得更好、更高效，建立在它之上的链下方案也会不断进步。
2. 不同的链下解决方案对应不同使用场景和需求。比如，State Channels 由于手续费低，交易确认速度快，适合日常简单支付场景。而 Rollups 更加适用于通用的复杂商业逻辑，如 DeFi，GameFi 等。
3. 从链下扩容技术发展的时间线上，我们看到了两条主旋律：一是应用场景的多元化（从简单支持场景过渡到特定应用，再到通用场景），二是安全性假设的升级（从依赖链外共识到至少一人诚实「经济激励」再到现在依靠数学证明）。
4. Optimistic Rollups 和 ZK Rollups 是目前主流的链下扩容解决方案。Opstimistic Rollups 技术比较成熟，生态发展不错，但仍存在安全性（大多数协议欺诈证明系统未上线）和去中心化程度低的担忧。ZK Rollups 可能会是链下扩容的目前可预判的最优解决方案，因为它本质上解决了一层性能不足的同时，还可以在保障安全（ZKP 算法的保证）的前提下将交易处理外包给可扩展性较高的二层（只存储状态变化可以减少链上存储需求）处理。这个解决方案几乎接近于完美的解决了不可能三角的难题，但是我们也能够意识到 ZK Rollups 受限于 ZKP 的生成中大量的向量乘法、傅里叶变换等计算，使得它会非常耗内存，对硬件要求较高，所以实际当前实际应用的落地性还待改善；还有目前看到的使用 ZKrollup 协议的去中心化程度较低。这两个问题是可以解决的。我们相信在不久的未来，ZK Rollups 的潜力将会被完全释放。
5. 在 ZK Rollups 虚拟机设计中，EVM 兼容性和 ZK 友好性的权衡只是一种选择，并非好坏。Scroll 和 Polygon Hermez 设计兼容性更好的 VM 是为了更好地承接以太坊现有生态和工具；Starkware 致力于打造 ZK 友好的虚拟机，能极大程度提高零知识证明生成效率，带来更好的用户体验（低手续费）。
6. 目前，Rollups 仍是辅助轮模式「training wheel」，存在一定的安全隐患。例如，Rollups 合约的更新权限在项目方手里，协议可能会有 Bug。我们更多的是相信项目方，而非代码本身。Vitalik 在 ETH Bogota 演讲里提到的多重证明者系统（fraud provers + zk provers + governance threshold）会是一个不错的解决方案。不同证明系统之间的低相关性，降低了多个证明系统同时陷入困境的概率，使得 Rollups 更安全。
7. 链下扩容解决方案的生态建设和自身的基础设施建设是相辅相成的。的确，BD 能力和项目方和投资方背景能在前中期吸引更多的建设者，但从中长期的视角，协议自身素质（性能，安全性和去中心化程度）同样甚至更重要。建设者们首先考虑的应该是协议能否承载应用的发展，接下来才是社会关系。协议自身素质会吸引优质的应用落地，而链上生态的繁荣也反哺协议，为其带来价值。
8. 当区块链真正能达到很高的 TPS 时，我们需要一些杀手级 DApps 去承载这些额外的交易量。这个机会，可能在 GameFi 或者 SocialFi。
9. 使用相同技术的 Rollups 叠加（rollups on top of rollups）不会带来大幅度的扩容，Layer3 可以是特定应用的 Rollups，也可以是 Validium。目前很难决定，两层还是多层的链下扩容结构更好。
10. 随着以太坊合并的完成，以太坊显卡挖矿时代已经结束，但带来了 ZKP 类硬件开发和挖矿的新机会。
11. 通过将 EIP-4337 与 Rollup 技术结合，可以在账户抽象化中实现数据压缩和降低 gas 成本的效果，更好地发挥账户抽象的优势。

一方面，链上扩容方案近期迎来重大里程碑——北京时间 2022 年 9 月 15 日 14:44，以太坊 The Merge 正式被激活，标志着以太坊区块链完成了由工作量证明（PoW）向权益证明（PoS）的过渡。PoS 新时代的正式开启，消除了过去以太坊对大量挖矿算力的需求，朝着链上扩容方案更近一步。然而，以太坊在合并之后，还远远未达到 Vitalik Buterin 所设想的最终形态，分片的链上扩容方案也还要等待多年。

另一方面，回顾链下扩容的方案的演变历程，经历了 State Channels, Sidechains, Plasma，到如今的 Rollups（ZK Rollups & Optimistic Rollups) ，未来的扩容方案可能有更多的形式，并不一定局限于 Rollups。

随着 NFT 和游戏市场的快速增长，即使在加密货币的熊市中，以太坊也需要准备好应对未来新的激增需求。其他陆续出现的新的 L1 虽然有着更高的 TPS，但目前仍然难以达到以太坊所拥有的安全水平。未来 Web3 的大规模采用，即使是每秒 10 万笔交易，也无法满足全球需求，所以结合链上扩容和链下扩容将是以太坊成功的关键。随着未来更多扩容方案的出现，会为更多 web3 爆款应用的诞生创造条件；我们相信不远的将来，会迎来区块链的大规模商业应用阶段。