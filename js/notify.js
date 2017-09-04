

function notify(text, type) {
  var title, icon;
  if(type === 'success') {
    title = '<strong>Error: </strong>';
    icon = 'fa fa-check-circle';
  } else if(type === 'info') {
    title = '<strong>Info: </strong>';
    icon = 'fa fa-info-circle';
  } else if(type === 'warning') {
    title = '<strong>Warning: </strong>';
    icon = 'fa fa-exclamation-triangle';
  } else if(type === 'error') {
    title = '<strong>Error: </strong>';
    icon = 'fa fa-exclamation-circle';
    type = 'danger';
  }
  $.notify({
    title: title,
    icon: icon,
    message: text
  },{
    type: type,
    placement: {
      from: "top",
      align: "right"
    },
    offset: 5,
    spacing: 10,
    z_index: 99999,
  });
}

module.exports = notify;
