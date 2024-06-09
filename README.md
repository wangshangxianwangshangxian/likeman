# likeman
🦸likenman是一个钱包养号软件，把大量的智能合约方法调用集中起来，供每个号去使用，可以设置间隔时间自动调用智能合约，长期以往以达到养号的目的。

gas总费用 = gas used x effective gas
estimate gas  指的执行一个合约方法，它会触发gas计算的次数
effective gas 指的是平均gas费用，它由两部分组成：基础费用和小费（都是每单位的），所以有base fee 和 priority fee 两个字段，但前者是波动的，所有还有个最大单位gas费用。

## 🔧 安装


## 🦌 wallext.xlsx
### wallet

### config

### task

### chain表
该表的`network`列和`chain`列的内容来源于[ChainList](https://chainlist.org/)，
可配置相同的`network`和`chain`，其最终会按照`network`列分类成一个映射，假设表格内容如下：
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