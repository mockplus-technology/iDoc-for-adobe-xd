const React = require("react");
const AppListBox = require("./common/AppListBox.jsx");

require("./AppsPanel.scss");

/**
 * 项目选择面板
 * @param teams
 * @param onSelected
 * @param onClose
 * @param visible
 * @returns {*}
 * @constructor
 */
const AppsPanel = ({ apps, onSelected, onClose, visible, Selected }) => {
  if (!visible) {
    return <div />;
  }

  return (
    <div className="c-apps-panel" onClick={onClose}>
      <AppListBox
        Selected={Selected}
        onSelected={onSelected}
        items={apps}
        labelFunction={app => app.name}
      />
    </div>
  );
};

module.exports = AppsPanel;
