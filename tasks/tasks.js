const { getAllWalletsData, extendJavaScript, getConfig, getValueFromTo } = require("../utils/utils")
const encryptWallet = require("./encryptWallet")
const logger = require("../utils/logger")
const { enterPassword } = require("../utils/client")
const signGenesisProof = require("./signGenesisProof")
const pipeline = require('async')
const test = require("./test")

extendJavaScript()

const taskEncryptWallet = async () => {
  await encryptWallet()
}

const taskSignGenesisProof = async () => {
  const wallets = await getEncryptData()
  const tmp = new Array(3).fill(JSON.parse(JSON.stringify(wallets[0])))
  // await signGenesisProof(wallets[0].address, wallets[0].private_key)

  const tasks = [
    {
      fn: signGenesisProof,
      params: []
    },
    {
      fn: test,
      params: []
    }
  ]

  await excuteTasksWithInterval(tmp, tasks)
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

const excuteTasksWithInterval = async (wallets, tasks) => {
  return new Promise(async succ => {
    const config = getConfig()

    const pushOrKill = (queue, succ) => {
      const wallet = wallets.getNext()
      if (wallet) {
        queue.push(wallet)
      }
      else {
        queue.kill()
        succ(true)
      }
    }

    const worker = async () => {
      return new Promise(succ => {
        const queue = pipeline.queue(async wallet => {
          for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i]
            try {
              await task.fn(wallet, ...task.params)
            }
            catch(e) {
              logger.error(e)
            }
            const delay = getValueFromTo(config.task.TASK_SLEEP_FROM, config.task.TASK_SLEEP_TO)
            logger.info(`Starting a new task, delay ${delay}s`)
            await new Promise(resolve => setTimeout(resolve, delay * 1000))
          }
          pushOrKill(queue, succ)
        }, 1)
        pushOrKill(queue, succ)
      })
    }

    const workers = []
    for (let i = 0; i < Number(config.task.THREAD); i++) {
      const w = worker()
      workers.push(w)
      const delay = getValueFromTo(config.task.THREAD_SLEEP_FROM, config.task.THREAD_SLEEP_TO)
      logger.info(`Starting a new thread, delay ${delay}s`)
      await new Promise(resolve => setTimeout(resolve, delay * 1000))
    }
    Promise.all(workers).then(resps => {
      debugger
    })
  })
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