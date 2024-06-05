const { get_time } = require('./utils')

const TYPE = {
  INFO   : '\x1b[37m%s\x1b[0m',
  SUCCESS: '\x1b[32m%s\x1b[0m',
  WARN   : '\x1b[33m%s\x1b[0m',
  ERROR  : '\x1b[31m%s\x1b[0m'
}

const info = message => {
  const header_desc = get_header_desc()
  const footer_desc = get_footer_desc()
  console.log(TYPE.INFO, header_desc + message + footer_desc)
}

const success = message => {
  const header_desc = get_header_desc()
  const footer_desc = get_footer_desc()
  console.log(TYPE.SUCCESS, header_desc + message + footer_desc)
}

const warn = message => {
  const header_desc = get_header_desc()
  const footer_desc = get_footer_desc()
  console.log(TYPE.WARN, header_desc + message + footer_desc)
}

const error = message => {
  const header_desc = get_header_desc()
  const footer_desc = get_footer_desc()
  console.log(TYPE.ERROR, header_desc + message + footer_desc)
}

const show_table_logger = (headers = [], table_data = [], type) => {
  const headers_length = []
  const gap = 2
  const gap_str = '  '
  headers.forEach(field => {
    const len = table_data.reduce((max, row) => row[field].length > max ? row[field].length : max, field.length)
    headers_length.push(len)
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
  success(str)

}

const get_header_desc = () => {
  const stack = new Error().stack
  const tips = get_time() + ' | ' + stack.split('\n')[3].trim() + '\r\n'
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
  show_table_logger
}