const application = require("application");
const storage = require("uxp").storage;
const fs = storage.localFileSystem;
const { checkPages, uploadPages, uploadFile, getPolicy, getBatchOSSToken, uploadFileToOss } = require('./apis');
const { getNewID, getArtboardsData } = require('./graphUtils');
const { i18n } = require('../i18n');
const { VERSION } = require('../constants/version');
const urlUtils = require('./urlUtils');
const uuidv1 = require('uuid/v1');
const md5 = require('md5-node');
urlUtils.initUrl();
/**
 * 生成字符串的 hash
 * FIXME: 需要比对 hash 来判定页面是否需要上传
 * @returns {string}
 */
let needReplaceBitmap = [];
let spliceImgList = [];
String.prototype.hashCode = function () {
  let hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return `${hash}`;
};

/**
 * 保存为文件
 * @param data
 * @returns {Promise<*>}
 */
async function saveExportedData(data) {
  const tempFolder = await fs.getTemporaryFolder();
  const path = `${getNewID()}.json`;
  const file = await tempFolder.createFile(path);
  const jsonStr = JSON.stringify(data);
  await file.write(jsonStr);//文件写入json
  return {
    id: data.artboardID,
    file,
    hash: jsonStr.hashCode(),
  };
}


function after(n, func) {
  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  return function(...args) {
    if (--n < 1) {
      return func.apply(this, args)
    }
  }
}

async function replaceMarkExportNode(layers, allPNGs, allSVGs) {
  return Promise.all(layers.map(async (node) => {
    const data = Object.assign({}, node);
    const { urlCfg } = urlUtils

    if (node.waitForExported) {
      const thePNGFile = allPNGs.find(png => node.waitForExported === png.id).imageFile
      const thePNGFileContent = await thePNGFile.read({
        format: storage.formats.binary,
      });
      const theSVGFile = allSVGs.find(svg => node.waitForExported === svg.id).imageFile;

      const theSVGFileContent = await theSVGFile.read({
        format: storage.formats.utf8,
      });

      data.basic.type = 'layer'
      data.slice = {
        // 如果不使用0SS者直接使用base64去保存切图，否则将二进制上传到0SS上
        // 是否包含base64，只有真正的矢量图才上传svg
        bitmap: urlCfg.useOSS ? md5(theSVGFileContent) : new Buffer(thePNGFileContent).toString('base64'),
        svg: JSON.stringify(theSVGFileContent).includes('data:image') ? '' : theSVGFileContent,
      };
      needReplaceBitmap.push({ id: md5(theSVGFileContent), content: new Buffer(thePNGFileContent)})
      delete data.waitForExported;
    }
    return data;
  }));
}

/**
 * 导出画板图片
 * @param artboards 需要导出的画板集合
 * @param scale 缩放比例
 * @param fileType 导出的文件类型 application.RenditionType
 * @returns {Promise<*>}
 */
async function exportArtboardImages(artboards, scale, fileType = application.RenditionType.PNG) {
  const tempFolder = await fs.getTemporaryFolder();

  // 导出画板截图
  const renditionSettings = await Promise.all(artboards.map(async artboard => {
    const extention = fileType === application.RenditionType.PNG ? 'png' : 'svg'
    const file = await tempFolder.createFile(`${getNewID()}.${extention}`);
    const cfg = {
      node: artboard,
      outputFile: file,
      type: fileType,
    };
    if (fileType === application.RenditionType.PNG) {
      cfg.scale = scale;
    } else {
      cfg.embedImages = true;
    }
    return cfg;
  }));
  return await application.createRenditions(renditionSettings);
}

/**
 * 根据切图标记创建切图图片文件
 * @param exportNodes 标记为切图的节点数据
 * @param fileType 需要创建的图像文件类型 application.RenditionType
 * @param scale 缩放比例
 * @returns {Promise<void>}
 */
async function createFilesForMarkExport(exportNodes, fileType, scale) {
  let extend = 'png';
  const tempFolder = await fs.getTemporaryFolder();
  switch (fileType) {
    case application.RenditionType.SVG:
      extend = 'svg';
      break;
    default:
      break;
  }
  const renditionSettings = await Promise.all(exportNodes.map(async (node) => {
    const file = await tempFolder.createFile(`${getNewID()}.${extend}`);
    const result = {
      node: node.node,
      outputFile: file,
      type: fileType,
    };
    if (fileType === application.RenditionType.PNG) {
      result.scale = scale;
    } else {
      result.embedImages = true;
      result.minify = true;
    }
    return result;
  }));

  const exportedMarkImages = await application.createRenditions(renditionSettings);

  return exportNodes.map((nodeInfo, index) => ({
    id: nodeInfo.id,
    imageFile: exportedMarkImages[index].outputFile,
  }));
}

/**
 * 导出画板数据
 * FIXME: 画板中没有切图时会报错
 * @param artboards
 * @param scale 切图的缩放比例
 */
async function exportArtboardDatas(artboards, device) {
  // 导出数据
  const markedToExportNodes = [];
  const scale = device.sliceScale;

  const exportedDatas = getArtboardsData(artboards, markedToExportNodes, device);
  if (markedToExportNodes.length === 0) {
    return await Promise.all(exportedDatas.map(saveExportedData));
  }

  const allExportedPNGs = await createFilesForMarkExport(markedToExportNodes, application.RenditionType.PNG, scale);

  const allExportedSVGs = await createFilesForMarkExport(markedToExportNodes, application.RenditionType.SVG, scale);

  const newExportedDatas = await Promise.all(exportedDatas.map(async (data) => {

    const newLayers = await replaceMarkExportNode(data.layers, allExportedPNGs, allExportedSVGs);
    //这里是上传的数据
    return Object.assign({}, data, {
      layers: newLayers,
      version: VERSION,
    });
  }));

  return await Promise.all(newExportedDatas.map(saveExportedData));
}

/**
 * 导出画板
 * @param artboards 画板列表
 * @param appID 要上传的项目 ID
 * @param device 用户选择的设备信息
 * @param onInfoUpdate 实时更新界面信息回调函数
 * @returns {Promise<*>}
 */

async function exportArtboards(appID, artboards, device, onInfoUpdate) {

  if (!appID) {
    throw new Error(i18n('error.chooseProject'));
  }
  const { urlCfg } = urlUtils
  console.log(`导出 ${artboards.length} 个画板。`);
  onInfoUpdate({
    progress: 5,
    message: i18n('export.parseProgress', artboards.length),
  });
  const exportedDatas = await exportArtboardDatas(artboards, device);
  onInfoUpdate({
    progress: 10,
    message: i18n('export.parseSuccess'),
  });
  const toCheckPages = exportedDatas.map(data => ({
    clientID: data.id,
    clientHash: data.hash,
  }));

  onInfoUpdate({
    progress: 15,
    message: i18n('export.checkProgress'),
  });

  const toUploadPages = await checkPages({
    appID,
    pages: toCheckPages,
  });

  if (toUploadPages.length === 0) {
    throw new Error(i18n('error.noUpdateProject'));
  }
  onInfoUpdate({
    progress: 20,
    message: i18n('export.needUploadCount', toUploadPages.length),
  });

  // 过滤已经上传过的画板
  const needUpdateArtboards = artboards.filter(artboard => toUploadPages.find(page => page.clientID === artboard.guid));
  const needExportedDatas = exportedDatas.filter(data => toUploadPages.find(page => page.clientID === data.id));

  onInfoUpdate({
    progress: 25,
    message: i18n('export.imageExporting'),
  });

  const type = application.RenditionType.PNG;

  const artboardScale = device.artboardScale;

  const exportedPNGs = await exportArtboardImages(needUpdateArtboards, artboardScale, type);

  onInfoUpdate({
    progress: 30,
    message: i18n('export.dateUploading'),
  });

  // 需要上传的数据文件数量 （截图，图层数据）
  const totalAssestsCount = needUpdateArtboards.length * 2;
  let currentUploadedAssests = 0;
  const progressForUploadEachAssests = 65 / totalAssestsCount;

  if (urlCfg.useOSS) {
    if(needReplaceBitmap.length === 0 ){
      spliceImgList = []
    } else {
      const ossTokenUrl = await getBatchOSSToken(needReplaceBitmap.map(item => {
        const curDate = new Date();
        const objectName = `idoc/xd/${curDate.getFullYear()}-${('0' + (curDate.getMonth() + 1)).slice(-2)}-${('0' + curDate.getDate()).slice(-2)}/${uuidv1()}.png`;
        return { 'dataKey': objectName, 'contentType': 'image/png' }
      }))
      spliceImgList = await UploadWorker(ossTokenUrl, needReplaceBitmap)
      }
    }
  //生成页面JSON
  const pagePromises = needUpdateArtboards.map(async (artboard, index) => {
    //上传图片文件
    const image = await exportedPNGs[index].outputFile.read({
      format: type === application.RenditionType.SVG ? storage.formats.utf8 : storage.formats.binary,
    });
    let json, jsonFile = {}, imageFile = {}
    if (urlCfg.useOSS) {
      const curDate = new Date();
      const objectName = `idoc/xd/${curDate.getFullYear()}-${('0' + (curDate.getMonth() + 1)).slice(-2)}-${('0' + curDate.getDate()).slice(-2)}/${uuidv1()}.png`;
      imageFile = await getPolicy(new Buffer(image), objectName, true)
    } else {
      imageFile = await uploadFile(new Buffer(image), 'image');
    };
    currentUploadedAssests += 1;
    onInfoUpdate({
      progress: Math.floor(currentUploadedAssests * progressForUploadEachAssests + 30),
      message: i18n('export.uploading'),
    });

    if (urlCfg.useOSS) {
      json = await needExportedDatas[index].file.read({
        format: storage.formats.utf8,
      });

      json = await getPageJson(needReplaceBitmap,json)

      //upload json and uplaod page
      const curDate = new Date();
      const objectName = `idoc/xd/${curDate.getFullYear()}-${('0' + (curDate.getMonth() + 1)).slice(-2)}-${('0' + curDate.getDate()).slice(-2)}/${uuidv1()}.json`;
      let urlInfo = await getPolicy(json, objectName);
      jsonFile = urlInfo
    } else {
      json = await needExportedDatas[index].file.read({
        format: storage.formats.binary,
      });
      jsonFile = await uploadFile(new Buffer(json), 'json');
    }

    json = await needExportedDatas[index].file.read({
      format: storage.formats.utf8,
    });

    currentUploadedAssests += 1;
    onInfoUpdate({
      progress: Math.floor(currentUploadedAssests * progressForUploadEachAssests + 30),
      message: i18n('export.uploading'),
    });

    return Promise.resolve({
      device: device.value,
      name: artboard.name,
      clientID: artboard.guid,
      clientHash: needExportedDatas[index].hash,
      size: {
        width: artboard.width,
        height: artboard.height,
      },
      position: {
        x: artboard.globalDrawBounds.x,
        y: artboard.globalDrawBounds.y,
      },
      imageURL: imageFile.URL,
      jsonURL: jsonFile.URL,
    });

  });
  const pages = await Promise.all(pagePromises);
  needReplaceBitmap = []
  spliceImgList = []
  return await uploadPages({
    appID,
    pages: pages.reverse(),
    version: VERSION,
  });
}

async function getPageJson (needReplaceBitmap,json){
  if(needReplaceBitmap.length===0 && spliceImgList.length ===0){
    return json
  }
  spliceImgList.forEach(({ URL, id }) => {
    json = json.replace(`"bitmap":"${id}"`, `"bitmap":"${URL}"`);
  });
  return json
}

async function UploadWorker(ossTokenUrl, needReplaceBitmap) {
  const urls = [];
  // 最大允许5个工作线程
  const MAX_UPLOAD_WORKERS = 5;
  const workersCount = Math.min(needReplaceBitmap.length, MAX_UPLOAD_WORKERS);
  const errors = [];
  return new Promise((res, rej) => {
    const allWorkDone = after(workersCount, () => {
      res(urls);
    });

    const worker = () => {
      if (needReplaceBitmap.length <= 0) {
         allWorkDone();
         return;
      }
      const image = needReplaceBitmap.shift();
      uploadFileToOss(ossTokenUrl.shift(), new Buffer(image.content), image.id).then(imgInfo => {
        urls.push(imgInfo);
        worker();
      }).catch(err => {
        console.error(err);
        errors.push(err);
        worker();
      });
    };
    for (let i = 0; i < workersCount; i++) {
      worker();
    }
  })

}
//状态图的代码`````````````````````````````````````````````````````````````````````````

async function getExportArtboards(appID, artboards, device) {
  if (!appID) {
    throw new Error(i18n('error.chooseProject'));
  }
  const { urlCfg } = urlUtils
  const exportedDatas = await exportArtboardDatas(artboards, device);
  const toUploadPages = exportedDatas.map(data => ({
    clientID: data.id,
    clientHash: data.hash,
  }));

  // 过滤已经上传过的画板
  const needUpdateArtboards = artboards.filter(artboard => toUploadPages.find(page => page.clientID === artboard.guid));
  const needExportedDatas = exportedDatas.filter(data => toUploadPages.find(page => page.clientID === data.id));

  if (urlCfg.useOSS) {
    if(needReplaceBitmap.length === 0 ){
      spliceImgList = []
    } else {
      const ossTokenUrl = await getBatchOSSToken(needReplaceBitmap.map(item => {
        const curDate = new Date();
        const objectName = `idoc/xd/${curDate.getFullYear()}-${('0' + (curDate.getMonth() + 1)).slice(-2)}-${('0' + curDate.getDate()).slice(-2)}/${uuidv1()}.png`;
        return { 'dataKey': objectName, 'contentType': 'image/png' }
      }))
      spliceImgList = await UploadWorker(ossTokenUrl, needReplaceBitmap)
      }
    }

  const type = application.RenditionType.PNG;

  const artboardScale = device.artboardScale;

  const exportedPNGs = await exportArtboardImages(needUpdateArtboards, artboardScale, type);
  const pages = await Promise.all(needUpdateArtboards.map(async (artboard, index) => {
    //上传图片文件
    const image = await exportedPNGs[index].outputFile.read({
      format: type === application.RenditionType.SVG ? storage.formats.utf8 : storage.formats.binary,
    });
    const imageFile = await uploadFile(new Buffer(image), 'image');

    //上传切图数据
    let json, jsonFile = {}

    if (urlCfg.useOSS) {

      json = await needExportedDatas[index].file.read({
        format: storage.formats.utf8,
      });

      json = await getPageJson(needReplaceBitmap,json)

      //upload json and uplaod page
      const curDate = new Date();
      const objectName = `idoc/xd/${curDate.getFullYear()}-${('0' + (curDate.getMonth() + 1)).slice(-2)}-${('0' + curDate.getDate()).slice(-2)}/${uuidv1()}.json`;
      let urlInfo = await getPolicy(json, objectName);
      jsonFile = urlInfo

    } else {
      json = await needExportedDatas[index].file.read({
        format: storage.formats.binary,
      });
      jsonFile = await uploadFile(new Buffer(json), 'json');
    }

    // jsonFile = await uploadFile( urlCfg.useOSS?json:new Buffer(json), 'json');

    return {
      appID,
      device: device.value,
      name: artboard.name,
      clientID: artboard.guid,
      clientHash: needExportedDatas[index].hash,
      size: {
        width: artboard.width,
        height: artboard.height,
      },
      position: {
        x: artboard.globalDrawBounds.x,
        y: artboard.globalDrawBounds.y,
      },
      source: 'xd',
      imageURL: imageFile.URL,
      jsonURL: jsonFile.URL,
      version: VERSION
    };
  }));
  return pages
}


/**
 * 导出画板数据
 * FIXME: 画板中没有切图时会报错
 * @param artboards
 * @param scale 切图的缩放比例
 */
async function getExportArtboardDatas(artboards, device) {
  // 导出数据
  const markedToExportNodes = [];
  const scale = device.sliceScale;
  const exportedDatas = getArtboardsData(artboards, markedToExportNodes, device);

  if (markedToExportNodes.length === 0) {
    return await Promise.all(exportedDatas.map(saveExportedData));
  }

  const allExportedPNGs = await createFilesForMarkExport(markedToExportNodes, application.RenditionType.PNG, scale);

  const allExportedSVGs = await createFilesForMarkExport(markedToExportNodes, application.RenditionType.SVG, scale);

  const newExportedDatas = await Promise.all(exportedDatas.map(async (data) => {
    const newLayers = await replaceMarkExportNode(data.layers, allExportedPNGs, allExportedSVGs);
    return Object.assign({}, data, {
      layers: newLayers,
      version: VERSION,
    });
  }));
  return await Promise.all(newExportedDatas.map(saveExportedData));
}

module.exports = {
  exportArtboards,
  getExportArtboardDatas,
  getExportArtboards//状态图用到的function
};
