const MainData = require("../store/MainData")
const { TASK } = require("../store/constant")
const logger = require("../utils/logger")
const { excute_javascript, get_time, show_table_str } = require("../utils/utils")
excute_javascript()

const task_list = {
  test             : require("./test"),
  demo             : require("./demo"),
  ens              : require("./ens"),
  snapshot_delegate: require("./snapshot_delegate"),
  approve          : require("./approve")
}

// 打印线程信息
const show_table = () => {
  const wallets = MainData.Ins().wallets
  const headers = ['address', 'current_task_id', 'success', 'fail', 'total']
  const table_data = wallets.map(w => {
    const info = {
      address         : w.address || '',
      current_task_id : w.tasks.find(t => t.status === TASK.WORK)?.id || 'null',
      success         : w.tasks.filter(t => t.status === TASK.SUCCESS).length || '0',
      fail            : w.tasks.filter(t => t.status === TASK.FAIL).length || '0',
      total           : w.tasks.length || ''
    }
    return info
  })

  const str = show_table_str(headers, table_data)
  logger.success(str)
  logger.save_thread_log(str)
}

const exec_tasks = async thread => {
  const { tasks } = thread.wallet
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    MainData.Ins().work_thread(thread.thread)
    MainData.Ins().set_task_info(thread.wallet.address, task.id, { start_time: get_time(), status: TASK.WORK })
    show_table()
    try {
      const chain = MainData.Ins().is_prod ? task.chain : MainData.Ins().localhost
      await task_list[task.func](thread.wallet, { chain })
      MainData.Ins().set_task_info(thread.wallet.address, task.id, { end_time: get_time(), status: TASK.SUCCESS })
    }
    catch(e) {
      MainData.Ins().set_task_info(thread.wallet.address, task.id, { end_time: get_time(), status: TASK.FAIL, message: e.stack })
    }
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
  await exec_threads()
  process.exit()
}

module.exports = {
  start_exec
}