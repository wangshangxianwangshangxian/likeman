const ethers = require("ethers")
const logger = require("../utils/logger")

module.exports = async ({ address, private_key }) => {
  logger.info(`${address} ready to exec sign genesis proof`)
  const provider    = new ethers.JsonRpcProvider('https://rpc.linea.build')
  
  const wallet      = new ethers.Wallet(private_key, provider)
  const transaction = await wallet.sendTransaction({
    to: '0x6cd20be8914a9be48f2a35e56354490b80522856',
    data: '0xb9a2092d'
  })
  
  logger.info(`${address} wait for result of sign genesis proof`)
  const tx = await transaction.wait()

  logger.success(`${address} sign successful!`)
}