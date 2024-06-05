const MainData = require('./store/MainData')
const { start_exec } = require('./tasks/tasks')

const main = async () => {
  MainData.Ins()
  MainData.Ins().init_wallets()
  MainData.Ins().init_configs()
  MainData.Ins().init_tasks()
  MainData.Ins().init_threads()

  start_exec()
}

main()