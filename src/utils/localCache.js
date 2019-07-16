const storage = require('uxp').storage;
const fs = storage.localFileSystem;
const cache = {};
var isNeedSave = true;

const cfgFileName = 'idoc.cfg';

async function saveLocalCache(cache = null) {
  if (cache && !isNeedSave) {
    return;
  }
  fs.getDataFolder()
    .then((folder) => {
      return folder.createFile(cfgFileName, { overwrite: true });
    })
    .then((file) => {
      let data = '{}';
      if (cache) {
        data = JSON.stringify(cache);
      }
      file.write(data);
    })
    .catch((e) => {
      console.log('save cache error:', e);
    });
}

async function getLocalCache() {
  return fs.getDataFolder()
    .then((folder) => {
      return folder.getEntry(cfgFileName);
    }).then((entry) => {
      return entry.read();
    }).then((data) => {
      if (data) {
        let cfg;
        if (typeof data === 'string') {
          cfg = JSON.parse(data);
        } else {
          cfg = data;
        }

        for (let key in cfg) {
          cache[key] = cfg[key];
        }
      }
      return cache;
    }).catch((e) => { console.log(e) });
}

async function getUserInfo() {
  if (cache) {
    return cache.userInfo;
  }
  return null;
}

async function saveUserInfo(user) {
  cache.userInfo = user;
  return saveLocalCache(cache)
}

async function getAddress() {
  if (cache) {
    const address = cache.address;
    return address;
  }
  return null;
}

async function saveAddress(address) {
  cache.address = address;
  return saveLocalCache(address)
}

function getSelectTeamID() {
  return cache.selectTeamID;
}

async function saveSelectTeamID(teamID) {
  cache.selectTeamID = teamID;
  return saveLocalCache(cache);
}

function getLastSelectApp() {
  return cache.selectAppID;
}

async function saveLastSelectApp(appID) {
  cache.selectAppID = appID;
  return saveLocalCache(cache);
}

async function saveDevice(device) {
  cache.device = device;
  return saveLocalCache(cache);
}

function getDevice() {
  return cache.device;
}


async function clearCache(force = false) {
  if (force) {
    delete cache.userInfo;
    delete cache.token;
    delete cache.device;
    delete cache.selectAppID;
    delete cache.selectTeamID;
  }

  const data = { currentLanguage: cache.currentLanguage };
  return saveLocalCache(data);
}

async function init() {
  return getLocalCache();
}

function needSave(value) {
  isNeedSave = value;
}


async function saveToken(value) {
  cache.token = value;
  return saveLocalCache(cache);
}

async function getToken() {
  return cache.token;
}


function saveDefaultLanguage(language, needSave = true) {
  cache.currentLanguage = language;
  if (needSave) {
    saveLocalCache(cache)
  }
}

async function getDefaultLanguage() {
  if (!cache.currentLanguage) {
    return init().then(() => {
      return cache.currentLanguage;
    });
  }
  return cache.currentLanguage;
}

module.exports = {
  init,
  clearCache,
  getSelectTeamID,
  saveSelectTeamID,
  getUserInfo,
  saveUserInfo,
  getLastSelectApp,
  saveLastSelectApp,
  needSave,
  saveToken,
  getToken,
  saveDevice,
  getDevice,
  saveDefaultLanguage,
  getDefaultLanguage,
  getAddress,
  saveAddress
};


