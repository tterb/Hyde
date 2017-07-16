
/* Settings:
 *
 * showToolbar
 * showMenu
 * editorTheme
 * lineNumbers
 * lineWrapping
 * autoCloseBrackets
 *
 */

// const settings = require('electron-settings');

var opt = ['showMenu', 'showToolbar', 'livePreview', 'syncScroll', 'keepInTray', 'editorTheme', 'editorFont', 'editorFontSize', 'tabSize',  'lineNumbers', 'lineWrapping', 'previewMode', 'previewFont', 'previewFontSize', 'previewLineHeight', 'autoCloseBrackets'];

function getUserSettings() {
    opt.forEach(checkSetting)
}

function checkSetting(item) {
    if(!settings.has(item))
        settings.set(item, config.get(item));
}
