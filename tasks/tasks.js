const { extendJavaScript, getValueFromTo, configconfig } = require("../utils/utils")
const logger = require("../utils/logger")
const signGenesisProof = require("./signGenesisProof")
const test = require("./test")

extendJavaScript()

const fn_list = {
  test: test,
  signGenesisProof: signGenesisProof
}

// Single wallet excutes all tasks
const execTasks = (wallet, tasks) => {
  return new Promise(async succ => {
    const r = {
      code: 0,
      message: null,
      data: []
    }

    const config = configconfig
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const result = await fn_list[task.fn](wallet, ...task.params)
      r.data.push(result)

      if (i < task.length - 1) {
        const delay = getValueFromTo(config.task_sleep_from, config.task_sleep_to)
        logger.warn(`${wallet.address} ready to excutes next task, delay ${delay}s`)
        await new Promise(resolve => setTimeout(resolve, delay * 1000))
      }
    }

    logger.info(`${wallet.address} all tasks have excuted!`)

    succ(r)
  })
}

// Total wallets excute tasks
const execWallets = (wallets, tasks) => {
  return new Promise(async succ => {
    const r = {
      code: 0,
      message: null,
      data: []
    }

    let wallet = wallets.getNext()
    let curr_thread = 0
    let last_thread_start_time = Date.now()
    const config = configconfig
    while (wallet) {
      if (curr_thread >= configconfig.thread) {
        await new Promise(resolve => setTimeout(resolve, 10))
        continue
      }

      curr_thread++
      new Promise(async resolve => {
        const result = await execTasks(wallet, tasks)
        curr_thread--
        resolve(result)
      })

      wallet = wallets.getNext()
      if (!wallet) {
        break
      }

      const delay = getValueFromTo(config.thread_sleep_from, config.thread_sleep_to)
      logger.warn(`${wallet.address} the next wallet start excute after ${delay}s`)
      await new Promise(resolve => setTimeout(resolve, delay * 1000))
    }

    while(curr_thread > 0) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    succ(r)
  })
}

module.exports = {
  execWallets
}