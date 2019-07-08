const local = {
  main: {
    close: 'Close',
    settings: 'Settings',
    waiting: 'Loading...'
  },
  setting: {
    back: 'Back',
    ok: 'OK',
    chooseVersion: 'Region&Language',
    noteCH: '注意：中文版本仅限中国地区使用。',
    noteEN: 'Note: Chinese version is only available in China.'
  },
  app: {
    uploadSuccess: '{0} artboard(s) uploaded successfully.',
    dataIsRefresh: 'Data updated',
    chooseProject: 'Select project',
    refresh: 'Refresh',
    settings: 'Settings',
    artboardSelectedCount: '{0} artboards in total, {1} artboard(s) selected',
    chooseDevice: 'Select device type',
    uploadSelected: 'Upload the selected artboard(s)',
    uploadAll: 'Upload all artboards',
    projectName: 'Project name',
    phoneProject: 'Mobile project',
    webProject: 'Web project',
    create: 'Create',
    cancel: 'Cancel',
    myProject: 'My project',
    seeProject: 'View the project',
    selectAppSet: '請選擇專案集',
    noSelectAppSet: '無',

  },
  login: {
    qrCode: '请使用微信扫二维码登录',
    back: 'Back',
    account: 'Email',
    password: 'Password',
    autoLogin: 'Auto login next time',
    signIn: 'Log in',
    wechat: '微信扫码登录',
    register: 'Register now',
    forgotPassword: 'Forgot password',
    tutorial: 'Tutorials',
    loginTimeOut: 'Session expired,Please ',
    loginAgain: 'log in again.'
  },
  menu: {
    newProject: 'New project',
    switchTeam: 'Switch team',
    switchAccount: 'Switch account',
  },
  export: {
    parseProgress: 'The data is being parsed. {0} artboard(s) in total need to be parsed.',
    parseSuccess: 'Data parsing completed.',
    checkProgress: 'Checking if data needs to be updated...',
    needUploadCount: '{0} artboard(s) need to be updated.',
    imageExporting: 'Exporting image(s)...',
    dateUploading: 'Updating data...',
    uploading: 'Updating data...',
    uploadingError: 'Exported artboards exceed the max size of XD. Please reduce it and try again.' 
    
  },
  error: {
    chooseProject: 'Select a project',
    noPermission:"You don't have permission to perform this operation.",
    noUpdateProject: 'There is no data change currently. No need to update data.'
  },
  upgrade: {
    newVersion: 'Download New version',
    currentVersion: 'Mockplus iDoc {0}',
  },
  multiStatus: {
    uploadstateImg:'Upload as state',
    multiStatusPageTip: 'In the project, this artborad has multiple states:', //上传为状态图弹窗
    newStatusPageRadio: 'Add new state',    
    overridePageRadio: 'Cover existing state',
    newStatusNamePH: 'Artboard state 1',
    uploadStatusPage: 'Continue',
    getStatusErrMsg: 'get states error.',
    handleStatusPageTip1: 'You can upload artboards for several times as different states.',  //上传为状态图帮助弹窗
    handleStatusPageTip2: 'This feature works when only one artboard is selected.',
    handleStatusPageTipOK: 'Ok',
    uploadErrMsg: 'Failed to upload. Please try again.',  //new
    uploadSucMsg: 'Upload completed.',
  }
};

module.exports = local;