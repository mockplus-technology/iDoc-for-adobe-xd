const local = {
  main:{
    close: '关闭',
    settings: '设置',
    waiting: '请稍候...',
  },
  setting: {
    back: '返回',
    ok: '确定',
    chooseVersion: '语言/地区',
    noteCH: '注意：中文版本仅限中国地区使用。',
    noteEN: 'Note: Chinese version is only available in China.'
  },
  app: {
    uploadSuccess: '{0}个画板上传成功',
    dataIsRefresh: '数据已更新',
    chooseProject: '选择项目',
    refresh: '刷新',
    settings: '设置',
    artboardSelectedCount: '共{0}个画板，选中{1}个。',
    chooseDevice: '请选择设备类型',
    uploadSelected: '上传所选画板',
    uploadAll: '上传全部画板',
    projectName: '项目名称',
    phoneProject: '手机项目',
    webProject: '网页项目',
    create: '创建',
    cancel: '取消',
    myProject: '我的项目',
    noSelected: '当前未选中任何画板。',
    seeProject: '查看项目',
    selectAppSet: '请选择项目集',
    noSelectAppSet: '无',
  },
  login:{
    qrCode: '请使用微信扫二维码登录',
    back: '返回',
    account: '邮箱',
    password: '密码',
    autoLogin: '下次自动登录',
    signIn: '登录',
    wechat: '微信扫码登录',
    register: '立即注册',
    forgotPassword: '忘记密码',
    tutorial: '查看教程',
    loginTimeOut: '登录过期，请',
    loginAgain: '重新登录'
  },
  menu: {
    newProject: '新建项目',
    switchTeam: '切换团队',
    switchAccount: '切换账号',
  },
  export: {
    parseProgress: '数据解析中，共{0}个画板需要解析。',
    parseSuccess: '数据解析完毕',
    checkProgress: '正在检查数据是否需要更新',
    needUploadCount: '共{0}个画板需要上传。',
    imageExporting: '正在导出图片。',
    dateUploading: '正在上传数据。',
    uploading: '上传数据中',
    uploadingError: '画板尺寸超出XD导出最大限制，请缩小画板后重试'
  },
  error: {
    chooseProject: '请选择项目',
    noPermission:'你没有权限执行该操作。',
    noUpdateProject: '画板已经是最新的了，无需更新。',
  },
  upgrade:{
    newVersion: '发现新版本，点击下载',
    currentVersion: '摹客 iDoc {0}',
  },
  multiStatus:{
    uploadstateImg:'上传为状态图',
    multiStatusPageTip: '项目中，此画板存在多个状态：', //上传为状态图弹窗
    newStatusPageRadio: '添加新状态',    
    overridePageRadio: '覆盖已有状态',
    newStatusNamePH: '画板状态1',
    uploadStatusPage: '继续上传',
    getStatusErrMsg: '获取状态信息失败',
    handleStatusPageTip1: '你可以将一个画板多次上传，作为不同的状态。',  //上传为状态图帮助弹窗
    handleStatusPageTip2: '此功能仅在选中一个画板时可用。',
    handleStatusPageTipOK: '好的',
    uploadErrMsg: '上传失败,请重试!',
    uploadSucMsg: '上传完成!',
  }
};

module.exports = local;