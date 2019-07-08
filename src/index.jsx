//  temporary stubs required for React. These will not be required as soon as the XD environment provides setTimeout/clearTimeout
const reactShim = require("./react-shim");
const React = require('react');
const ReactDOM = require("react-dom");

const Main = require('./components/Main.jsx');

let dialog;

function getDialog(selection, documentRoot) {
  if (dialog == null) {
    dialog = document.createElement("dialog");
    dialog.style.padding = 0;
  }
  ReactDOM.render(<div className="main">
    <Main
      dialog={dialog}
      selection={selection}
      documentRoot={documentRoot} />
  </div>, dialog);
  return dialog
}

module.exports = {
  commands: {
    menuCommand: function (selection, documentRoot) {
      const dialog = getDialog(selection, documentRoot);
      return document.body.appendChild(dialog).showModal();
    }
  }
};