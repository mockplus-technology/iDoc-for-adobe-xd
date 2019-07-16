const { initResource } = require('../i18n');
const { initUrl } = require('../utils/urlUtils');

async function initConfig() {
  return initResource().then(() => {
    return initUrl();
  });
}

module.exports = initConfig;