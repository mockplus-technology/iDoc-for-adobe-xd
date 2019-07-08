const React = require('react');

const { checkUpdate, } = require('../../utils/apis');
const { version } = require('../../utils/env');
const { i18n } = require('../../i18n');

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
    console.log('正在检查更新');
    checkUpdate().then(res => {
      // 有更新
      if (res.code === 1) {
        this.setState({
          newVersion: res.payload,
        });
      }
    }).catch(e => {
      console.log(e);
    });
  }

  render() {
    if (this.state.newVersion) {
      return <a className="has-new-version" href={this.state.newVersion.downloadURL}>{i18n('upgrade.newVersion')}</a>;
    }
    return (<span className="version-number">{i18n('upgrade.currentVersion', version)}</span>);
  }
}

module.exports = Version;
