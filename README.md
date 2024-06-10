# likeman
🦸likenman是一个钱包养号软件，把大量的智能合约方法调用集中起来，供每个号去使用，可以设置间隔时间自动调用智能合约，长期以往以达到养号的目的。

gas总费用 = gas used x effective gas
estimate gas  指的执行一个合约方法，它会触发gas计算的次数
effective gas 指的是平均gas费用，它由两部分组成：基础费用和小费（都是每单位的），所以有base fee 和 priority fee 两个字段，但前者是波动的，所有还有个最大单位gas费用。

## 🔧 跑起来！
### 安装
把项目克隆下来之后，首先执行下面这行代码
```
npm install
```
### 运行
通常情况下克隆下来的代码都会在测试环境先执行一遍，看看有没有问题，等测试充分了再切换到正式环境，接下来我介绍如何在**测试环境**中运行代码，你跟着跑了一遍之后，应该就知道如何切换到正式环境了。

首先执行下面代码，其实就是间接调用了`hardhat`的启动本地节点的命令, 可以查看`hardhat.config.js`配置文件做相关配置，当前默认是fork了以太网主网的分支来做测试环境。
```
npm run node
```
然后，在`main.js`文件中修改这一行代码，这里主要是控制当前要连接的链是本地测试还是外部环境。
```
MainData.Ins().init_env({ env: ENV.PROD }) // 原来的
MainData.Ins().init_env({ env: ENV.DEV  }) // 修改成这样
```
你可以使用命令行来执行脚本，但这不能更好的调试
```
npm run start
```
如果你在 vscode 的话，直接`F5`运行断点调试更好👍

## 🦌 wallext.xlsx
### wallet表
注意除了自己使用，不要随意暴露你的私钥！

### config表
excel表中的`desc`已详细说明，不再赘述，其中`mode`字段目前固定为1，因为其他模式还未实现。

### task表
| 字段  | 描述 |
| ---- | --- |
| id      | 不重复即可|
| desc    | 描述 |
| func    | 不可更改，与代码中的调用方法一致 |
| exec    | 该任务是否在程序中执行，1执行/其他任意值不执行 |
| network | 该任务要在哪个网络执行，值要与`chain`表的`network`列保持一致 |
| chain   | 指定该任务在哪个节点执行，默认不填，不填则会在`chain`表形成的映射中基于上面的`network`值随机选一个 |

### chain表
该表的`network`列和`chain`列的内容来源于[ChainList](https://chainlist.org/)，可配置相同的`network`和`chain`，其最终会按照`network`分类成一个映射，假设表格内容如下：
| network          | chain                    |
| ---------------- | ------------------------ |
| Ethereum Mainnet | https://eth.llamarpc.com |
| Ethereum Mainnet | https://eth.merkle.io	  |
| Linea            | https://rpc.linea.build  |

最终的映射会变成：
```
const chain_list = {
  'Ethereum Mainnet': ['https://eth.llamarpc.com', 'https://eth.merkle.io'],
  'Linea'           : ['https://rpc.linea.build']
}
```

## 🧑‍🌾 聊点项目思想
1. 输出日志这个行为，基本上是在某个通用方法内执行的，如`MainData.Ins().set_task_info`会输出任务相关的日志。这样做的好处是使得数据发生变更时更容易被追踪，因为数据的修改都是通过调用方法来实现的，决不允许出现直接修改数据的情况，所以统一在通用方法中输出日志。