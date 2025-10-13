## Payment distributed

### 前置知识

`agent`服务连接从上次执行`Ping`操作开始，超过20秒并且用户关闭连接后，`agent`服务会发起结算交易(`MsgSubmitPayment`)。

在执行`MsgSubmitPayment`时，会计算出用户实际应该支付的金额（UserLock），并根据Contribution Rate计算每个Contributors(miner、orchestrator)应该分配到的金额。然后将统计结果保存到当前的Session中。

然后选择一批agent账户（过滤掉当前session的agent）作为执行挑战的validator。

当挑战结束时，进行奖金(UserLock)的分配，奖金分配情况如下：
- 当 `session.Status == types.SessionStatus_SESSION_STATUS_CHALLENGE_SUBMIT_MERKLE`并且validator结果一致的人数超过2/3时：**按照上面计算好的Contribution进行奖金的分配**。
- 当挑战没通过时，但是执行 `MsgSubmitChallengeOriginHash`通过时，执行`PunishAgentSession`。如果仍然没通过，将session的过期时间延长一年，UserLock继续锁定。
当session过期时，执行以下操作：
- 当 `session.Status == types.SessionStatus_SESSION_STATUS_PENDING`，退回用户资金（UserLock）。
- 当 `session.Status == types.SessionStatus_SESSION_STATUS_SUBMITTED` 按照挑战成功的逻辑分配奖金。
- 当 `session.Status == types.SessionStatus_SESSION_STATUS_CHALLENGE_SUBMIT_CID` `SessionStatus_SESSION_STATUS_CHALLENGE_SUBMIT_MERKLE` 执行 `PunishAgentSession`
- 当 `session.Status == types.SessionStatus_SESSION_STATUS_CHALLENGE_SUBMIT_REPLY` ,过期时间延长 `ChallengeMerkleTime`
- 当 `session.Status == types.SessionStatus_SESSION_STATUS_CHALLENGE_SUBMIT_ORIGIN`  
	- 如果投票一致的validator超过2/3,执行 `PunishAgentSession`。
	- 如果没超过，session有效期延长一年。 
### 需求/功能描述

当前成功调整完成后，直接将用户质押的代币按照贡献分配给各个miner。现在需要TGE之后再进行奖金的发放，其他逻辑保持不变。

### 详细设计

新增存放用户奖金的存储空间。
```go
type Keeper struct {
     Reward collections.Map[sdk.AccAddress, sdk.Coin]
}
```

目前奖金的发放是在 `ClaimAgentSession`函数中完成，代码如下：
```go
func (k Keeper) ClaimAgentSession(ctx context.Context, session *types.Session) error {
	agent_addr, err := sdktypes.AccAddressFromBech32(session.AgentAccount)
	if err != nil {
		return err
	}
	agent, err := k.Agents.Get(ctx, agent_addr)
	if err != nil {
		return err
	}
	// Add prestige to the agent based on the distributed total amount
	agent.Prestige.AddPrestige(session.UserLock.Amount.Uint64())
	if err = k.Agents.Set(ctx, agent_addr, agent); err != nil {
		return err
	}
	// Distribute the total amount to the corresponding accounts based on their contributions
	for i, contribution := range session.Payment.Contributions {
		if contribution.Amount != nil && contribution.Amount.Amount.IsPositive() {
			if err := k.bk.SendCoinsFromModuleToAccount(ctx, types.ModuleName, sdktypes.MustAccAddressFromBech32(contribution.Account), sdktypes.Coins{*contribution.Amount}); err != nil {
				return err
			}
			session.Payment.Contributions[i].Amount = nil
		}
	}
	// Give back the agent's locked coins in the session
	if session.MinerLock.IsPositive() {
		if err := k.bk.SendCoinsFromModuleToAccount(ctx, types.ModuleName, agent_addr, sdktypes.Coins{session.MinerLock}); err != nil {
			return err
		}
		session.MinerLock = sdktypes.NewInt64Coin(session.MinerLock.Denom, 0)
	}
	return nil
}
```
我们只需要修改 `SendCoinsFromModuleToAccount`该处的逻辑，变更如下：
```go
for i, contribution := range session.Payment.Contributions {
		if contribution.Amount != nil && contribution.Amount.Amount.IsPositive() {
		     account := sdktypes.MustAccAddressFromBech32(contribution.Account)
			 amount, err  := k.Reward.Get(account)
			 if err != nil {
			     amount = sdk.NewCoin(contribution.Amount.Denom,math.ZeroInt())
			 }
			 if err := k.Reward.Set(account, amount.Add(contribution.Amount));err != nil {
			     return err
			 }
			session.Payment.Contributions[i].Amount = nil
		}
	}
```