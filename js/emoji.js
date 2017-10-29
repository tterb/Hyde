
function getEmojis() {
	var list = JSON.parse(fs.readFileSync(path.join(__dirname, 'emoji-list.json'), 'utf8'));
	var emojis = [];
	list.forEach((e) => {
		emojis.push(e);
	});
	return emojis;
}

function fillEmojiModal(type) {
	var table = $('#emoji-table');
	table.empty();
  if(type === undefined) type = 'People';
	getEmojis().forEach((temp) => {
    if(temp.category === type) {
			var div = $('<div>', {'class': 'emoji-list'});
			div.click(() => { insertEmoji(temp.aliases[0]); });
			var img = $('<span>', {'class': 'emoji-'+temp.category, 'alt': temp.emoji, 'title': temp.aliases[0], 'text': temp.emoji });
			div.append(img);
			table.append(div);
    }
	});
}

$(document).on('click', '.category-buttons .button', function(e) {
    if(!$(e.target).hasClass('active')) {
      $('.category-buttons .button').each(function() {
        if($(this).hasClass('active'))
          $(this).removeClass('active');
      });
      $(e.target).addClass('active');
      fillEmojiModal($('.category-buttons .active').val());
    }
  });
