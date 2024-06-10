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
  WORK : 'work',
  SLEEP: 'sleep',
  WAIT : 'wait'
}

module.exports = {
  ENV,
  TASK,
  THREAD
}