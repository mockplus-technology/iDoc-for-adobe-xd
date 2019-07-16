const fs = require("uxp").storage.localFileSystem;

/**
 * 从本地保存的授权文件中读取授权信息
 */
async function readAuthInfo() {

}

/**
 * 在本地文件中保存授权信息
 */
async function writeAuthInfo(info) {
  return info;
}

module.exports = {
  readAuthInfo,
  writeAuthFino,
}