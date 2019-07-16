const React = require('react');
const { login, saveToken, getQRCode, checkWXLoginResult, onTimeout } = require('../utils/apis');
const { i18n } = require('../i18n');
const { isLocal } = require('../utils/env');
const { urlCfg, saveAddress } = require('../utils/urlUtils');
const { getCurrentLanguage, zh_CN } = require('../utils/languageUtils');
require('./Login.scss');

const stars = '***********************************************';

/**
 * 用户登录界面
 */

class Login extends React.Component {
  constructor(props) {
    super(props);
    const user = props.user || {};
    const email = user.email || '';
    const address = props.address || '';
    this.state = {
      email: email.replace('(微信已绑定)', '') || '',
      password: null || '',
      passwordChar: null || '',
      saveUserInfo: getCurrentLanguage() === zh_CN,
      useWeChatLogin: false,
      qrCodeURL: '',
      ticket: '',
      enabled: true,
      address: address,
    };
    this.renderLoginForm = this.renderLoginForm.bind(this);
    this.renderLoginBottom = this.renderLoginBottom.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onCheckboxChanged = this.onCheckboxChanged.bind(this);
    this.onGetWechatQRCode = this.onGetWechatQRCode.bind(this);
    this.onLoginWithAccount = this.onLoginWithAccount.bind(this);
    this.onEnterKeyDown = this.onEnterKeyDown.bind(this);
    this.startCheckWxLogin = this.startCheckWxLogin.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.setAddress = this.setAddress.bind(this);
  }

  setAddress(e) {
    const address = e.target.value;
    address && saveAddress(address)
  }

  handleLogin() {
    const { email, passwordChar, saveUserInfo, address } = this.state;
    const { onLogin } = this.props;
    if (email && passwordChar) {
      this.setState({ enabled: false }, () => {
        this.props.showWaiting(true);
        login({ email, password: passwordChar })
          .then(res => {
            const { user, token } = res;
            saveToken(token);
            this.setState({ enabled: true });
            onLogin(user, token, saveUserInfo, address);
          })
          .catch(e => {
            this.props.showWaiting(false);
            this.props.showMessage(e);
            this.setState({ enabled: true });
          });
      });
    }
  }

  onEnterKeyDown(e) {
    if (e.key === 'Enter' || e.key === '\u0003') {
      this.handleLogin();
    }
  }

  onEmailChange(e) {
    this.setState({ email: e.target.value.trim() });
  }

  onPasswordChange(e) {
    const value = e.target.value;
    let { passwordChar } = this.state;
    if (passwordChar.length > value.length) {
      passwordChar = passwordChar.substr(0, value.length);
    } else {
      passwordChar += value.substr(passwordChar.length);
    }
    this.setState({ password: value, passwordChar });
  }

  onCheckboxChanged() {
    const { saveUserInfo } = this.state;
    this.setState({ saveUserInfo: !saveUserInfo });
  }

  onGetWechatQRCode() {
    this.setState({
      useWeChatLogin: true,
    });
    getQRCode()
      .then(qrCodeInfo => {
        this.setState({
          qrCodeURL: qrCodeInfo.QRCodeURL,
          ticket: qrCodeInfo.ticket,
        });
        this.checkCount = 0;
        this.startCheckWxLogin();
      })
      .catch(e => {
        this.props.showMessage(e);
      });
  }

  startCheckWxLogin() {
    if (!this.state.ticket) {
      return;
    }
    // 检查次数太多，放弃
    if (this.checkCount > 100) {
      return;
    }
    this.checkCount = this.checkCount + 1;
    //setTimeout 其实会立即执行，所以是在后端的接口中设置了延时返回，相当于长连接了
    checkWXLoginResult(this.state.ticket)
      .then(res => {
        if (res.wxCode === 0) {
          onTimeout(3e3)
            .then(() => {
              this.startCheckWxLogin();
            })
            .catch(e => {
              this.props.showMessage(e);
            });
          return;
        }
        const { saveUserInfo } = this.state;
        const { user, token } = res;
        saveToken(token);
        this.props.onLogin(user, token, saveUserInfo);
      })
      .catch(e => {
        this.props.showMessage(e);
      });
  }

  stopCheckWxLogin() {
    this.setState({
      ticket: '',
    });
  }

  onLoginWithAccount() {
    this.setState({
      useWeChatLogin: false,
      ticket: '',
      qrCodeURL: '',
    });
  }
  
  onAddressChange(e) {
    let address = e.target.value.trim();
   
    this.setState({ address: address }, () => {
      saveAddress(address);
    });
  }

  renderLoginForm() {
    const { email, password, address } = this.state;
    const disabled = !email || !password || !this.state.enabled;
    return (
      <div className="login-form">
        {isLocal && (
          <input
            placeholder={i18n('login.domainAddress')}
            id="address"
            value={address ? address : ''}
            onChange={this.onAddressChange}
            onKeyDown={this.onEnterKeyDown}
          />
        )}
        <input
          placeholder={i18n('login.account')}
          value={email}
          onChange={this.onEmailChange}
          onKeyDown={this.onEnterKeyDown}
        />
        <input
          type="text"
          placeholder={i18n('login.password')}
          value={stars.substr(0, password.length)}
          onChange={this.onPasswordChange}
          onKeyDown={this.onEnterKeyDown}
        />
        <button disabled={disabled} onClick={this.handleLogin}>
          {i18n('login.signIn')}
        </button>
      </div>
    );
  }

  renderLoginBottom() {
    const { address } = this.state;
    const { register, forgotPassword, tutorial } = urlCfg;
    if (isLocal) {
      return (
        <div className="login-bottom">
          {!address ? (
            <span
              onClick={e => {
                e.stopPropagation();
                this.props.showMessage(i18n('login.addressTip'));
              }}
            >
              {i18n('login.register')}
            </span>
          ) : (
            <a href={register}>{i18n('login.register')}</a>
          )}
          {!address ? (
            <span
              onClick={e => {
                e.stopPropagation();
                this.props.showMessage(i18n('login.addressTip'));
              }}
            >
              {i18n('login.forgotPassword')}
            </span>
          ) : (
            <a href={forgotPassword}>{i18n('login.forgotPassword')}</a>
          )}
          {!address ? (
            <span
              onClick={e => {
                e.stopPropagation();
                this.props.showMessage(i18n('login.addressTip'));
              }}
            >
              {i18n('login.tutorial')}
            </span>
          ) : (
            <a href={tutorial}>{i18n('login.tutorial')}</a>
          )}
        </div>
      );
    } else {
      return (
        <div className="login-bottom">
          <a href={urlCfg.register}>{i18n('login.register')}</a>
          <a href={urlCfg.forgotPassword}>{i18n('login.forgotPassword')}</a>
          <a href={urlCfg.tutorial}>{i18n('login.tutorial')}</a>
        </div>
      );
    }
  }
  render() {
    const { saveUserInfo } = this.state;
    const isZh = getCurrentLanguage() === zh_CN;
    return (
      <div className="login-panel">
        <div className="login-logo">
          <img src="/images/logo/240.png" alt="Mockplus iDoc" />
        </div>
        {this.renderLoginForm()}
        <div className="save-user-info">
          <div>
            <input
              ref={el => el && el.addEventListener('change', this.onCheckboxChanged)}
              type="checkbox"
              checked={saveUserInfo}
            />
            <span onClick={this.onCheckboxChanged}>{i18n('login.autoLogin')}</span>
          </div>
        </div>
        {isZh && !isLocal && (
          <div className="wechat-account">
            <span onClick={this.onGetWechatQRCode}>{i18n('login.wechat')}</span>
          </div>
        )}
        {this.renderLoginBottom()}
      </div>
    );
  }
}

module.exports = Login;
