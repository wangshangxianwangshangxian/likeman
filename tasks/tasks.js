const encryptWallet = require("./encryptWallet")

const taskEncryptWallet = async () => {
  await encryptWallet()
}

const excuteTasks = async (choice) => {
  const target = actions.find(t => t.value === choice)
  if (!target) {
    throw new Error('The selected operation does not exist')
  }
  target['callback']()
}

const actions = [
  { value: 'encrypt', name: 'encrypt wallet', callback: taskEncryptWallet }
]

module.exports = {
  actions,
  excuteTasks
}