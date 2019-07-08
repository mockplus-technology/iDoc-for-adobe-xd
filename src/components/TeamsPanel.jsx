const React = require('react');

const ListBox = require('./common/ListBox.jsx');

require('./TeamsPanel.scss');

/**
 * 团队选择面板
 * @param teams
 * @param onSelected
 * @param onClose
 * @param visible
 * @returns {*}
 * @constructor
 */
const TeamsPanel = ({teams, onSelected, onClose, visible,newTeamID}) => {

  if(!visible){
    return <div/>;
  }
  return (
    <div className="c-teams-panel" onClick={onClose}>
      <ListBox onSelected={onSelected} items={teams} labelFunction={team=>team.name} Selected={newTeamID}/>
    </div>
  )

}

module.exports = TeamsPanel;