const ENV = {
  DEV : 'dev',
  PROD: 'prod'
}

const TASK = {
  WAIT   : 'wait',
  WORK   : 'work',
  SUCCESS: 'success',
  FAIL   : 'fail'
}

const THREAD = {
  WORK   : 'work',
  PENDING: 'pending',
  SLEEP  : 'sleep',
  WAIT   : 'wait',
  END    : 'end'
}

const TASK_MODE = {
  ORDER : 1,
  RANDOM: 2
}

module.exports = {
  ENV,
  TASK,
  THREAD,
  TASK_MODE
}