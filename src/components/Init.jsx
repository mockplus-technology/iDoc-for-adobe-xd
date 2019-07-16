const React = require('react');
const { init, getUserInfo, getToken } = require('../utils/localCache');
const { saveToken } = require('../utils/apis');

const initConfig = require('../utils/init');

/**
 * 初始化组件 主要处理：
 * 1. 判断本地是否有登录信息：
 *   a. 有，跳转到 App
 *   b. 没有，跳转到 Login
 */
class Init extends React.Component {
  constructor() {
    super();
  }

  componentDidMount() {
    const { onGoToLogin, onGoToApp } = this.props;
    init()
      .then(() => {
        initConfig().then(() => {
          // 获取本地缓存用户信息
          getUserInfo()
            .then(user => {
              const isLogined = !!user;
              if (isLogined) {
                // 获取本地缓存 token
                getToken().then(token => {
                  if (token) {
                    saveToken(token);
                    onGoToApp(user);
                  } else {
                    onGoToLogin();
                  }
                });
                return;
              }
              onGoToLogin();
            })
            .catch(onGoToLogin);
        });
      })
      .catch(e => {
        init().then(() => {
          onGoToLogin();
        });
      });
  }
  render() {
    return <div />;
  }
}

module.exports = Init;
