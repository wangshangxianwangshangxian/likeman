const inquirer = require('inquirer')

const selectMenu = async (choices = []) => {
  const message = 'please select a choice'
  const questions = [{ type: 'list', name: 'choice', message, choices }]
  const answers = await inquirer.prompt(questions)
  const choice = answers.choice
  return choice
}

const enterPassword = async (message = 'please input password') => {
  const { password } = await inquirer.prompt([{
    type: 'password',
    name: 'password',
    message,
    validate: value => {
      if (value.length < 1) {
        return 'password must be at least 1 chars long'
      }
      return true
    }
  }])
  return password
}

module.exports = {
  selectMenu,
  enterPassword
}