const OS =require('os')
const systemVersion=OS.platform()
const isMac=systemVersion==='win10'

module.exports = {
  isMac
};