const React = require('react');
const RadioGroup = require('./common/RadioGroup.jsx');
const Waiting = require('./AppComs/Waiting.jsx');
const urlUtils = require('../utils/urlUtils');
const { isLocal } = require('../utils/env')
const { truncate } = require('../utils/projectsFormat')
const { addNewCopy, CoverCopy, getAllCopy } = require('../utils/apis');
const { i18n } = require('../i18n');
require('./stateListMenu.scss');

class StateListMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      uploadType: 'add',
      selectID: '',
      selectItem: { id: '', name: '' },
      defaultName: '',
      progress: null,
      visible: false,
      imgSrc: '',
      isWating: true,
    };
    this.renderMain = this.renderMain.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onUploadStateImg = this.onUploadStateImg.bind(this);
    this.popupMessage = this.popupMessage.bind(this);
    this.getStateListCol = this.getStateListCol.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.newStateItem).length !== 0) {
      this.setState({ isWating: false });
    }
  }

  onSelect(item) {
    this.setState({ selectItem: item });
    this.setState({ defaultName: item.name });
  }

  popupMessage(message) {
    const { showMessage } = this.props;
    if (showMessage) {
      showMessage(message);
    }
  }

  onUploadStateImg(e) {
    const { selectItem, uploadType, defaultName } = this.state;
    const { stateList, getNewStateList, newStateItem, showUploadTip } = this.props;
    const data = {
      appID: newStateItem.appID,
      clientID: newStateItem.clientID,
      clientHash: newStateItem.clientHash,
      source: newStateItem.source,
      device: newStateItem.device,
      version: newStateItem.version,
      artboardData: {
        positionX: newStateItem.position.x,
        positionY: newStateItem.position.y,
      },
      fileRes: {
        image: { URL: newStateItem.imageURL },
        data: { URL: newStateItem.jsonURL },
      },
      size: newStateItem.size,
      name: uploadType === 'add' ? defaultName : stateList.filter(item => selectItem._id === item._id)[0].name,
    };
    if (uploadType === 'add') {
      addNewCopy(data)
        .then(res => {
          this.props.onClose(e);
          showUploadTip();
        })
        .then(() => {
          getAllCopy(data.appID, data.clientID).then(res => {
            getNewStateList(res);
          });
        })
        .catch(e => {
          this.popupMessage(e);
        });
    } else {
      CoverCopy(data, selectItem._id)
        .then(() => {
          this.props.onClose(e);
          showUploadTip();
        })
        .then(() => {
          getAllCopy(data.appID, data.clientID).then(res => {
            getNewStateList(res);
          });
        })
        .catch(e => {
          this.popupMessage(e);
        });
    }
  }

  getStateListCol() {
    const { stateList } = this.props;
    const { selectItem } = this.state;
    const result = [];
    const { urlCfg } = urlUtils;
    let newHomePage = '';
    if (isLocal) {
      newHomePage = urlCfg.homePage.slice(0, -1);
    }

    for (let i = 0; i < stateList.length; i += 3) {
      result.push(stateList.slice(i, i + 3));
    }
    return result.map((item, index) => (
      <div className="state_list_col" key={index}>
        {item.map(childItem => (
          <div
            className={`state_img_item 
              ${childItem._id === selectItem._id ? 'state_img_item_select' : ''}`}
            key={childItem._id}
            onClick={() => {
              if (childItem._id === selectItem._id) {
                this.setState({ selectItem: { id: '', name: '' }, defaultName: '' });
              } else {
                this.onSelect(childItem);
              }
            }}
            onDoubleClick={() => {
              this.setState({ visible: true, imgSrc: newHomePage + childItem.imageURL });
            }}
          >
            <img src={newHomePage + childItem.imageURL} className="state_img" />
            {truncate(childItem.name)}
          </div>
        ))}
      </div>
    ));
  }

  renderMain() {
    const { uploadType, defaultName } = this.state;
    if (uploadType === 'cover') {
      return this.getStateListCol();
    } else {
      return (
        <input
          type="text"
          className={'add_state_img_name'}
          onChange={e => {
            this.setState({ defaultName: e.target.value });
          }}
          value={defaultName}
          placeholder={i18n('multiStatus.newStatusNamePH')}
        />
      );
    }
  }

  render() {
    const { visible, imgSrc, isWating } = this.state;
    if (isWating) {
      return <Waiting isShow={isWating} />;
    }
    if (visible) {
      return (
        <div className="c-state-tip">
          <div className="content">
            <img
              className="back-img"
              src="/images/icons/close.png"
              onClick={() => {
                this.setState({ visible: false });
              }}
            />
            <div style={{ marginTop: '20px', height: '330px', overflow: 'scroll' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img style={{ width: '80%' }} src={imgSrc} alt="" />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="c-state-tip">
          <div className="content">
            <img className="back-img" src="/images/icons/close.png" onClick={this.props.onClose} />
            <div>
              <p>{i18n('multiStatus.multiStatusPageTip')}</p>
              <RadioGroup
                value={this.state.uploadType}
                items={[
                  {
                    text: i18n('multiStatus.overridePageRadio'),
                    value: 'cover',
                  },
                  {
                    text: i18n('multiStatus.newStatusPageRadio'),
                    value: 'add',
                  },
                ]}
                onChange={value => {
                  this.setState({ uploadType: value });
                }}
              />
              <div className="state_img_box">{this.renderMain()}</div>
              <button className="upload_state_img_btn" onClick={this.onUploadStateImg}>
                {i18n('multiStatus.uploadStatusPage')}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}

module.exports = StateListMenu;
