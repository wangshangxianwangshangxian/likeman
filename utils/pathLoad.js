const getRoot = () => {
  const root = process.cwd()
  return root
}

const joinPath = path => {
  const root = getRoot()
  return root + '/' + path
}

module.exports = {
  getRoot,
  joinPath
}