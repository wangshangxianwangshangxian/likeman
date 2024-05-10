const logger = require("../utils/logger")

module.exports = async wallet => {
  logger.info(`Ready to exec test task`)
  await new Promise(succ => setTimeout(succ, 1000))

  logger.success(`test task ok!`)
}