const fs = require('fs')
const { getConfig } = require('./pathLoad')
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
  const encrypt_data_path = getConfig('encrypted_data.txt')
  const encrypt_data_txt = fs.readFileSync(encrypt_data_path, { encoding: 'utf-8' })
  const content_str = decrypt(encrypt_data_txt, password)

  if (content_str === '') {
    return ''
  }

  const encrypt_data = JSON.parse(content_str)
  return encrypt_data
}

module.exports = {
  getTime,
  getAllWalletsData
}