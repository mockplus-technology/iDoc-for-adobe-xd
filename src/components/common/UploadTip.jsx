const React = require('react');
const shell = require('uxp').shell;
require('./UploadTip.scss');
const { i18n } = require('../../i18n');
class UploadTip extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
 
    const { num, url, onClose } = this.props;
    console.log('url',url)
    return (
      <div className="c-upload-tip">
        <div className="content">
          <img
            className="back-img"
            src="/images/icons/close.png"
            onClick={() => {
              onClose();
            }}
          />
          {num ? (
            <p>{i18n('app.uploadSuccess', num)}</p>
          ) : (
            <p>{i18n('multiStatus.uploadSucMsg')}</p>
          )}
          <button
            className="small-btn"
            onClick={() => {
              shell.openExternal(url);
              onClose();
            }}
          >
            {i18n('app.seeProject')}
          </button>
        </div>
      </div>
    );
  }
}

module.exports = UploadTip;
