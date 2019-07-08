const React = require("react");
const { i18n } = require("../../i18n");

require("./AppListBox.scss");

class AppListBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectAppSetID: props.Selected.appSetID
    };
    this.handleWindowClick = this.handleWindowClick.bind(this);
  }

  handleWindowClick(e) {
    this.props.onDismissMenu();
  }

  render() {
    const {
      items,
      onSelected,
      labelFunction,
      maxHeight = 300,
      Selected
    } = this.props;
    const { selectAppSetID } = this.state;
    let height = 0;
    if (items && items.length > 0) {
      if( items.length === 1) {
        height = items[0].appSets.length?(items[0].appSets.length + 1) * 30 :30 
      }
      else{
        height = items.length * 30;
      }
    } else {
      return null;
    }

    height = Math.min(maxHeight, height + 12);
    return (
      <div className="c-list-box" style={{ height }}>
        <ul>
          {items &&
            items.map(item => {
              const text = labelFunction(item);
              if (text === "-") {
                return (
                  <li
                    className="separator"
                    onClick={e => {
                      e.stopPropagation();
                    }}
                  />
                );
              } else {
                if (item.isAppSet) {
                  return (
                    <div>
                      <li
                        className={`${
                          Selected && Selected === item.id
                            ? "selected-item"
                            : null
                        }`}
                        onClick={e => {
                          this.setState({
                            selectAppSetID: item._id
                          });
                          e.stopPropagation();
                        }}
                      >
                        {/* */}
                        <img
                          src={`${
                            selectAppSetID === item._id
                              ? "../../../images/icons/spread-bottom.png"
                              : "../../../images/icons/spread-left.png"
                          }`}
                          alt=""
                          className="spread-icon"
                        />
                        <span>{text}</span>
                      </li>
                      {selectAppSetID === item._id &&
                        item.appSets.map(appItem => (
                          <li
                            className={`app-set-app-item ${
                              Selected && Selected._id === appItem._id
                                ? "selected-item"
                                : null
                            }`}
                            onClick={e => {
                              onSelected(appItem);
                              e.stopPropagation();
                            }}
                          >
                            <span>{appItem.name}</span>
                          </li>
                        ))}
                    </div>
                  );
                }
                return (
                  <li
                    className={`${
                      Selected && Selected._id === item._id
                        ? "selected-item"
                        : null
                    }`}
                    onClick={e => {
                      onSelected(item);
                      e.stopPropagation();
                    }}
                  >
                    <span>{text}</span>
                  </li>
                );
              }
            })}
        </ul>
      </div>
    );
  }
}

module.exports = AppListBox;
