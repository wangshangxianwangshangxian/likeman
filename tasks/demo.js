module.exports = async wallet => {
  const resp = {
    code   : 0,
    message: null,
    data   : null
  }
  await new Promise(succ => setTimeout(succ, 1000))

  return resp
}