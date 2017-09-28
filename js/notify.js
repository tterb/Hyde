
function notify(text, type) {
	var head, icon;
	if(type === 'success') {
		head = '<strong>Success </strong>';
		icon = 'fa fa-check-circle';
	} else if(type === 'warning') {
		head = '<strong>Warning </strong>';
    icon = 'fa fa-exclamation-circle ';
	} else if(type === 'error') {
		head = '<strong>Error </strong>';
    icon = 'fa fa-exclamation-triangle';
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
		spacing: 5,
		delay: 10000,
		animate: {
			enter: 'animated fadeInRight',
			exit: 'animated fadeOutUp'
		},
		z_index: 99999,
	});
}

module.exports = notify;
