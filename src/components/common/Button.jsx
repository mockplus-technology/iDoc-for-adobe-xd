const React = require('react');

require('./Button.scss');

const Button = ({ text, disabled, onClick, theme = 'red' }) => {
  let cls = `c-button ${theme}`;
  if (disabled) {
    cls = `${cls} disabled`;
  }
  return (
    <div className={cls} onClick={onClick}>
      {text}
    </div>
  );
};

module.exports = Button;
