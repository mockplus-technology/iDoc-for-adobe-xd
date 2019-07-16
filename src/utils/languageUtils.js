const application = require('application');
const systeLanguage = application.appLanguage.substr(0, 2);
const { saveDefaultLanguage, getDefaultLanguage } = require('./localCache');

const zh_CN = 'zh';
const tw_CN = 'tw';
const en_US = 'en';

let currentLanguage = zh_CN; //systeLanguage;

async function switchLanguage(language, needSave = true) {
  currentLanguage = language || systeLanguage;
  saveDefaultLanguage(currentLanguage, needSave);
  return currentLanguage;
}

async function initLanguage() {
  return getDefaultLanguage().then((language) => {
    return switchLanguage(language, false)
  })
}

function getCurrentLanguage() {
  return currentLanguage;
}

const languageList = [{
  key: 'zh',
  file: 'zh_CN',
  name: '中文',
}, {
  key: 'en',
  file: 'en_US',
  name: 'English',
}];

//语言文件规则：只能是两个字符，如中文：zh，英文： en， 必须有一个默认的文件
const localCfg = () => {
  const result = languageList.find(language => language.key === currentLanguage);
  if (!result) {
    return languageList[0];
  }
  return result;
};

initLanguage();

module.exports = {
  zh_CN,
  en_US,
  tw_CN,
  switchLanguage,
  languageList,
  getCurrentLanguage,
  localLanguage: localCfg,
};