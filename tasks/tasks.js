const { getAllWalletsData } = require("../utils/utils")
const encryptWallet = require("./encryptWallet")
const logger = require("../utils/logger")
const { enterPassword } = require("../utils/client")
const signGenesisProof = require("./signGenesisProof")

const taskEncryptWallet = async () => {
  await encryptWallet()
}

const taskSignGenesisProof = async () => {
  const wallets = await getEncryptData()
  await signGenesisProof(wallets[0].address, wallets[0].private_key)
}

const getEncryptData = async () => {
  const password = await enterPassword()
  const data = getAllWalletsData(password)
  if (data === '') {
    logger.error('An error occurred during the decryption of the file. Please check if the file exists or if the password is correct')
    process.exit()
  }

  return data
}

const excuteTasks = async (choice) => {
  const target = actions.find(t => t.value === choice)
  if (!target) {
    throw new Error('The selected operation does not exist')
  }
  target['callback']()
}

const actions = [
  { value: 'encrypt', name: 'encrypt wallet\n', callback: taskEncryptWallet },

  { value: 'sign_genesis_proof', name: 'sign genesis proof', callback: taskSignGenesisProof }
]

module.exports = {
  actions,
  excuteTasks
}