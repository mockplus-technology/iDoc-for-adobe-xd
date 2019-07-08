const React = require('react');

require('./Progress.scss');

class Progress extends React.Component {
  render() {
    if (!this.props.progress) {
      return null;
    }
    return (<div className="progress">
      <div className="content">
        <div className="inner-content">
          <p>{`${this.props.progress.progress}%`}</p>
          <div className="track">
            <div className="slider" style={{width: `${this.props.progress.progress}%`}}/>
          </div>
          <div className="message-info">
            <span>{this.props.progress.message}</span>
          </div>
        </div>
      </div>
    </div>);
  }
}

module.exports = Progress;