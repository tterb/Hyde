'use strict';
const Config = require('electron-config');

module.exports = new Config({
  defaults: {
    darkMode: true,
    isSyncScroll: false,
    isHtml: false
  }
});
