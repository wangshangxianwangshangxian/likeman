const MainData = require('./store/MainData')
const { get_xlsx } = require('./utils/utils')

const main = async () => {
  MainData.Ins()
  MainData.Ins().init_wallets()
  MainData.Ins().init_configs()
}

main()