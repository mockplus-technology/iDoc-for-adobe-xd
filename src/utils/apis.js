const { version, platform, } = require('./env');
const { urlCfg } = require('./urlUtils');
const storage = require("uxp").storage;
const axios = require('axios');
let token = null;
const OS = require('os')
const systemVersion = OS.platform()

/**
 * xml http request 辅助方法
 * @param url 请求地址
 * @param method 请求方法 GET POST PUT
 * @param data 要发送的数据，可以省略
 * @param headers 需要添加的头信息
 * @param returnOnlyPayload 是否只返回 payload 部分，如果为 true， 将认为只有 code = 0 时是正常返回，其它都是异常
 * @returns {Promise<*>}
 */
async function xhr(url, method, data = null, headers = {}, returnOnlyPayload = true) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        if (!returnOnlyPayload) {
          resolve(xhr.response);
          return;
        }
        try {
          const { code, payload, message } = xhr.response;
          if (code === 0) {
            resolve(payload);
            return
          }
          reject(message);
        } catch (err) {
          reject(`Couldn't parse response. ${err.message}, ${xhr.response}`);
        }
      } else {
        reject(`Error: ${xhr.status}`);
      }
    };
    xhr.onerror = (e) => {
      let msg = xhr.statusText;
      if (xhr.status === 0) {
        msg = 'Network not connected.';
      }
      reject(msg);
    };
    xhr.onabort = reject;
    xhr.open(method, url, true);
    xhr.responseType = "json";
    if (headers) {
      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });
    }
    xhr.setRequestHeader('X-MOCKPLUS-APP', `idoc-for-xd|${version}|${systemVersion}`);
    xhr.send(data);
  });
}

async function uploadFile(data, type = 'image', teamID) {
  return xhr(`${urlCfg.api}/file/xd-${type}/${teamID}`, 'PUT', data);
}

function builderHeader() {
  const header = { "Content-Type": "application/json;charset=UTF-8" };
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }
  return header;
}

async function post(url, data = null) {
  var json = data;
  if (json && typeof json === 'object') {
    json = JSON.stringify(json);
  }
  return xhr(url, 'POST', json, builderHeader());
}

async function get(url, data = null) {
  var json = data;
  if (json && typeof json === 'object') {
    json = JSON.stringify(json);
  }
  return xhr(url, 'GET', json, builderHeader());
}

async function put(url, data = null, ossHeader = null) {
  var json = data;
  if (json && typeof json === 'object') {
    json = JSON.stringify(json);
  }
  return xhr(url, 'PUT', json, ossHeader || builderHeader());
}

async function patch(url, data = null) {
  var json = data;
  if (json && typeof json === 'object') {
    json = JSON.stringify(json);
  }
  return xhr(url, 'PATCH', json, builderHeader());
}


/**
 * 检查页面是否需要上传
 * @returns {Promise<void>}
 */
async function checkPages(data) {
  return post(`${urlCfg.api}/page/multiple/check`, data);
}

/**
 * 上传页面
 * @param data
 * @returns {Promise<*>}
 */
async function uploadPages(data) {
  return put(`${urlCfg.api}/page/xd`, data);
}

async function login({ email, password }) {
  return post(`${urlCfg.api}/user/signin`, { email, password });
}

async function loadApps(teamID) {
  return get(`${urlCfg.api}/app/all/${teamID}?needAppSet=true`);
}

async function loadAllTeams() {
  return get(`${urlCfg.api}/team`);
}

async function createApp(data) {
  return put(`${urlCfg.api}/app`, data)
}

/**
 * 获得所有状态
 * @returns {Promise<*>}
 */

async function getAllCopy(appID, clientID) {
  return get(`${urlCfg.api}/page/${appID}/pageCopies/${clientID}`)
}

/**
 * 创建新的页面副本
 * @returns {Promise<*>}
 */

async function addNewCopy(data) {
  return put(`${urlCfg.api}/page/uploadPageCopy`, data)
}

/**
 * 覆盖页面副本
 * @returns {Promise<*>}
 */

async function CoverCopy(data, pageID) {
  return xhr(`${urlCfg.api}/page/coverCopy/${pageID}`, 'PATCH', JSON.stringify(data), builderHeader());
}

function saveToken(value) {
  token = value;
}

function getToken() {
  return token;
}

function getQRCode() {
  return get(`${urlCfg.api}/user/getQRCode`)
}

function checkWXLoginResult(ticket) {
  return get(`${urlCfg.api}/user/xd-wx-check?ticket=${ticket}`);
}

function onTimeout(time) {
  return get(`${urlCfg.api}/utils/timeout?time=${time}`);
}

function getAllAppSet(teamID) {
  return get(`${urlCfg.api}/app/allAppSet/${teamID}`);
}



/**
 * 检查更新
 * @returns {Promise<*>}
 */
function checkUpdate() {
  const url = `${urlCfg.api}/software/checkUpdateForIdocPlugin?version=${version}&platform=${platform}&name=idoc-for-xd`;
  return xhr(url, 'GET', null, null, false);
}

/**
 * 获取oss的token
 */
async function getOSSToken(filePath, isImg) {
  if (isImg) {
    return await get(`${urlCfg.api}/user/ossSign?dataKey=${filePath}&contentType=image/png`);
  }
  return await get(`${urlCfg.api}/user/ossSign?dataKey=${filePath}&contentType=application/json;charset=UTF-8`);
}

function getBatchOSSToken(ossSignArr) {
  return post(`${urlCfg.api}/user/ossSign`, { ossSignArr })
}

function uploadFileToOss(ossToken, file, id) {
  const ossRequest = axios.create({
    headers: { 'content-type': 'image/png' },
  });
  return ossRequest({
    method: 'put',
    url: ossToken,
    data: file,
  }).then(() => {
    return { URL: ossToken.split('?')[0], id }
  }).catch((e) => {
    console.error(e);
  });
}
// 获取policy
async function getPolicy(file, filePath, isImg) {
  if (file && filePath) {
    let ossToken = await getOSSToken(filePath, isImg)
    try {
      if (isImg) {
        // await put(ossToken, file, { "Content-Type": "image/png" });
        const ossRequest = axios.create({
          headers: { 'content-type': 'image/png' },
        });
        ossRequest({
          method: 'put',
          url: ossToken,
          data: file,
        }).then((ossRes) => {
        }).catch((e) => {
          console.error(e);
        });
      } else {
        await put(ossToken, file, { "Content-Type": "application/json;charset=UTF-8" });
      }
    } catch (e) {
      console.log(e)
    }
    return ({ URL: ossToken.split('?')[0], id: filePath });
  } else {
    throw new Error('获取导出的切图数据失败');
  }
}

module.exports = {
  uploadFile,
  checkPages,
  uploadPages,
  login,
  loadApps,
  loadAllTeams,
  saveToken,
  getToken,
  createApp,
  getQRCode,
  checkWXLoginResult,
  onTimeout,
  checkUpdate,
  getAllCopy,
  addNewCopy,
  CoverCopy,
  getPolicy,
  getAllAppSet,
  uploadFileToOss,
  getBatchOSSToken
};
