# op区块回滚方案

## 目标

在op-stack改动不大的前提下,实现对目标区块状态的回滚。

## 时期

在op中区块存在以下三种状态：

- unsafe：未上传到L1的区块
- safe:  已经上传到L1，并能够在L2派生的区块。
- finality: 能够派生出L2区块的L1区块已经finality。

后两种状态的情况下，L2的区块已经被上传到L1中，在不大概op源码的前提下，基本很难实现，所以我们将回滚的目标区块定格在unsafe状态。由于unsafe状态的区块出块频率很高（2s），而且转化为safe状态也很快，所以我们需要对当前网络实施暂停措施，以下是实施步骤。

## 步骤

设计一个新的组件(op-rollback)，op-node,op-geth,op-batch三个组件在启动时，需要加载op-rollback组件，处理以下事件：

- 暂停网络

以上组件处理暂停网络事件：

1. op-node，op-geth需要停止生成新的区块；

2. op-batch需要停止从op-node获取新的unsafe的区块；

- 重置网络

以上组件处理重置网络事件：

1. op-geth回滚指定区块以及后面的所有区块；（op-node ？）
2. op-batch清空队列所有数据，重置内存状态；

- 重启网络

以上组件处理重启网络事件：

1. op-batch重新开始拉取unsafe的区块；
2. op-node重新开始生成区块；

在以上每一步的事件处理完毕后，每个都需要响应op-rollback success，以供op-rollback执行下一步的操作。



