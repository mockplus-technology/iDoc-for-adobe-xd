const React = require('react');

require('./RadioGroup.scss');

class RadioGroup extends React.Component {
  render() {
    return (
      <div
        className="c-radio-group"
      >
        {
          this.props.items.map(item => {
            return (
              <div className="item" onClick={() => {
                this.props.onChange(item.value);
              }}>
                <div className={`radio-icon ${this.props.value === item.value ? 'selected' : ''}`}></div>
                <span>{item.text}</span>
              </div>
            )
          })
        }
      </div>
    );
  }
}


module.exports = RadioGroup;
