
function notify(text, type) {
	var head, icon;
	if(type === 'success') {
		head = '<strong>Success </strong>';
		// icon = 'octicon octicon-check';
		icon = 'fa fa-check-circle';
	} else if(type === 'info') {
		head = '<strong>Info </strong>';
		// icon = 'octicon octicon-info';
		icon = 'fa fa-info-circle';
	} else if(type === 'warning') {
		head = '<strong>Warning </strong>';
		// icon = 'octicon octicon-issue-opened';
    icon = 'fa fa-exclamation-circle '
	} else if(type === 'error') {
		head = '<strong>Error </strong>';
		// icon = 'octicon octicon-stop';
    icon = 'fa fa-exclamation-triangle';
		type = 'danger';
	}
	$.notify({
		title: head,
		icon: icon,
		message: text
	},{
		type: type,
		placement: {
			from: "top",
			align: "right"
		},
		offset: 4,
		spacing: 5,
		delay: 1000,
		animate: {
			enter: 'animated fadeInRight',
			exit: 'animated fadeOutUp'
		},
		z_index: 99999,
	});
}

module.exports = notify;
