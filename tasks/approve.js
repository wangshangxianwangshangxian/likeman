const { Web3 }    = require('web3')
const abi         = require('../abi/ERC-20.json')
const task_config = require('../config/approve.json')
const MainData    = require("../store/MainData")
const { get_value_from_to } = require('../utils/utils')

const get_token_address_random = () => {
  const { tokens } = task_config
  const r          = Math.floor(Math.random() * tokens.length)
  return tokens[r]
}

module.exports = async (wallet, { chain }) => {
  const resp = {
    code   : 0,
    message: null,
    data   : null
  }

  const web3              = new Web3(chain)
  const contract_address  = get_token_address_random()
  const contract          = new web3.eth.Contract(abi, contract_address)
  
  const spender = wallet.address
  const _value  = get_value_from_to(task_config.value_from, task_config.value_to, 9)
  const value   = web3.utils.toWei(_value, 'ether')

  const abi_data     = contract.methods.approve(spender, value).encodeABI()
  
  const result = await MainData.Ins().send_signed_transaction(wallet, contract_address, abi_data, web3)
  return resp
}
