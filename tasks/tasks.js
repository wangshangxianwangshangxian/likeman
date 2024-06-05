const MainData = require("../store/MainData")
const logger = require("../utils/logger")
const { excute_javascript, get_value_from_to } = require("../utils/utils")
const test = require("./test")
const demo = require("./demo")

excute_javascript()

const task_list = {
  test: test,
  demo: demo
}

// 打印线程信息
const show_table = () => {
  const threads = MainData.Ins().threads
  const headers = ['thread', 'status', 'address']
  const table_data = threads.map(t => {
    const info = {
      thread: t.thread,
      status: t.status,
      address: t.wallet?.address || ''
    }
    return info
  })
  logger.show_table_logger(headers, table_data)
}

const exec_tasks = async thread => {
  MainData.Ins().work_thread(thread.thread)
  const { tasks } = thread.wallet
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    try {
      const result = await task_list[task.func](thread.wallet)
    }
    // 发生异常，执行下一个任务
    catch(e) {
      continue
    }
  }
  const delay = Math.ceil(Math.random() * 5)
  await new Promise(resolve => setTimeout(resolve, delay * 1000))
  MainData.Ins().wait_thread(thread.thread)
}

const exec_threads = async () => {
  return new Promise(async succ => {
    const resp = {
      code   : 0,
      message: null,
      data   : null
    }

    const { thread_sleep_from, thread_sleep_to } = MainData.Ins().configs
    const threads = MainData.Ins().threads
    const timer   = setInterval(show_table, 1000)
    const wallets = MainData.Ins().wallets
    while(1) {
      const t = threads.find(t => t.status === 'wait')
      if (!t) {
        await new Promise(resolve => setTimeout(resolve, 10))
        continue
      }

      const wallet = wallets.get_next()
      if (wallet) {
        const delay = get_value_from_to(thread_sleep_from, thread_sleep_to, 2)
        MainData.Ins().pending_thread(t.thread, wallet.address, delay)
        await new Promise(resolve => setTimeout(resolve, delay * 1000))
        exec_tasks(t)
        continue
      }

      // 有空闲线程，但没有未执行钱包了，说明当前还有钱包在线程中，如果全部线程为wait，则为执行完毕
      const flag = threads.every(t => t.status === 'wait')
      if (flag) {
        show_table()
        clearInterval(timer)
        break
      }
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    succ(resp)
  })
}

const start_exec = async () => {
  await exec_threads()
  process.exit()
}

module.exports = {
  start_exec
}