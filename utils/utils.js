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

module.exports = {
  getTime
}