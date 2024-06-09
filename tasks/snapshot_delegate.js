const { Web3 } = require('web3')
const MainData = require("../store/MainData")
const { get_value_from_to } = require('../utils/utils')
const task_config = require('../config/snapshot_delegate.json')

const get_delegate_info = () => {
  const arrs                = task_config.list
  const { zoom, delegates } = arrs     [Math.floor(Math.random() * arrs.length)]
  const delegate            = delegates[Math.floor(Math.random() * delegates.length)]
  return [zoom, delegate]
}

module.exports = async (wallet, { chain }) => {
  const resp = {
    code   : 0,
    message: null,
    data   : null
  }

  const configs           = MainData.Ins().configs
  const web3              = new Web3(chain)
  const contract_address  = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446'
  const account           = wallet.address
  const private_key       = wallet.private_key
  
  const [zoom, delegate] = get_delegate_info()
  const func             = '0xbd86e508'
  const zoom_id          = web3.utils.asciiToHex(zoom).slice(2).padEnd(64, '0')
  const delegate_address = delegate.slice(2).padStart(64, '0')
  const abi_data         = func + zoom_id + delegate_address
  
  const balance      = Number(await web3.eth.getBalance(account))
  const estimate_gas = Number(await web3.eth.estimateGas({ from: account, to: contract_address, data: abi_data }))
  const base_gas     = Number(await web3.eth.getGasPrice())
  
  const priority_gas = Number(web3.utils.toWei(get_value_from_to(configs.max_priority_fee_per_gas_from, configs.max_priority_fee_per_gas_to), 'gwei'))
  const max_eff_gas  = Number(web3.utils.toWei(get_value_from_to(configs.max_fee_per_gas_from, configs.max_fee_per_gas_to), 'gwei'))
  const effect_gas   = Number(base_gas) + Number(priority_gas)
  const total_gas    = Number(estimate_gas) * Number(effect_gas)
  
  if (effect_gas > max_eff_gas) {
    resp.code    = 1
    resp.message = '单位费用高于设置的费用范围'
    resp.data    = { base_gas, priority_gas, max_eff_gas }
    return resp
  }
  
  if (total_gas > Number(balance)) {
    resp.code    = 2
    resp.message = 'gas预估总费用用大于余额'
    resp.data    = { base_gas, priority_gas, max_eff_gas }
    return resp
  }
  
  const transaction = {
    from                : account,
    to                  : contract_address,
    data                : abi_data,
    gas                 : web3.utils.toHex(estimate_gas),
    maxPriorityFeePerGas: web3.utils.toHex(priority_gas),
    maxFeePerGas        : web3.utils.toHex(max_eff_gas),
  }
  const signed_tx = await web3.eth.accounts.signTransaction(transaction, private_key)
  const receipt   = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
  if (Number(receipt.status) !== 1) {
    resp.code    = 101
    resp.message = '请求已发出，但结果不正常'
    resp.data    = receipt
    return resp
  }
  return resp
}