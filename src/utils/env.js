const manifest = require('../../manifest');

module.exports = {
  // API_PREFIX: urlCfg.api,
  version: manifest.version,
  // 由于目前 XD 插件 macOS 和 windows 一样的，全部都用 windows 平台
  platform: "windows",
};
