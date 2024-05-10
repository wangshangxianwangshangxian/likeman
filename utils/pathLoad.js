const getRoot = () => {
  const root = process.cwd()
  return root
}

const joinPath = path => {
  const root = getRoot()
  return root + '/' + path
}

const getConfig = path => {
  const config_path = joinPath('config') + '/' + path
  return config_path
}

module.exports = {
  getRoot,
  joinPath,
  getConfig
}