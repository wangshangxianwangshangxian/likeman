const path = require('path')
const fs   = require('fs')
const xlsx = require('xlsx')

const get_time = (time_stamp = Date.now(), format = 'YYYY-MM-DD hh:mm:ss.ms') => {
  const d       = new Date(time_stamp)
  const year    = String(d.getFullYear())    .padStart(4, '0')
  const month   = String(d.getMonth() + 1)   .padStart(2, '0')
  const date    = String(d.getDate())        .padStart(2, '0')
  const hours   = String(d.getHours())       .padStart(2, '0')
  const minutes = String(d.getMinutes())     .padStart(2, '0')
  const seconds = String(d.getSeconds())     .padStart(2, '0')
  const millsec = String(d.getMilliseconds()).padEnd(3, '0')

  const date_str = format.replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', date)
    .replace('hh', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
    .replace('ms', millsec)
  return date_str
}

const get_root = () => {
  const root = process.cwd()
  return root
}

const join_path = path => {
  const root = get_root()
  return root + '/' + path
}

const get_xlsx = () => {
  const wallet_xlsx_path       = join_path('config/wallet.xlsx')
  const { SheetNames, Sheets } = xlsx.readFile(wallet_xlsx_path)
  const info   = {}
  SheetNames.forEach(s => {
    const w    = Sheets[s]
    const json = xlsx.utils.sheet_to_json(w)
    info[s]    = json
  })
 return info
}

const excute_javascript = () => {
  Array.prototype.__current_index = -1

  Array.prototype.get_current_index = function () {
    return this.__current_index
  }
  
  Array.prototype.get_next = function (loop = false) {
    this.__current_index++
    if (this.__current_index >= this.length) {
      if (loop) {
        this.__current_index = 0
      }
      else {
        this.__current_index = this.length
        return null
      }
    }

    return this[this.__current_index]
  }
}

// 一般是给 web3.utils.toWei 方法作为入参，它优先接收字符串，如果传number，仍然会转成字符串，会有精度丢失问题。
const get_value_from_to = (from, to, decimal = 0, return_num = false) => {
  from          = Number(from)
  to            = Number(to)
  let r         = Math.random() * (to - from) + from
  const num_str = r.toFixed(decimal)
  if (return_num)
    return Number(num_str)
  return num_str
}

const create_version_folder = (version) => {
  const version_folder = join_path(`result/${version}`)
  if (!fs.existsSync(version_folder)) {
    fs.mkdirSync(version_folder)
  }

  const wallet_folder = join_path(`result/${version}/wallet`)
  if (!fs.existsSync(wallet_folder)) {
    fs.mkdirSync(wallet_folder)
  }
}

const show_table_str = (headers = [], table_data = []) => {
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

  return str
}

module.exports = {
  get_time,
  get_root,
  join_path,
  get_xlsx,
  excute_javascript,
  get_value_from_to,
  create_version_folder,
  show_table_str
}