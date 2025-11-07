# ZKsync Prividium 链部署文档

本文档将指导您使用 ZKsync Stack CLI 在本地运行 ZKsync Prividium 链。通过本指南，您将能够：

- 设置本地 Elastic Network 生态系统
- 创建 ZKsync Prividium 链
- 部署智能合约到您的链上
- 测试与合约的交互
- 运行本地区块浏览器

## 前置准备

### 安装依赖

在开始之前，请按照 [matter-labs/zksync-era](https://github.com/matter-labs/zksync-era/blob/main/docs/src/guides/setup-dev.md) 项目的 Setup dev guide 安装 `zksync-era` 仓库所需的所有依赖。

### 安装 ZKsync Stack CLI

使用 `zkstackup` 工具安装和管理 `zkstack`：

```bash
curl -L https://raw.githubusercontent.com/matter-labs/zksync-era/main/zkstack_cli/zkstackup/install | bash
zkstackup
```

## 设置 Elastic Network 生态系统

### 创建生态系统

切换到您希望创建生态系统文件夹的目录，然后运行以下命令生成生态系统文件夹：

```bash
zkstack ecosystem create
```

系统会提示您选择一系列选项来自定义生态系统并在生态系统中生成新链。请根据需要进行配置。

### 端口要求

确保以下端口可用：

- `3050` - Prividium 链节点
- `3070` - 合约验证器
- `4041` - Proxy RPC API
- `5432` - Postgres 数据库
- `8545` - L1 链

### 部署生态系统

进入生态系统文件夹：

```bash
cd my_elastic_network
```

运行以下命令部署生态系统：

```bash
zkstack ecosystem init --dev --validium-type no-da
```

此命令将部署生态系统合约到 L1，并将您的链注册到生态系统中。

## 启动链服务

### 启动链服务器

运行以下命令启动 `prividium_chain` 服务器：

```bash
zkstack server
```

启动后：
- L1 链运行在端口 `8545`
- Prividium 链数据库运行在端口 `5432`
- Prividium 链节点运行在端口 `3050`

**注意**：端口 `3050` 的节点提供对链的完全访问权限，此 URL 应保密。

## 为钱包充值

由于使用本地 reth 节点作为 L1 并选择 ETH 作为基础资产，您可以访问 L1 上的多个富钱包地址。完整的富钱包地址及其私钥列表可在 [ZKsync 文档](https://docs.zksync.io/zksync-network/tooling/local-setup/anvil-zksync-node#pre-configured-rich-wallets)中找到。

运行以下命令向 Prividium 链桥接一些 ETH：

```bash
zkstack dev rich-account --chain prividium_chain
```

此命令将向地址 `0x36615cf349d7f6344891b1e7ca7c72883f5dc049` 桥接 1 ETH。

## 部署合约

### 创建 Hardhat 项目

退出生态系统文件夹，使用 ZKsync CLI 初始化新的 Hardhat 项目：

```bash
npx zksync-cli create prividium-token --template hardhat_solidity --project contracts
cd prividium-token
```

### 配置私钥

使用富钱包的私钥：

```
? Private key of the wallet responsible for deploying contracts (optional)
0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110
```

### 配置网络

在 `hardhat.config.ts` 文件中，将本地网络配置为默认网络：

```typescript
defaultNetwork: "dockerizedNode",
```

### 编译和部署

编译合约并运行 ERC20 代币合约的部署脚本：

```bash
npm run deploy-erc20
```

**请保存部署的合约地址以供后续使用。**

## 配置 Proxy RPC API

### 初始化 Proxy API

在生态系统文件夹中打开新终端并运行：

```bash
zkstack private-rpc init
```

可以为提示选择默认选项。此命令将生成两个文件：

- 私有代理 `docker-compose` 文件：`/chains/prividium_chain/configs/private-proxy-docker-compose.yml`
- 示例权限配置文件：`/chains/prividium_chain/configs/private-rpc-permissions.yaml`

### 启动 Proxy API

```bash
zkstack private-rpc run
```

Proxy API 现在应该运行在端口 `4041`。

## 配置访问权限

权限配置文件位于 `/chains/prividium_chain/configs/private-rpc-permissions.yaml`，可根据您希望终端用户拥有的访问权限进行编辑。

### 权限文件结构

权限文件包含三个部分：

#### 1. whitelisted_wallets（白名单钱包）

定义允许访问网络的钱包地址。

- 使用字符串 `all` 允许任何钱包访问
- 或定义允许的地址列表

#### 2. groups（组）

定义管理员地址的硬编码组。组由名称和成员地址列表组成。定义组后，可在 `contracts` 部分使用组名称授予整个组特定访问权限。

#### 3. contracts（合约）

定义特定合约及其函数的访问级别。如果合约未包含在此处，或函数未定义，则只能通过标准 RPC API 访问。

**注意**：合约只能通过标准 RPC API 部署。

### 定义方法

对于给定的合约地址，`methods` 字段定义可以调用的合约函数。使用函数签名来识别函数并为其定义规则。格式应与 [Solidity ABI](https://docs.soliditylang.org/en/latest/abi-spec.html) 中定义的规范签名相同。

要生成合约函数列表，可以使用 [abitype](https://abitype.dev/api/human#formatabiitem-1) 的 `formatAbiItem` 方法：

```typescript
import ABI_JSON from '../artifacts-zk/contracts/erc20/MyERC20Token.sol/MyERC20Token.json';
import { type AbiFunction, formatAbiItem } from 'abitype';

async function main() {
  const { abi } = ABI_JSON;
  abi.forEach((item) => {
    if (item.type === 'function') {
      const signature = formatAbiItem(item as AbiFunction);
      console.log(signature);
    }
  });
}
```

### 方法访问控制

对于每个函数，无论函数本身是否为纯函数，都可以定义 `read` 和 `write` 规则。

对于 `read` 或 `write` 部分中的每个规则，必须选择一个 `type`。开箱即用的类型包括：

- **public**：任何人都可以调用此函数
- **closed**：无人可以调用此函数（默认）
- **group**：只有指定的组可以调用
- **checkArgument**：指定的参数索引必须与函数调用者的地址匹配
- **oneOf**：允许定义多个规则类型，作为 `OR` 运算符；如果至少满足一个条件，则授予访问权限

此外，还应用了一个通用规则，用户只能看到其地址等于 `msg.sender` 的交易。

您可以通过编辑 `zksync-era/private-rpc/src/permissions/yaml-parser.ts` 文件来完全自定义类型及其访问逻辑。

### ERC-20 配置示例

将生成的访问配置替换为以下内容，并将 `<0xYOUR_CONTRACT_ADDRESS>` 替换为部署的 ERC-20 合约地址：

**注意**：`transfer` 和 `approve` 方法标记为 `public`，但这并不意味着任何人都可以看到这些交易的详细信息。这是因为对于这些方法，私有代理 RPC API 会验证当前用户是否等于交易中的 `msg.sender`。

要应用权限文件的更改，您需要重启 Proxy API。如果配置文件配置不正确，API 将无法启动。

## 与合约交互

### 交互脚本

在 `scripts` 文件夹中创建名为 `priv-interact.ts` 的新文件，该脚本将：

- 将部署者地址注册为用户
- 使用生成的用户令牌访问 Proxy RPC API
- 从部署者地址向另一个地址发送代币

**注意**：没有可用的方法来获取先前生成的令牌。如果您生成了用户令牌但忘记了，可以简单地生成新令牌。

在运行之前，使用 `RECIPIENT_ADDRESS` 和 `CONTRACT_ADDRESS` 更新 `.env` 文件：

- `CONTRACT_ADDRESS`：使用部署的 ERC20 合约地址
- `RECIPIENT_ADDRESS`：使用任何其他钱包地址（选择一个您也有私钥的地址）

运行交互脚本：

```bash
npx hardhat run ./scripts/priv-interact.ts
```

**注意**：用户将能够看到自己的余额，但看不到接收者钱包的余额。如果您尝试从不同的钱包（或没有钱包）访问余额，将看到 `Unauthorized` 错误。

### 检查余额

在 `scripts` 文件夹中创建名为 `check-balance.ts` 的新文件，该脚本用于检查默认钱包的 ERC20 余额。

要检查另一个地址的余额，您必须：
1. 为该地址注册用户令牌
2. 更新 `.env` 文件中的私钥
3. 运行 `check-balance` 脚本

在运行之前，使用上一步获得的 `USER_TOKEN` 更新 `.env` 文件。

运行脚本：

```bash
npx hardhat run ./scripts/check-balance.ts
```

## 设置区块浏览器

### 启动合约验证器

合约验证器用于检查合约源代码与部署的字节码。这将在浏览器中用于显示合约的源代码和 ABI。

在新终端中运行：

```bash
zkstack contract-verifier init \
  --zksolc-version v1.5.6 \
  --zkvyper-version v1.5.10 \
  --solc-version 0.8.24 \
  --era-vm-solc-version 0.8.28-1.0.2 \
  --vyper-version v0.4.1
```

这将下载验证浏览器上合约所需的二进制文件。

启动验证器：

```bash
zkstack contract-verifier run
```

完成后，验证器将在端口 `3070` 上运行。

### 初始化区块浏览器

在新终端中运行：

```bash
zkstack explorer init --prividium
```

可以在提示中选择默认选项。此命令创建数据库以存储浏览器数据，并在 `prividium_chain/configs/explorer-docker-compose.yml` 生成包含浏览器服务的 docker compose 文件。

### 启动浏览器后端

```bash
zkstack explorer backend
```

此命令使用先前创建的 docker compose 文件启动浏览器所需的服务。

### 启动浏览器前端

在新终端中运行：

```bash
zkstack explorer run
```

此命令将使用生态系统目录内 `apps/explorer.config.json` 文件中的配置启动 Docker 化的浏览器应用。如果需要，您可以编辑此文件来配置应用。

默认情况下，浏览器前端在 `http://127.0.0.1:3010` 启动，您可以在 `apps.yaml` 文件中配置端口。

### 切换到内部浏览器

要在面向公众的 Prividium 区块浏览器和用于内部使用的标准完全访问区块浏览器之间切换：

1. 停止浏览器前端
2. 停止浏览器后端
3. 运行 `zkstack explorer init` 并在提示使用 Prividium 浏览器时选择 `No`
4. 重启浏览器后端和前端服务

**注意**：目前使用 `zkstack` 无法同时运行两个版本的浏览器，但可以手动配置。

要切换回 Prividium 区块浏览器，请重新运行"设置区块浏览器"部分的步骤。

### 使用区块浏览器

要使用面向公众的 Prividium 区块浏览器，用户必须首先使用其钱包登录。然后，区块浏览器根据其帐户提供配置的访问级别。

## 重启链

如果在开发过程中需要停止并重启链，以下是完整的重启步骤。

要重启链和 RPC API，进入生态系统文件夹并：

1. 运行 `zkstack containers` 重启 L1 和 postgres Docker 容器。如果已删除容器，请重新执行初始生态系统设置步骤。
2. 运行 `zkstack server` 启动标准 RPC API。
3. 在新终端中，使用 `zkstack private-rpc run` 启动代理 RPC API。
4. 在新终端中，使用 `zkstack contract-verifier run` 启动合约验证器。
5. 在另一个终端中，使用 `zkstack explorer backend` 启动浏览器后端。
6. 在另一个终端中，使用 `zkstack explorer run` 启动浏览器前端。

## 后续步骤

要查看在 ZKsync Prividium 上运行的完整示例应用程序，请查看此[示例托管应用程序](https://github.com/JackHamer09/interop-escrow-double-zero/tree/single-chain-demo)。

---

## 常见问题

### 端口占用

如果遇到端口占用问题，请确保以下端口未被其他服务使用：
- 3050, 3070, 4041, 5432, 8545

### 权限配置错误

如果 Proxy API 无法启动，请检查权限配置文件的语法是否正确。

### 合约部署失败

确保您使用的是标准 RPC API（端口 3050）进行合约部署，而不是 Proxy RPC API（端口 4041）。

### 访问被拒绝

如果收到 `Unauthorized` 错误，请检查：
1. 用户令牌是否有效
2. 权限配置文件中是否正确配置了访问规则
3. 是否使用了正确的钱包地址