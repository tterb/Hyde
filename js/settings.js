
var opt = ['showMenu', 'showToolbar', 'livePreview', 'syncScroll', 'isFullscreen', 'editorTheme', 'editorFont', 'editorFontSize', 'editorLineHeight', 'dynamicFontSize', 'tabSize',  'lineNumbers', 'lineWrapping', 'showTrailingSpace', 'matchBrackets', 'enableSpellCheck', 'previewMode', 'previewFont', 'previewFontSize', 'previewLineHeight', 'previewFrontMatter', 'keepInTray'];

function getUserSettings() {
    opt.forEach(checkSetting)
}

function checkSetting(item) {
    if(!settings.has(item))
        settings.set(item, config.get(item));
}
