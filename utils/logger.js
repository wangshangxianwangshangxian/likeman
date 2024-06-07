const MainData = require('../store/MainData')
const { get_time, join_path } = require('./utils')
const fs = require('fs')

const TYPE = {
  INFO   : '\x1b[37m%s\x1b[0m',
  SUCCESS: '\x1b[32m%s\x1b[0m',
  WARN   : '\x1b[33m%s\x1b[0m',
  ERROR  : '\x1b[31m%s\x1b[0m'
}

const info = (message, index = 3) => {
  const header_desc = get_header_desc(index)
  const footer_desc = get_footer_desc()
  const str         = header_desc + message + footer_desc
  console.log(TYPE.INFO, str)
  return str
}

const success = (message, index = 3) => {
  const header_desc = get_header_desc(index)
  const footer_desc = get_footer_desc()
  const str         = header_desc + message + footer_desc
  console.log(TYPE.SUCCESS, str)
  return str
}

const warn = (message, index = 3) => {
  const header_desc = get_header_desc(index)
  const footer_desc = get_footer_desc()
  const str         = header_desc + message + footer_desc
  console.log(TYPE.WARN, str)
  return str
}

const error = (message, index = 3, stack) => {
  const header_desc = get_header_desc(index, stack)
  const footer_desc = get_footer_desc()
  const str         = header_desc + message + footer_desc
  console.log(TYPE.ERROR, str)
  return str
}

const save_thread_log = (str, index = 3) => {
  const message = get_header_desc(index) + str + get_footer_desc()
  const file    = join_path(`result/${MainData.Ins().version}/thread.txt`)
  fs.writeFileSync(file, message, { flag: 'a+' })
}

const save_wallet_log = (wallet, str = '', index = 3, statck) => {
  const file    = join_path(`result/${MainData.Ins().version}/wallet/${wallet.address}.txt`)
  const message = get_header_desc(index, statck) + str + get_footer_desc()
  fs.writeFileSync(file, message, { flag: 'a+' })
}

const get_header_desc = (index = 3, _stack) => {
  const stack   = _stack || new Error().stack
  const message = stack.split('\n')[index]
  const start_f = message.indexOf('(') + 1
  const end_f   = message.lastIndexOf(')')
  const tips    = get_time() + '  ' + message.slice(start_f, end_f) + '\r\n'
  return tips
}

const get_footer_desc = () => {
  return '\r\n'
}

module.exports = {
  info,
  success,
  warn,
  error,
  save_thread_log,
  get_header_desc,
  save_wallet_log
}