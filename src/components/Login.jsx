const React = require('react');
const { login, saveToken, getQRCode, checkWXLoginResult, onTimeout, } = require('../utils/apis');
const { i18n } = require('../i18n');
const { urlCfg } = require('../utils/urlUtils');
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
    this.state = {
      email: email.replace('(微信已绑定)', '') || '',
      password: null || '',
      passwordChar: null || '',
      saveUserInfo: getCurrentLanguage() === zh_CN,
      useWeChatLogin: false,
      qrCodeURL: '',
      ticket: '',
      enabled: true,
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onCheckboxChanged = this.onCheckboxChanged.bind(this);
    this.onGetWechatQRCode = this.onGetWechatQRCode.bind(this);
    this.onLoginWithAccount = this.onLoginWithAccount.bind(this);
    this.onEnterKeyDown = this.onEnterKeyDown.bind(this);
    this.startCheckWxLogin = this.startCheckWxLogin.bind(this);
  }

  handleLogin() {
    const { email, passwordChar, saveUserInfo } = this.state;
    const { onLogin } = this.props;
    if (email && passwordChar) {

      // 禁止重复提交
      this.setState({ enabled: false }, () => {
        this.props.showWaiting(true);
        login({ email, password: passwordChar }).then((res) => {
          const { user, token } = res;
          saveToken(token);
          this.setState({ enabled: true });
          onLogin(user, token, saveUserInfo);
        }).catch(e => {
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
    this.setState({ email: e.target.value.trim(), });
  }

  onPasswordChange(e) {
    const value = e.target.value;

    let { passwordChar } = this.state;
    if (passwordChar.length > value.length) {
      passwordChar = passwordChar.substr(0, value.length);
    } else {
      passwordChar += value.substr(passwordChar.length);
    }
    this.setState({ password: value, passwordChar })
  }

  onCheckboxChanged() {
    const {saveUserInfo} = this.state
    this.setState({ saveUserInfo: !saveUserInfo});
  }

  onGetWechatQRCode() {
    this.setState({
      useWeChatLogin: true,
    });
    getQRCode().then(qrCodeInfo => {
      this.setState({
        qrCodeURL: qrCodeInfo.QRCodeURL,
        ticket: qrCodeInfo.ticket,
      });
      this.checkCount = 0;
      this.startCheckWxLogin();
    }).catch(e => {
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
    checkWXLoginResult(this.state.ticket).then(res => {
      if (res.wxCode === 0) {
        onTimeout(3e3).then(() => {
          this.startCheckWxLogin();
        }).catch(e => {
          this.props.showMessage(e);
        });
        return;
      }
      const { saveUserInfo } = this.state;
      const { user, token } = res;
      saveToken(token);
      this.props.onLogin(user, token, saveUserInfo);
    }).catch(e => {
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

  render() {
    const { email, password, saveUserInfo, } = this.state;
    const disabled = !email || !password || !this.state.enabled;
    const language = getCurrentLanguage();
    if (this.state.useWeChatLogin && language === zh_CN) {
      return (<div className="login-by-wx">
        <div className="qr-code">
          <img src={this.state.qrCodeURL} alt={i18n('login.qrCode')}/>
          <p>{i18n('login.qrCode')}</p>
        </div>
        <div className="bottom">
          <span onClick={this.onLoginWithAccount}>{i18n('login.back')}</span>
        </div>
      </div>);
    }
    return (
      <div className="login-panel">
        <div className="login-logo">
          <img src="/images/logo/240.png" alt="Mockplus iDoc"/>
        </div>
        <div className="login-form">
          <input placeholder={i18n('login.account')}
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
          <button disabled={disabled} onClick={this.handleLogin}>{i18n('login.signIn')}</button>
        </div>
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
        {
          language === zh_CN &&
          <div className="wechat-account">
            <span onClick={this.onGetWechatQRCode}>{i18n('login.wechat')}</span>
          </div>
        }
        <div className="login-bottom">
          <a href={urlCfg.register}>{i18n('login.register')}</a>
          <a href={urlCfg.forgotPassword}>{i18n('login.forgotPassword')}</a>
          <a href={urlCfg.tutorial}>{i18n('login.tutorial')}</a>
        </div>
      </div>
    );
  }
}

module.exports = Login;