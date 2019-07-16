const React = require('react');
const Menu = require('./Menu.jsx');

require('./Selector.scss');

class Selector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropDown: false,
    };
    this.getValue = this.getValue.bind(this);
    this.handleMenuSelected = this.handleMenuSelected.bind(this);
    this.handlePopup = this.handlePopup.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
  }

  componentDidMount() {
    if (this.selector) {
      const index = this.props.options.findIndex(
        item => item === this.props.value,
      );
      this.selector.setAttribute('selectedOptions', [
        this.selector.childNodes[index],
      ]);
    }
    window.addEventListener('click', this.handleWindowClick);
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowClick);
  }

  getValue(value) {
    const { labelFunction } = this.props;
    if (labelFunction && value) {
      return labelFunction(value);
    }
    return value;
  }

  handleWindowClick(e) {
    if (!this.clickMe) {
      this.setState({ dropDown: false });
    }
    this.clickMe = false;
  }

  handleMenuSelected(e) {
    const { onSelected } = this.props;
    onSelected(e.target.value);
    this.setState({ dropDown: false });
  }

  handlePopup() {
    this.setState({ dropDown: !this.state.dropDown });
  }

  render() {
    const { options, value } = this.props;
    return (
      <div className="c-selector">
        <select
          uxpQuiet="false"
          selectedIndex={options.findIndex(item => item === value)}
          ref={dom => (this.selector = dom)}
          onChange={this.handleMenuSelected}
        >
          {options &&
            options.map(item => {
              return <option value={item}>{this.getValue(item)}</option>;
            })}
        </select>
        {/*<div className="selector-label">*/}
        {/*<span>{this.getValue(value)}</span>*/}
        {/*</div>*/}
      </div>
    );
  }
}

module.exports = Selector;
