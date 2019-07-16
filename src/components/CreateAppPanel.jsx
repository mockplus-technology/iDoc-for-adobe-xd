const React = require('react');
const { Menu } = require('./common');
const ListBox = require('./common/ListBox.jsx');
const RadioGroup = require('./common/RadioGroup.jsx');
const { i18n } = require('../i18n');

require('./CreateAppPanel.scss');
let scenegraph = require('scenegraph');
/**
 * 创建项目面板
 */

class CreateAppPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appType: 'phone',
      appSetID: null,
      appSetName: i18n('app.selectAppSet'),
      showAppSetPanel: false,
      appName: scenegraph.selection.focusedArtboard
        ? scenegraph.selection.focusedArtboard.name
        : '',
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentDidMount() {
    this.inputTitle.focus();
  }
  onInputChange(e) {
    this.setState({ appName: e.target.value });
  }

  onSubmit() {
    const { appName, appType, appSetID } = this.state;
    this.setState({ appName: '' });
    this.props.onCreate({ name: appName, appType, appSetID });
  }

  render() {
    if (!this.props.visible) {
      return null;
    }
    const { appSetList, selApp } = this.props;
    const { showAppSetPanel, appSetName, appSetID } = this.state;
    let appSetListData = appSetList.map(item => {
      return { name: item.name, id: item._id };
    });
    appSetListData.unshift({ name: i18n('app.noSelectAppSet'), id: '' });
    let selectAppSet;
    if (selApp) {
      selectAppSet = appSetList.find(item => item._id === selApp.appSetID);
    }
    if (selectAppSet && appSetID === null) {
      this.setState({
        appSetID: selectAppSet._id,
        appSetName: selectAppSet.name,
      });
    }

    return (
      <div className="create-panel" onClick={this.props.onClose}>
        <div
          className="content"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <img
            className="back-img"
            src="/images/icons/close.png"
            onClick={this.props.onClose}
          />
          <input
            className="app-name"
            placeholder={i18n('app.projectName')}
            value={this.state.appName}
            onChange={this.onInputChange}
            ref={el => {
              this.inputTitle = el;
            }}
          />
          <div
            className="select-appSet"
            onClick={e => {
              e.stopPropagation();
              this.setState({ showAppSetPanel: !showAppSetPanel });
            }}
          >
            <span>{appSetName}</span>
            <img src="/images/icons/arrow.png" className="arrow" />
          </div>
          <RadioGroup
            value={this.state.appType}
            items={[
              { text: i18n('app.phoneProject'), value: 'phone' },
              { text: i18n('app.webProject'), value: 'web' },
            ]}
            onChange={value => {
              this.setState({ appType: value });
            }}
          />
          <button onClick={this.onSubmit} className="app-btn">
            {i18n('app.create')}
          </button>
          <button onClick={this.props.onClose} className="app-btn">
            {i18n('app.cancel')}
          </button>
          <div className="appSet-list">
            {showAppSetPanel && (
              <ListBox
                maxHeight={240}
                Selected={appSetID}
                onSelected={item => {
                  this.setState({
                    appSetName: item.name,
                    appSetID: item.id,
                    showAppSetPanel: false,
                  });
                }}
                items={appSetListData}
                labelFunction={device => device.name || '-'}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = CreateAppPanel;
