const crypto = require('crypto')

const encrypt = (text, password) => {
  const { key, iv } = deriveKeyIv(password)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

const decrypt = (encryptedText, password) => {
  try {
    const { key, iv } = deriveKeyIv(password)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }
  catch (e) {
    return ''
  }
}

function deriveKeyIv(password) {
  const salt = 'wangshangxianwangshangxian'
  const iterations = 100000
  const keyLen = 32
  const digest = 'sha512'

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keyLen + 16, digest);
  const key = derivedKey.slice(0, 32)
  const iv = derivedKey.slice(32, 48)

  return { key, iv }
}

module.exports = {
  encrypt,
  decrypt
}