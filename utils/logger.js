const { get_time } = require('./utils')

const TYPE = {
  INFO   : '\x1b[37m%s\x1b[0m',
  SUCCESS: '\x1b[32m%s\x1b[0m',
  WARN   : '\x1b[33m%s\x1b[0m',
  ERROR  : '\x1b[31m%s\x1b[0m'
}

const info = message => {
  const header_desc = getHeaderDesc()
  const footer_desc = getFooterDesc()
  console.log(TYPE.INFO, header_desc + message + footer_desc)
}

const success = message => {
  const header_desc = getHeaderDesc()
  const footer_desc = getFooterDesc()
  console.log(TYPE.SUCCESS, header_desc + message + footer_desc)
}

const warn = message => {
  const header_desc = getHeaderDesc()
  const footer_desc = getFooterDesc()
  console.log(TYPE.WARN, header_desc + message + footer_desc)
}

const error = message => {
  const header_desc = getHeaderDesc()
  const footer_desc = getFooterDesc()
  console.log(TYPE.ERROR, header_desc + message + footer_desc)
}

const getHeaderDesc = () => {
  const stack = new Error().stack
  const tips = get_time() + ' | ' + stack.split('\n')[3].trim() + '\r\n'
  return tips
}

const getFooterDesc = () => {
  return '\r\n'
}

module.exports = {
  info,
  success,
  warn,
  error
}