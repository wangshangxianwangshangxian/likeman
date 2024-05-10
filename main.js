const { actions, excuteTasks } = require("./tasks/tasks");
const { selectMenu } = require("./utils/client");

const main = async () => {
  const choice = await selectMenu(actions)
  excuteTasks(choice)
}

main()