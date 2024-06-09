const MainData = require('./store/MainData')
const { start_exec } = require('./tasks/tasks')
const { create_version_folder, get_time } = require('./utils/utils')

const main = async () => {
  const version = get_time(Date.now(), 'YYYY_MM_DD_hh_mm_ss')
  create_version_folder(version)

  MainData.Ins()
  MainData.Ins().init_version(version)
  MainData.Ins().init_wallets()
  MainData.Ins().init_configs()
  MainData.Ins().init_chain_list()
  MainData.Ins().init_tasks()
  MainData.Ins().init_threads()


  start_exec()
}

main()