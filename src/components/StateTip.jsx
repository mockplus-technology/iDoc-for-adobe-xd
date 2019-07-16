const React = require('react');

require('./stateTip.scss');
const { i18n } = require('../i18n');
class StateTip extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { visible } = this.props;
    if (!visible) {
      return null;
    }
    return (
      <div className="c-state-tip">
        <div className="content">
          <img
            className="back-img"
            src="/images/icons/close.png"
            onClick={this.props.onClose}
          />
          <p>{i18n('multiStatus.handleStatusPageTip1')}</p>
          <p>{i18n('multiStatus.handleStatusPageTip2')}</p>
        </div>
      </div>
    );
  }
}

module.exports = StateTip;
