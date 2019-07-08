const React= require('react');
const { i18n } = require('../../i18n');
const isWin=require('../../utils/isWin.js');
require('./Waiting.scss');


const Waiting = ({ text, isShow }) => {
  if (!isShow) {
    return null;
  }
  return (
    <div className="c-wait-panel">
      <div className="content">
        <span className={isWin&&"tip"}>{i18n('main.waiting')}</span>
      </div>
    </div>
  );
};

Waiting.propTypes = {};
Waiting.defaultProps = {};

module.exports = Waiting;
