const React = require('react');
const RadioGroup = require('./common/RadioGroup.jsx');

const { languageList } = require('../utils/languageUtils');
const {i18n} = require('../i18n');

require('./SettingPanel.scss');

class SettingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: props.currentLanguage
    }
  }

  render() {
    const { onLanguageChanged, isShow } = this.props;
    if (!isShow) {
      return <div/>;
    }
    const languages = languageList.map(language =>
      ({ text: language.name, value: language.key }));

    return (
      <div className="c-setting-panel" onClick={(e) => {e.stopPropagation()}}>
        <div className="content">
          <div className="language">
            <div className="language-title">
              <span>{i18n('setting.chooseVersion')}</span>
            </div>
            <div className="language-list">
              <RadioGroup
                items={languages}
                value={this.state.language}
                onChange={(value) => {
                  this.setState({ language: value });
                }}
              />
              <button onClick={() => {
                onLanguageChanged(this.state.language);
              }}>
                {
                  i18n('setting.ok')
                }
              </button>
            </div>
          </div>
          <div className="version-tips">
            <div>
              <span>{i18n('setting.noteCH')}</span>
            </div>
            <div>
              <span>{i18n('setting.noteEN')}</span>
            </div>
          </div>
          <div className="bottom">
            <span onClick={this.props.onClose}>{i18n('setting.back')}</span>
          </div>
        </div>
      </div>
    );
  }
}

SettingPanel.propTypes = {};
SettingPanel.defaultProps = {};

module.exports = SettingPanel;
