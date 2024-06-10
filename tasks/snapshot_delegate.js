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

  const web3              = new Web3(chain)
  const contract_address  = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446'
  
  const [zoom, delegate] = get_delegate_info()
  const func             = '0xbd86e508'
  const zoom_id          = web3.utils.asciiToHex(zoom).slice(2).padEnd(64, '0')
  const delegate_address = delegate.slice(2).padStart(64, '0')
  const abi_data         = func + zoom_id + delegate_address

  const result = await MainData.Ins().send_signed_transaction(wallet, contract_address, abi_data, web3)
  return resp
}