module.exports = async wallet => {
  const resp = {
    code   : 0,
    message: null,
    data   : null
  }
  const delay = Math.ceil(Math.random() * 10) * 1000
  await new Promise(succ => setTimeout(succ, delay))

  return resp
}