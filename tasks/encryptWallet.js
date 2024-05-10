const logger = require('../utils/logger')
const XLSX = require('xlsx')
const fs = require('fs')
const { joinPath } = require('../utils/pathLoad')
const { encrypt } = require('../utils/encrypt')
const { enterPassword } = require('../utils/client')

module.exports = async () => {
  logger.info('Ready to excute excrypt wallet task')

  let try_count = 0
  let password = ''
  while (true) {
    password = await enterPassword('please input password')
    const verify_pwd = await enterPassword('please verify password')
    if (password === verify_pwd) {
      break
    }

    try_count++
    if (try_count >= 3) {
      logger.error('Your memory is so bad, guy, good bye!')
      process.exit()
    }
    logger.warn('The password you entries twice do not match, please re-enter them')
  }

  const wallet_xlsx_path = joinPath('config/wallet.xlsx')
  const workbook = XLSX.readFile(wallet_xlsx_path)
  const first_sheet_name = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[first_sheet_name]
  const data = XLSX.utils.sheet_to_json(worksheet)?.filter(row => !!row.address) || []

  const is_all_private_key_not_empty = data.every(row => row.private_key && String(row.private_key)?.trim() !== '')
  if (!is_all_private_key_not_empty) {
    logger.error(`Sorry, some private key in your excel sheet are empty, please fill them in.`)
    process.exit()
  }

  logger.info(`Ready to encrypt wallet`)
  const encrypted_data = encrypt(JSON.stringify(data), password)
  const encrypt_txt = joinPath('config/encrypted_data.txt')
  fs.writeFileSync(encrypt_txt, encrypted_data, { encoding: 'utf-8' })

  const new_workbook = XLSX.utils.book_new()
  const headers = ['address', 'private_key']
  const table_data = []
  data.forEach(d => {
    const row = []
    headers.forEach(field => field === 'address' ? row.push(d[field]) : row.push(''))
    table_data.push(row)
  })
  const new_worksheet = XLSX.utils.aoa_to_sheet([headers, ...table_data])
  XLSX.utils.book_append_sheet(new_workbook, new_worksheet, "Sheet1")

  try {
    XLSX.writeFile(new_workbook, wallet_xlsx_path)
  }
  catch (e) {
    logger.error(e.message)
    process.exit()
  }

  logger.success('Encrypt wallet successfully')
}