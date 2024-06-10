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

module.exports = {
  ENV,
  TASK,
  THREAD
}