# likeman
🦸likenman是一个钱包养号软件，把大量的智能合约方法调用集中起来，供每个号去使用，可以设置间隔时间自动调用智能合约，长期以往以达到养号的目的。

gas总费用 = gas used x effective gas
estimate gas  指的执行一个合约方法，它会触发gas计算的次数
effective gas 指的是平均gas费用，它由两部分组成：基础费用和小费（都是每单位的），所以有base fee 和 priority fee 两个字段，但前者是波动的，所有还有个最大单位gas费用。

## 🔧 安装


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