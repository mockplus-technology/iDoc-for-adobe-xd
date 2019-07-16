const React = require('react');
const { i18n } = require('../../i18n');

require('./Menu.scss');

class Menu extends React.Component {
  constructor() {
    super();
    this.handleWindowClick = this.handleWindowClick.bind(this);
  }

  componentDidMount() {
    window.addEventListener('click', this.handleWindowClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowClick);
  }

  handleWindowClick(e) {
    this.props.onDismissMenu();
  }

  render() {
    const { items, isShow, onItemClick } = this.props;
    if (!isShow) {
      return null;
    }
    return (
      <div className="c-menu">
        <ul
          onClick={e => {
            e.stopPropagation();
          }}
        >
          {items &&
            items.map(menu => {
              const type = menu.type || 'text';
              return (
                <li
                  className={`${type === 'text' ? 'menu-item' : 'separator'}`}
                  onClick={() => {
                    onItemClick(menu);
                  }}
                >
                  {type === 'text' ? i18n(`menu.${menu.id}`) : ''}
                </li>
              );
            })}
        </ul>
      </div>
    );
  }
}

module.exports = Menu;
