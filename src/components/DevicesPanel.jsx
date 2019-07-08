const React = require('react');

const ListBox = require('./common/ListBox.jsx');

require('./DevicesPanel.scss');

/**
 * 团队选择面板
 * @param teams
 * @param onSelected
 * @param onClose
 * @param visible
 * @returns {*}
 * @constructor
 */
class DevicesPanel extends React.Component {
  render() {
    const { devices, onSelected, onClose, visible } = this.props;
    if (!visible) {
      return <div />;
    }
    return (
      <div className="c-devices-panel"
           onClick={onClose}
      >
        <ListBox
          maxHeight={240}
          onSelected={onSelected}
          items={devices}
          labelFunction={device => device.name || '-'} />
      </div>
    )
  }
}

module.exports = DevicesPanel;