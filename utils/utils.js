const xlsx = require('xlsx')

const get_time = (time_stamp = Date.now(), format = 'YYYY-MM-DD hh:mm:ss') => {
  const d       = new Date(time_stamp)
  const year    = String(d.getFullYear()) .padStart(4, '0')
  const month   = String(d.getMonth() + 1).padStart(2, '0')
  const date    = String(d.getDate())     .padStart(2, '0')
  const hours   = String(d.getHours())    .padStart(2, '0')
  const minutes = String(d.getMinutes())  .padStart(2, '0')
  const seconds = String(d.getSeconds())  .padStart(2, '0')

  const date_str = format.replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', date)
    .replace('hh', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
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

module.exports = {
  get_time,
  get_root,
  join_path,
  get_xlsx
}