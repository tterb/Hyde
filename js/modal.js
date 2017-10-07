function createModals() {
	createCustomCSSModal();
	createAboutModal();
	createMarkdownModal();
}

function createAboutModal() {
	var content = '<img id="hydeImg" src="./img/Hyde.png"/>' +
		'<div class="about-content">' +
			'<ul class="about-info">' +
				'<li>Created by <a href="openInBrowser('+'"https://JonSn0w.github.io/"' + ')" id="name">Brett Stevenson</a></li>' +
				'<li>License: <a id="license-modal" href="openInBrowser('+'"http://www.gnu.org/licenses/gpl.txt"'+')">GPL v3.0</a></li>' +
				'<li>Version: <a id="version-modal" href="openInBrowser('+'"https://github.com/JonSn0w/Hyde/releases/latest"'+')">v0.0.1</a></li>' +
				'<li id="check-updates-modal"><a href="openInBrowser("'+'https://github.com/JonSn0w/Hyde/releases/latest"'+')">Check for Updates</a></li>' +
			'</ul>' +
		'</div>';
	$('#about-modal').append(createInsetModal('', content));
}

function createMarkdownModal() {
	var content = '<section class="modal--default__content" id="modal-body-region">' +
		'<table class="markdown-help-content" role="presentation">' +
			'<tr><td id="header">Header</td><td># Header</td></tr>' +
			'<tr><td><strong>Bold</strong></td><td>**Bold**</td></tr>' +
			'<tr><td><i>Italics</i></td><td>*Italics*</td></tr>' +
			'<tr><td><del>Strikethrough</del></td><td>~~Strikethrough~~</td></tr>' +
			'<tr><td><ul><li>Item</li></ul></td><td>* Item</td></tr>' +
			'<tr><td>Blockquote</td><td>&gt; Blockquote</td></tr>' +
			'<tr><td><a href='+packageJSON.repository.url+' target="_rick">Link</a></td><td>[title](http://)</td></tr>' +
			'<tr><td>Image</td><td>![alt](http://)</td></tr>' +
			'<tr><td id="code"><code>code</code></td><td>`code`</td></tr>' +
			'<tr><td id="codeBlock"><pre style="display: inline-block; margin: 12px 0 2px"><code><span class="keyword">var </span>code = <span class="string">"formatted"</span>;</code></pre></td>' +
				'<td style="line-height: 150%">``` <i style="color: rgba(0,0,0,0.5)">(shift+enter for line break)</i><br>var code = "formatted";<br>```</td>' +
			'</tr>' +
			'<tr><td style="font-size:125%;padding:0 17px">L<sup>a</sup>T<sub>e</sub>X</td><td>$LaTeX$</td></tr>' +
			'<tr><td id="emoji"><img src="img/emoji/smile.png" height="27"/></td><td>:smile:' +
      '<tr><td id="icon"><span class="fa fa-github"></span></td><td>@github</td></tr>'
		'</table>' +
	'</section>';
	$('#markdown-modal').append(createInsetModal('Markdown Help', content));
}

function createCustomCSSModal() {
	var content = '<section class="modal--default__content text-input" id="modal-body-region">' +
	'<textarea id="custom-css" rows="17" cols="69" placeholder="Paste your CSS here..." wrap="soft" autofocus></textarea>' +
	'<button id="custom-css-button" class="custom-css-button modal-button" onclick="appendCustomCSS()">Save</button>' + '</section>';
	var modal = createInsetModal('Custom CSS', content);
	$('#custom-css-modal').append(modal);
}

function fillEmojiModal() {
	var content = '<section class="modal--default__content text-input" id="emoji-table"></section>';
	var modal = createInsetModal('Emoji', content);
	$('#emoji-modal').append(modal);
}

function createModal(title, content) {
	var modal = '<div class="modal-dialog bounceInDown animated">' +
		'<div class="modal-content">' +
			'<div class="modal-body">' +
				'<div class="modal-header">' +
					'<button type="button" class="modal-close" data-dismiss="modal"><img class="inactive" src="img/buttons/close.png" alt="Close"/><img class="active" src="img/buttons/close_active.png" alt="Close"/></button>';
	if(title.length > 0)
		modal += '<h4 class="modal-title">'+ title + '</h4>';
	modal += '</div>' + content + '</div></div></div></div>';
	return modal;
}

function createInsetModal(title, content) {
	var modal = '<div class="modal-dialog bounceInDown animated">' +
		'<div class="modal-content modal-inset">' +
			'<div class="modal-header">' +
				'<button type="button" class="modal-close" data-dismiss="modal"><img class="inactive" src="img/buttons/close.png" alt="Close"/><img class="active" src="img/buttons/close_active.png" alt="Close"/></button>' +
				'<h4 class="modal-title">' + title + '</h4>' +
			'</div>' +
			'<div class="modal-body-inset">' + content +
		'</div></div></div>';
	return modal;
}
