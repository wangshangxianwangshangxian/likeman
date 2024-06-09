const MainData = require("../store/MainData")
const logger = require("../utils/logger")
const { excute_javascript, get_time, show_table_str } = require("../utils/utils")
excute_javascript()

const task_list = {
  test             : require("./test"),
  demo             : require("./demo"),
  ens              : require("./ens"),
  snapshot_delegate: require("./snapshot_delegate")
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
      fail    : t.wallet?.tasks.filter(t => t.status === 'fail').length || '0',
      total   : t.wallet?.tasks.length || ''
    }
    return info
  })

  const str = show_table_str(headers, table_data)
  logger.success(str)
  logger.save_thread_log(str)
}

const show_wallet_table = (thread, task) => {
  const headers    = ['task', 'status', 'start_time', 'end_time']
  const table_data = [{
    task      : task.id,
    status    : task.status,
    start_time: task.start_time,
    end_time  : task.end_time,
  }]
  const str = show_table_str(headers, table_data)
  logger.save_wallet_log(thread.wallet, str)
}

const exec_tasks = async thread => {
  const { tasks } = thread.wallet
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    MainData.Ins().work_thread(thread.thread)
    MainData.Ins().set_task_info(thread.wallet.address, task.id, { start_time: get_time(), status: 'work' })
    show_table()
    show_wallet_table(thread, task)
    try {
      const result = await task_list[task.func](thread.wallet, { chain: task.chain})
      let status = 'success'
      if (result.code !== 0) {
        logger.error(result.message)
        status = 'fail'
      }
      MainData.Ins().set_task_info(thread.wallet.address, task.id, { end_time: get_time(), status })
      logger.save_wallet_log(thread.wallet, JSON.stringify(result) + '\n')
    }
    catch(e) {
      console.error(e)
      logger.save_wallet_log(thread.wallet, e.message + '\n', 1, e.stack)
      MainData.Ins().set_task_info(thread.wallet.address, task.id, { end_time: get_time(), status: 'fail' })
    }
    show_wallet_table(thread, task)
    const delay = MainData.Ins().sleep_thread(thread.thread)
    show_table()
    await new Promise(succ => setTimeout(succ, delay * 1000))
  }
  MainData.Ins().wait_thread(thread.thread)
  show_table()
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
        show_table()
        break
      }

      threads.forEach(t => {
        if (t.status === 'wait') {
          const wallet = wallets.get_next()
          if (!wallet) {
            MainData.Ins().end_thread(t.thread)
            show_table()
            return
          }

          MainData.Ins().pending_thread(t.thread, wallet.address)
          show_table()
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
  // const timer = setInterval(show_table, 1000)
  await exec_threads()
  // clearInterval(timer)
  process.exit()
}

module.exports = {
  start_exec
}