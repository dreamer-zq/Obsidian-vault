**背景概述**

在上次的文章中我们了解了智能合约中的[拒绝服务攻击](http://mp.weixin.qq.com/s?__biz=MzU4ODQ3NTM2OA==&mid=2247496478&idx=1&sn=ab7c5bad8b74375896e69d2ff2ad7df8&chksm=fdde8d99caa9048fcd005310402937745d166b6bef116ef19095dae4c5d1510392c2f93d763d&scene=21#wechat_redirect)，这次我们一起来了解智能合约中基于 tx.origin 的钓鱼攻击。

**前置知识**

首先我们来了解在 Solidity 中常用的两种验证发送方地址的方式：

- msg.sender：msg.sender 仅会读取上层调用者的地址。
- tx.origin：tx.origin 会读取启动交易的原始地址。

由下图可以看到，Bob 通过 A 合约调用 B 合约，B 合约又调用 C 合约。对于 C 合约来说，tx.origin 为 Bob ，msg.sender 为 B 合约。对于 B 合约来说， tx.origin 也是 Bob ， msg.sender 为 A 合约，对于 A 合约来说，tx.origin 与 msg.sender 均为 Bob 。这里我们可以得出一个结论：tx.origin 永远都是 EOA 地址，msg.sender 可以为 EOA 也可以为合约地址。

![](https://cdn.nlark.com/yuque/0/2022/jpeg/1034768/1669286085924-54a0f097-7d97-45ff-956f-75c2e8eec83a.jpeg)

  
  

**漏洞示例**

通过前置知识相信大家已经了解了 msg.sender 与 tx.origin 之间的区别，下面我们还是通过漏洞合约来带大家深入了解：

```

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
contract Wallet {
    address public owner;

    constructor() payable {
        owner = msg.sender;
    }

    function transfer(address payable _to, uint _amount) public {
        require(tx.origin == owner, "Not owner");

        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }
}
```

**漏洞分析**

可以看到， Wallet 合约是一个合约钱包，创建者可以在部署合约时将自己的以太转入合约中。当你想花钱的时候可以调用 Wallet.transfer() 将任意数量的存款转移。当然，钱包里的钱并不是任何人都能碰的，所以这里需要通过 tx.origin == owner 的检查才能转账。问题也就出现在这里，前置知识中说到 tx.origin 会读取启动交易的原始地址，所以我们可以伪造一个钓鱼合约来欺骗受害者发起交易从而窃取他的身份转走他的以太。接下来我们看看攻击合约是如何完成身份窃取的。

Tips：相信细心的小伙伴已经发现 Wallet 合约还存在一个漏洞，就是我们在第一期中介绍的重入漏洞。这里提一句：被 fallback 回调函数调用时 tx.origin 依然是最初调用者的 EOA 地址。其他的就不做过多介绍了，不懂的小伙伴可以参考第一篇[《智能合约安全审计入门篇之重入漏洞》](http://mp.weixin.qq.com/s?__biz=MzU4ODQ3NTM2OA==&mid=2247494325&idx=1&sn=39b32e10219ca6209e3fd11cb0134bc9&chksm=fdde9432caa91d24bdb064217249f6c1a7696b1869748f7eef3697403d4cbd00f0b44a22d85b&scene=21#wechat_redirect)。

**攻击合约**

```
contract Attack {
    address payable public owner;
    Wallet wallet;

    constructor(Wallet _wallet) {
        wallet = Wallet(_wallet);
        owner = payable(msg.sender);
    }

    function attack() public {
        wallet.transfer(owner, address(wallet).balance);
    }
}
```

Alice 在注册时的签名并不是用于注册的，而是签名了调用 Attack.attack() 这笔交易。Attack.attack() 调用了 Wallet.transfer() 并传入 owner 也就是 Eve 的 EOA 地址，以及 Wallet 合约中的以太余额。因为签名这笔交易的地址为 Alice 的 EOA 地址，所以对于 Wallet 合约来说 tx.origin 就是 Alice 的 EOA 地址，所以 Eve 成功利用钓鱼伪造了 Alice 的身份，通过了权限检查并成功将 Wallet 合约中的以太转移到了自己的账户中。

我们先来分析攻击流程：

1. Alice 部署了 Wallet 合约并向合约中转入十个以太将该合约作为自己的钱包合约。

2. Eve 发现 Wallet 合约中有钱，部署 Attack 合约并在构造函数中传入 Wallet 合约的地址。

3. Eve 通过社会工程学调查到 Alice 特别喜欢网购包包，部署一个假的购物网站并将链接发送至 Alice 的邮箱。

4. Alice 收到邮箱好奇心驱使她点开链接，发现里面有自己喜欢的包包并且价格很低，一时心动就准备购买，但是购买的时候发现需要连接钱包完成签名才能注册成功，Alice 觉得这个网站非常棒很 Web3 ，想都没想直接签名了这笔交易。

5. 签名成功后 Alice 发现自己在 Wallet 合约中的所有以太已经被转移。

这次的攻击原理其实很简单，我们来看看到底发生了什么：

**修复建议**

作为开发者

tx.origin 会递归栈的调用，然后找到交易的调用的最初发起者(EOA)的地址，当使用 tx.origin 进行鉴权的时候，会存在钓鱼的风险。所以 tx.origin 目前仅适用于校验 msg.sender 是否是 EOA 地址，不适用于做权限的校验，需要使用 msg.sender 来进行权限校验。  
  

作为审计者

在审计中需要关注代码中使用了 tx.origin 进行鉴权的位置，分析是否会存在被钓鱼的风险。