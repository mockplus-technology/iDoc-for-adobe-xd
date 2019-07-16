const React = require('react');

require('./ListBox.scss');

/**
 * 列表框
 * @param items
 * @param onSelected
 * @param labelFunction
 * @returns {*}
 * @constructor
 */
const ListBox = ({
  items,
  onSelected,
  labelFunction,
  maxHeight = 300,
  Selected,
}) => {
  let height = 0;
  if (items && items.length > 0) {
    height = items.length * 30;
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
            if (text === '-') {
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
                          ? 'selected-item'
                          : null
                      }`}
                      onClick={e => {
                        // onSelected(item)
                        e.stopPropagation();
                      }}
                    >
                      <span>{text}</span>
                    </li>
                    {item.appSets.map(appItem => (
                      <li
                        className={`${
                          Selected && Selected === appItem.id
                            ? 'selected-item'
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
                    Selected && Selected === item.id ? 'selected-item' : null
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
};

module.exports = ListBox;
