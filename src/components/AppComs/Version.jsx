const React = require('react');
const shell = require('uxp').shell;
const { checkUpdate } = require('../../utils/apis');
const { version } = require('../../utils/env');
const { i18n } = require('../../i18n');
const { urlCfg } = require('../../utils/urlUtils');


require('./Version.scss');

class Version extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewVersion: true,
      newVersion: null,
    };
  }

  componentDidMount() {
    checkUpdate()
      .then(res => {
        // 有更新
        if (res.code === 1) {
          this.setState({
            newVersion: res.payload,
          });
        }
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    if (this.state.newVersion) {
      return (
        <a className="has-new-version" href={ urlCfg.homePage.slice(0,urlCfg.homePage.length-1)+this.state.newVersion.downloadURL}>
          {i18n('upgrade.newVersion')}
        </a>
      );
    }
    return (
      <span className="version-number" onClick={()=>{ shell.openExternal(urlCfg.homePage)}}>
        {i18n('upgrade.currentVersion', version)}
      </span>
    );
  }
}

module.exports = Version;
