const { execWallets } = require("./tasks/tasks")
const { configtasks, configwallets } = require("./utils/utils")

const main = async () => {
  const wallets = configwallets
  const tasks = configtasks.map(task => {
    return {
      id: task.id,
      fn: task.fn,
      params: []
    }
  })
  execWallets(wallets, tasks)
}

main()