const MainData = require("../store/MainData")
const logger = require("../utils/logger")
const { excute_javascript, get_time, save_log } = require("../utils/utils")
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
  const headers = ['thread', 'status', 'deadline', 'address', 'current', 'success', 'fail', 'total']
  const table_data = threads.map(t => {
    const info = {
      thread  : t.thread,
      status  : t.status,
      deadline: t.deadline,
      address : t.wallet?.address || '',
      current : t.wallet?.tasks.find(t => t.status === 'work')?.id || '',
      success : t.wallet?.tasks.filter(t => t.status === 'success').length || '0',
      fail    : t.wallet?.tasks.filter(t => t.status === 'end').length || '0',
      total   : t.wallet?.tasks.length || ''
    }
    return info
  })
  logger.show_table_logger(headers, table_data)
}
const timer   = setInterval(show_table, 1000)

const exec_tasks = async thread => {
  const { tasks } = thread.wallet
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    MainData.Ins().work_thread(thread.thread)
    MainData.Ins().set_task_info(thread.wallet.address, task.id, { start_time: get_time(), status: 'work' })
    try {
      const result = await task_list[task.func](thread.wallet)
    }
    catch(e) {
      // do something
    }
    MainData.Ins().set_task_info(thread.wallet.address, task.id, { end_time: get_time(), status: 'success' })
    const delay = MainData.Ins().sleep_thread(thread.thread)
    await new Promise(succ => setTimeout(succ, delay * 1000))
  }
  MainData.Ins().wait_thread(thread.thread)
}

const exec_threads = async () => {
  return new Promise(async succ => {
    const resp = {
      code   : 0,
      message: null,
      data   : null
    }

    const threads = MainData.Ins().threads
    const wallets = MainData.Ins().wallets

    while(1) {
      // 所有线程都停工，则视为所有账号结束
      if (threads.every(t => t.status === 'end')) {
        break
      }

      threads.forEach(t => {
        if (t.status === 'wait') {
          const wallet = wallets.get_next()
          if (!wallet) {
            MainData.Ins().end_thread(t.thread)
            return
          }

          MainData.Ins().pending_thread(t.thread, wallet.address)
        }
        else if (t.status === 'pending') {
          const d = new Date(t.deadline)
          if (Date.now() < d.getTime()) {
            return
          }

          exec_tasks(t)
        }
      })

      await new Promise(resolve => setTimeout(resolve, 10))
    }
    succ(resp)
  })
}

const start_exec = async () => {
  await exec_threads()
  clearInterval(timer)
  process.exit()
}

module.exports = {
  start_exec
}