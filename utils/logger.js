const MainData = require('../store/MainData')
const { get_time, join_path } = require('./utils')
const fs = require('fs')

const TYPE = {
  INFO   : '\x1b[37m%s\x1b[0m',
  SUCCESS: '\x1b[32m%s\x1b[0m',
  WARN   : '\x1b[33m%s\x1b[0m',
  ERROR  : '\x1b[31m%s\x1b[0m'
}

const info = (message, index) => {
  const header_desc = get_header_desc(index)
  const footer_desc = get_footer_desc()
  const str         = header_desc + message + footer_desc
  console.log(TYPE.INFO, str)
  return str
}

const success = (message, index) => {
  const header_desc = get_header_desc(index)
  const footer_desc = get_footer_desc()
  const str         = header_desc + message + footer_desc
  console.log(TYPE.SUCCESS, str)
  return str
}

const warn = (message, index) => {
  const header_desc = get_header_desc(index)
  const footer_desc = get_footer_desc()
  const str         = header_desc + message + footer_desc
  console.log(TYPE.WARN, str)
  return str
}

const error = (message, index) => {
  const header_desc = get_header_desc(index)
  const footer_desc = get_footer_desc()
  const str         = header_desc + message + footer_desc
  console.log(TYPE.ERROR, str)
  return str
}

const show_table_logger = (headers = [], table_data = [], type) => {
  const headers_length = []
  const gap = 2
  const gap_str = '  '
  headers.forEach(field => {
    try {
      const len = table_data.reduce((max, row) => row[field].length > max ? row[field].length : max, field.length)
      headers_length.push(len)
    }
    catch (e) {
      debugger
    }
  })

  let str  = ''
      str += headers   .map((h, index) => h  .padEnd(headers_length[index], ' ')).join(' '.padEnd(gap, ' ')) + '\n' // header
      str += headers   .map((h, index) => '-'.padEnd(headers_length[index], '-')).join('-'.padEnd(gap, '-')) + '\n' // split line
  
  // table content
  table_data.forEach(row => {
    headers.forEach((field, index) => {
      const col_width = headers_length[index]
      str += String(row[field]).padEnd(col_width, ' ') + gap_str
    })
    str += '\n'
  })
  const message = success(str, 4)
  const file = join_path(`result/${MainData.Ins().version}/thread.txt`)
  save_log(file, message + '\n')
}

const save_log = (file, str) => {
  fs.writeFileSync(file, str, { flag: 'a+' })
}

const get_header_desc = (index = 3) => {
  const stack   = new Error().stack
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
  show_table_logger,
  save_log
}