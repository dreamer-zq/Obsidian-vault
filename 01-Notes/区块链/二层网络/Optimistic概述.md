## 引言

本篇文章主要关注以太坊的Layer2 Rollup宇宙（仅包括Secured Rollup），将从核心概念和机制设计上通俗易懂地探讨当前Rollups的优劣，并思考潜在的路线以及他们每个未来解决方案在去中心化、进一步扩展、可组合性和隐私等附加功能方面的优缺点。

Secured Rollup 是一种类似于 Arbitrum 或 Optimism 的 Rollup 模型，其中结算、共识和数据可用性都依赖于像以太坊一样的 L1，并且只处理执行本身。

## 技术简介

**扩容区块链有两种方法：一种是优化区块链本身，另一种是更好地使用区块链。**

Rollup 是第二种，其实质很简单：更快、更便宜和“可信”地使用区块链，扩展区块链（基本上特指以太坊）

**Rollup 是：链上智能合约 + 链下聚合器。**

就这么简单。这两个特性的组合定义了 Rollup 并充实了它的概念。

- **链上智能合约**，也就是说它的[[心智模型]]是以太坊上的智能合约，[借用了以太坊的安全性](https://twitter.com/bkiepuszewski/status/1532617975433502721?s=21&t=QYKPEaEdbn-_cSS6N4vcXQ)，而不是像其他Alt L1一样需要新的信任共识。我们可以像信任 Uniswap 的协议（其核心是智能合约）一样信任 Arbitrum 的协议。
- **链下聚合器**，这意味着它将在链下执行和聚合交易，压缩大量交易并最终将它们放在以太坊主网上，目的是使交易更快、更便宜。

以太坊的机制是每个节点存储并执行提交给它的每一笔交易，所以这样一个去中心化的网络是非常昂贵的。

后面会展示以Aribitrum、Optimism为代表的Optimistic Rollup机制，以及以zkSync、StarkNet为代表的zk Rollup机制，供读者简单了解。

## 原理

**Optimistic Rollup 顾名思义就是乐观的。它使用无罪推定，默认情况下每个人都会相信每次执行都是正确的，并且每个批处理状态都可以通过欺诈证明来挑战这一事实来确保安全性。**

用户在 Arbitrum 网络中提交交易，Arbitrum 的排序器执行交易，将完整的状态根和交易数据批量提交到以太坊主网上的智能合约。

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669613990806-ce06647d-214a-41e9-b62b-cf78c2ebf78b.png)

![](https://cdn.nlark.com/yuque/0/2022/png/1034768/1669614058303-88b38ff4-b088-4ff9-82f6-654e4fb02b7d.png)

**如果 Optimistic Rollup 执行产生错误怎么办？**

- **Optimistic Rollup 有一个争议验证周期**，这意味着数据要等到比如上传一周后才能最终确定，在此期间任何人都可以质疑它并证明该批次是错误的。

## 总结

[https://www.paradigm.xyz/2021/01/how-does-optimisms-rollup-really-work](https://www.paradigm.xyz/2021/01/how-does-optimisms-rollup-really-work)