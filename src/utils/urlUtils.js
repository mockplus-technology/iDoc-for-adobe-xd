const { isMac } = require('./isWin')
const { isLocal } = require('./env')
const { getCurrentLanguage, zh_CN } = require('./languageUtils');
const urlCfg = {
  api: null,
  tutorial: null,
  forgotPassword: null,
  homePage: null,
  register: null,
  myApp: null,
  useOSS: null
};

async function initUrl() {
  const language = getCurrentLanguage();
  if (isLocal) {
    urlCfg.homePage = '';
    urlCfg.api = '';
    urlCfg.forgotPassword = urlCfg.homePage + 'forgotpassword';
    urlCfg.tutorial = urlCfg.homePage + 'help/p/233';
    urlCfg.register = 'http://user.mockplus.cn/signup';
    urlCfg.useOSS = false
  } else {
    if (language === zh_CN) {
      urlCfg.homePage = 'https://idoc.mockplus.cn/';
      urlCfg.api = 'https://idocapi.mockplus.cn/v1';
      urlCfg.forgotPassword = 'http://user.mockplus.cn/forgotpassword';
      urlCfg.tutorial = 'https://help.mockplus.cn/p/233';
      urlCfg.register = 'http://user.mockplus.cn/signup';
      urlCfg.useOSS = isMac ? true : false
    } else {
      urlCfg.homePage = 'https://idoc.mockplus.com/';
      urlCfg.api = 'https://idocapi.mockplus.com/v1';
      urlCfg.forgotPassword = 'http://user.mockplus.com/forgotpassword';
      urlCfg.tutorial = 'https://help.mockplus.com/p/251';
      urlCfg.register = 'http://user.mockplus.com/signup';
      urlCfg.useOSS = false
    }
  }

  // urlCfg.register = urlCfg.homePage+'signup';
  urlCfg.myApp = urlCfg.homePage + 'gotomyapps';
}

function saveAddress(address) {
  let baseDomain = address;
  if (address.indexOf('http://') === -1 && address.indexOf('https://') === -1) {
    baseDomain = 'http://' + baseDomain;
  }
  urlCfg.homePage = baseDomain + (baseDomain[baseDomain.length - 1] === '/' ? '' : '/');
  baseDomain = baseDomain + (baseDomain[baseDomain.length - 1] === '/' ? '' : '/') + 'apiforapp/v1';
  urlCfg.api = baseDomain;
  urlCfg.forgotPassword = urlCfg.homePage + 'forgotpassword';
  urlCfg.tutorial = urlCfg.homePage + 'help/p/233';
  urlCfg.register = urlCfg.homePage + 'signup';
  urlCfg.myApp = `${urlCfg.homePage}gotomyapps`;
}

module.exports = {
  urlCfg,
  initUrl,
  saveAddress
};