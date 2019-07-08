const urlCfg = {
  api: null,
  tutorial: null,
  forgotPassword: null,
  homePage: null,
  register: null,
  myApp: null,
  useOSS:null
};

async function initUrl(){
  const { getCurrentLanguage, zh_CN } = require('./languageUtils');
  const language = getCurrentLanguage();
  if(language === zh_CN){
    urlCfg.homePage = 'https://idoc.mockplus.cn';
    urlCfg.api = 'https://idocapi.mockplus.cn/v1';
    urlCfg.forgotPassword = 'http://user.mockplus.cn/forgotpassword';
    urlCfg.tutorial = 'https://help.mockplus.cn/p/233';
    urlCfg.register = 'http://user.mockplus.cn/signup';
    urlCfg.useOSS = true
  } else {
    urlCfg.homePage = 'https://idoc.mockplus.com';
    urlCfg.api = 'https://idocapi.mockplus.com/v1';
    urlCfg.forgotPassword = 'http://user.mockplus.com/forgotpassword';
    urlCfg.tutorial = 'https://help.mockplus.com/p/251';
    urlCfg.register = 'http://user.mockplus.com/signup';
    urlCfg.useOSS = false
  }
  urlCfg.myApp=`${urlCfg.homePage}/gotomyapps`;
  urlCfg.api=`http://192.168.1.89:8070/v1`;
}

module.exports = {
  urlCfg,
  initUrl,
};