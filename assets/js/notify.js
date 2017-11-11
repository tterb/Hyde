// A Set to keep track of active notifications 
let notifications = new Set();

function createNotification(text, type) {
	var head, icon;
	if(type === 'success') {
		head = '<strong>Success </strong>';
		icon = 'fa fa-check-circle';
	} else if(type === 'warning') {
		head = '<strong>Warning </strong>';
    icon = 'fa fa-exclamation-triangle';
	} else if(type === 'error') {
		head = '<strong>Error </strong>';
    icon = 'fa fa-exclamation-circle';
		type = 'danger';
	} else {
		head = '<strong>Info </strong>';
		icon = 'fa fa-info-circle';
	}
	$.notify({
		title: head,
		icon: icon,
		message: text
	},{
		type: type,
		placement: {
			from: 'top',
			align: 'right'
		},
		offset: 4,
		spacing: 6,
		delay: 15000,
		animate: {
			enter: 'animated fadeInRight',
			exit: 'animated fadeOutRight'
		},
		z_index: 99999,
	});
	notifications.add(text);
}

function notify(text, type) {
  if(!notifications.has(text)) {
		createNotification(text, type);
		setTimeout(() => notifications.delete(text), 15000);
	}
}

// Expand truncated alerts on click
$(document).on('click', '.alert', function(e) {
	if($(e.target).hasClass('expand'))
		$(e.target).removeClass('expand');
	else
		$(e.target).addClass('expand');
});

module.exports = notify;
