const logger = require("../utils/logger")

module.exports = async wallet => {
  logger.info(`${wallet.address} Ready to exec test task`)
  await new Promise(succ => setTimeout(succ, 1000))

  logger.success(`${wallet.address} test task ok!`)
}