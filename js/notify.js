var octicons = require("octicons");

function notify(text, type) {
  var title, icon;
  if(type === 'success') {
    title = '<strong></strong>';
    icon = 'fa fa-check-circle';
  } else if(type === 'info') {
    title = '<strong>Info: </strong>';
    icon = 'octicon octicon-info';
  } else if(type === 'warning') {
    title = '<strong>Warning: </strong>';
    icon = 'octicon octicon-issue-opened';
  } else if(type === 'error') {
    title = '<strong>Error: </strong>';
    icon = 'octicon octicon-stop';
    type = 'danger';
  }
  $.notify({
    icon: icon,
    message: title+'  '+text
  },{
    type: type,
    placement: {
      from: "top",
      align: "right"
    },
    offset: 4,
    spacing: 5,
    delay: 6000,
    animate: {
      enter: 'animated fadeInRight',
      exit: 'animated fadeOutUp'
    },
    z_index: 99999,
  });
}

module.exports = notify;
