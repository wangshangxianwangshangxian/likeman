const fs = require('fs')
const ini = require('ini')
const { getConfigPath } = require('./pathLoad')
const { decrypt } = require('./encrypt')

const getTime = (time_stamp = Date.now(), format = 'YYYY-MM-DD hh:mm:ss') => {
  const d = new Date(time_stamp)
  const year = String(d.getFullYear()).padStart(4, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  const date_str = format.replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', date)
    .replace('hh', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
  return date_str
}

const getAllWalletsData = password => {
  const encrypt_data_path = getConfigPath('encrypted_data.txt')
  const encrypt_data_txt = fs.readFileSync(encrypt_data_path, { encoding: 'utf-8' })
  const content_str = decrypt(encrypt_data_txt, password)

  if (content_str === '') {
    return ''
  }

  const encrypt_data = JSON.parse(content_str)
  return encrypt_data
}

const extendJavaScript = () => {
  Array.prototype.__current_index = -1
  Array.prototype.getNext = function (loop = false) {
    this.__current_index++
    if (this.__current_index >= this.length) {
      if (loop) {
        this.__current_index = 0
      }
      else {
        this.__current_index = this.length - 1
        return null
      }
    }

    return this[this.__current_index]
  }
  Array.prototype.getCurrentIndex = function () {
    return this.__current_index
  }
}

const getConfig = () => {
  const config_path = getConfigPath('config.ini')
  const config = ini.parse(fs.readFileSync(config_path, { encoding: 'utf-8' }))
  return config
}

const getValueFromTo = (from, to, digit = 0) => {
  from = Number(from)
  to = Number(to)

  from > to && ([from, to] = [to, from])
  digit < 0 && (digit = 0)

  let r = Math.random() * (to - from) + from
  if (digit === 0) {
    r = Math.floor(r)
  }
  else {
    r = parseFloat(r.toFixed(digit))
  }

  return r
}

module.exports = {
  getTime,
  getAllWalletsData,
  extendJavaScript,
  getConfig,
  getValueFromTo
}