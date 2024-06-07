const { Web3 } = require('web3')
const abi      = require('../abi/0x253553366Da8546fC250F225fe3d25d0C782303b.json')
const crypto   = require('crypto')

module.exports = async wallet => {
  const resp = {
    code   : 0,
    message: null,
    data   : null
  }

  // base
  const web3              = new Web3('https://eth.llamarpc.com')
  const contract_address  = '0x253553366Da8546fC250F225fe3d25d0C782303b'
  const contract          = new web3.eth.Contract(abi, contract_address)
  const account           = wallet.address
  const private_key       = wallet.private_key
  
  // params
  const name           = 'tao-wa.eth'
  const owner          = account
  const duration       = 365
  const secret         = '0x' + crypto.randomBytes(32).toString('hex')
  const resolver       = accountj
  const data           = []
  const reverse_record = false
  const fuses          = 0

  // exec
  const commitment   = await contract.methods.makeCommitment(name, owner, duration, secret, resolver, data, reverse_record, fuses).call()
  const abi_data     = contract.methods.commit(commitment).encodeABI()
  
  const base_gas     = BigInt(await web3.eth.getGasPrice())
  const max_pri_gas  = base_gas + BigInt(base_gas)
  const max_gas      = max_pri_gas + BigInt(base_gas)
  const estimate_gas = await web3.eth.estimateGas({ from: account, to: contract_address, data: abi_data })
  
  const transaction = {
    from                : account,
    to                  : contract_address,
    data                : abi_data,
    gas                 : '0x' + estimate_gas.toString(16),
    maxPriorityFeePerGas: '0x' + max_gas.toString(16),
    maxFeePerGas        : '0x' + max_pri_gas.toString(16),
    maxFeePerGas        : '0x' + max_gas.toString(16)
  }
  debugger
  // const signed_tx = await web3.eth.accounts.signTransaction(transaction, private_key)
  // const receipt   = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction)
  return resp
}