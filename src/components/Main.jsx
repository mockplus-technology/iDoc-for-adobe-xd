const React = require('react');
const { i18n } = require('../i18n');
const initConfig = require('../utils/init');
const LoginComp = require('./Login.jsx');
const InitComp = require('./Init.jsx');
const AppComp = require('./App.jsx');
const SettingPanel = require('./SettingPanel.jsx');
const Waiting = require('./AppComs/Waiting.jsx');
const { formatAllApp } = require('../utils/projectsFormat.js');
const { urlCfg } = require('../utils/urlUtils');
const { isLocal } = require('../utils/env');
const {
  getSelectTeamID,
  getLastSelectApp,
  saveUserInfo,
  saveAddress,
  getAddress,
  clearCache,
  needSave,
  saveToken,
} = require('../utils/localCache');

const {
  switchLanguage,
  getCurrentLanguage,
} = require('../utils/languageUtils');

const { loadAllTeams, loadApps, onTimeout } = require('../utils/apis');

require('./Main.scss');

const Routes = {
  // 处理初始化逻辑
  Init: 'init',
  Login: 'login',
  App: 'app',
  Settings: 'settings',
};

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: Routes.Init,
      user: null,
      address: null,
      appID: null,
      apps: null,
      teams: null,
      teamID: null,
      device: null,
      message: '',
      showWaiting: false,
    };
    this.onGoToLogin = this.onGoToLogin.bind(this);
    this.onGoToApp = this.onGoToApp.bind(this);
    this.onLoginSuccess = this.onLoginSuccess.bind(this);
    this.doInitData = this.doInitData.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.onCloseApp = this.onCloseApp.bind(this);
    this.onMainClick = this.onMainClick.bind(this);
    this.onSwitchLanguage = this.onSwitchLanguage.bind(this);
    this.onShowWaiting = this.onShowWaiting.bind(this);
    this.checkError = this.checkError.bind(this);
    this.getAllTeamsAndCurApp = this.getAllTeamsAndCurApp.bind(this);
  }

  componentDidMount() {
    window.addEventListener('click', this.onMainClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onMainClick);
  }

  /**
   * 跳转到 App
   */
  onGoToApp(user, address) {
    this.setState({ user, showWaiting: true, address });
    this.doInitData(() => {
      this.setState({ path: Routes.App });
      this.onShowWaiting(false);
    });
  }

  checkError(errorMsg) {
    if (errorMsg === 'render.too_large') {
      return i18n('error.layerToBig');
    } else if (errorMsg === 'io.failed') {
      return i18n('error.groupIsImg');
    }
    return errorMsg;
  }

  getAllTeamsAndCurApp(cb) {
    return loadAllTeams().then(teams => {
      this.setState({ teams });
      let teamID = getSelectTeamID();

      if (teams && teams.length > 0) {
        if (!teams.find(team => team.id === teamID)) {
          teamID = teams[0].id;
        }
      } else {
        teamID = null;
      }
      this.setState({ teamID });
      if (teamID) {
        loadAllTeams().then(teams => {
          this.setState({ teams });
          let teamID = getSelectTeamID();

          if (teams && teams.length > 0) {
            if (!teams.find(team => team.id === teamID)) {
              teamID = teams[0].id;
            }
          } else {
            teamID = null;
          }
          this.setState({ teamID });
          if (teamID) {
            loadApps(teamID)
              .then(apps => {
                this.setState({ apps });
                let appID = getLastSelectApp();
                if (apps && apps.length) {
                  const allApp = formatAllApp(apps);
                  if (!allApp.find(app => app._id === appID)) {
                    const selectApp = allApp.filter(item => !item.isAppSet)[0];
                    appID = selectApp && selectApp._id;
                  }
                } else {
                  appID = null;
                }
                this.setState({ appID });
                cb();
              })
              .catch(e => {
                this.showMessage(e);
                cb();
              });
          } else {
            cb();
          }
        })
        .catch(e => {
          this.showMessage(e);
          cb();
        });
      }
    });
  }

  doInitData(cb) {
    if (isLocal) {
      getAddress().then(address => {
        if (!address) {
          this.onGoToLogin();
          this.setState({ showWaiting: false });
        }
        const baseDomain =
          address + (address[address.length - 1] === '/' ? '' : '/');
        urlCfg.api = baseDomain + 'apiforapp/v1';
        urlCfg.myApp = `${baseDomain}gotomyapps`;
        urlCfg.homePage = `${baseDomain}`;
        this.getAllTeamsAndCurApp(cb);
      });
    } else {
      this.getAllTeamsAndCurApp(cb);
    }
  }

  /**
   * 跳转到登录
   */
  onGoToLogin() {
    this.setState({
      path: Routes.Login,
      user: null,
    });
  }

  onLoginSuccess(user, token, isNeedSave, address) {
    needSave(isNeedSave);
    if (isNeedSave) {
      saveAddress(address);
      saveUserInfo(user).then(() => {
        saveToken(token);
      });
    } else {
      clearCache();
    }
    this.onGoToApp(user, address);
  }

  onLogout() {
    clearCache(true);
    this.setState({
      path: Routes.Login,
      appID: null,
      apps: null,
      teams: null,
      teamID: null,
      device: null,
      email: null,
    });
  }

  onSwitchLanguage(language) {
    this.setState({ path: Routes.Init });
    const current = getCurrentLanguage();
    if (current !== language) {
      switchLanguage(language);
      initConfig().then(() => {
        this.onLogout();
      });
    }
  }

  showMessage(message) {
    const { path } = this.state;
    const msg = message instanceof Error ? message.message : message;
    this.setState({
      message: this.checkError(msg),
    });
    onTimeout(3e3)
      .then(() => {
        this.setState({
          message: null,
        });
      })
      .catch(e => {
        if (path !== Routes.Login) {
          this.setState({
            message: i18n('login.loginAgain'),
          });
        }
      });
  }

  renderContent() {
    const {
      path,
      appID,
      user,
      apps,
      device,
      teamID,
      teams,
      address,
    } = this.state;
    const { selection, documentRoot } = this.props;
    if (path === Routes.Login) {
      return (
        <LoginComp
          showMessage={this.showMessage}
          showWaiting={this.onShowWaiting}
          user={user}
          address={address}
          onLogin={this.onLoginSuccess}
        />
      );
    }
    if (path === Routes.App) {
      return (
        <AppComp
          showMessage={this.showMessage}
          showWaiting={this.onShowWaiting}
          apps={apps}
          teams={teams}
          teamID={teamID}
          device={device}
          selection={selection}
          user={user}
          appID={appID}
          documentRoot={documentRoot}
          onLogout={this.onLogout}
          onSwitchLanguage={this.onSwitchLanguage}
          ref={dom => (this.appDom = dom)}
        />
      );
    }
    if (path === Routes.Settings) {
      return (
        <SettingPanel
          isShow={true}
          currentLanguage={getCurrentLanguage()}
          onLanguageChanged={this.onSwitchLanguage}
          onClose={() => {
            this.setState({ path: Routes.Login });
          }}
        />
      );
    }
    return (
      <InitComp
        showMessage={this.showMessage}
        onGoToApp={this.onGoToApp}
        onGoToLogin={this.onGoToLogin}
      />
    );
  }

  onCloseApp() {
    this.props.dialog.close();
  }

  onMainClick() {
    this.setState({ message: null });
    if (this.appDom) {
      this.appDom.hideAllPopup();
    }
  }

  onShowWaiting(value) {
    this.setState({ showWaiting: value });
  }

  render() {
    return (
      <div className="app" ref={dom => (this.mainDom = dom)}>
        {this.renderContent()}
        {this.state.message && (
          <div className="msg-box">
            <div>
              <div>
                <span>{this.state.message}</span>
              </div>
            </div>
          </div>
        )}

        <div className="close-app" title={i18n('main.close')}>
          <img
            onClick={this.onCloseApp}
            src="/images/icons/close.png"
            alt="Close App"
          />
        </div>
        {!isLocal && (
          <div
            className={`setting-app ${
              this.state.path === Routes.Login ? 'visible' : ''
            }`}
            title={i18n('main.settings')}
          >
            <img
              onClick={() => {
                this.setState({ path: Routes.Settings });
              }}
              src="/images/icons/setting.png"
              alt="Setting App"
            />
          </div>
        )}
        <Waiting isShow={this.state.showWaiting} />
      </div>
    );
  }
}

module.exports = Main;
