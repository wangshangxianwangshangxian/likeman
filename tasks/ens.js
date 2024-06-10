const { Web3 } = require('web3')
const abi      = require('../abi/0x253553366Da8546fC250F225fe3d25d0C782303b.json')
const crypto   = require('crypto')
const MainData = require("../store/MainData")

module.exports = async (wallet, { chain }) => {
  const web3              = new Web3(chain)
  const contract_address  = '0x253553366Da8546fC250F225fe3d25d0C782303b'
  
  const name           = 'tao-wa.eth'
  const owner          = wallet.address
  const duration       = 365
  const secret         = '0x' + crypto.randomBytes(32).toString('hex')
  const resolver       = wallet.address
  const data           = []
  const reverse_record = false
  const fuses          = 0
  const contract       = new web3.eth.Contract(abi, contract_address)
  const commitment     = await contract.methods.makeCommitment(name, owner, duration, secret, resolver, data, reverse_record, fuses).call()
  const abi_data       = contract.methods.commit(commitment).encodeABI()

  await MainData.Ins().send_signed_transaction(wallet, contract_address, abi_data, web3)
}