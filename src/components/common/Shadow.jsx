const React = require('react');

require('./Shadow.scss');

class Shadow extends React.Component {
  render() {
    return (
      <div>
        <img className="shadow-top" src="/images/shadow/top.png" />
        <img className="shadow-bottom" src="/images/shadow/bottom.png" />
        <img className="shadow-left" src="/images/shadow/left.png" />
        <img className="shadow-right" src="/images/shadow/right.png" />
      </div>
    );
  }
}

module.exports = Shadow;
